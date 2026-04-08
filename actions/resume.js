"use server";

import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const globalForResumePool = globalThis;

const resumePool =
  globalForResumePool.__resume_pg_pool__ ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV === "development") {
  globalForResumePool.__resume_pg_pool__ = resumePool;
}

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

export async function saveResume({ id, title, targetRole, content }) {
  const user = await getAuthenticatedUser();

  try {
    const payload = {
      title: title?.trim() || "General Resume",
      targetRole: targetRole?.trim() || null,
      content,
    };

    let resume;

    if (id) {
      const existingResume = await resumePool.query(
        `SELECT *
         FROM "Resume"
         WHERE "id" = $1 AND "userId" = $2
         LIMIT 1`,
        [id, user.id]
      );

      if (!existingResume.rows.length) {
        throw new Error("Resume not found");
      }

      const updated = await resumePool.query(
        `UPDATE "Resume"
         SET
           "title" = $1,
           "targetRole" = $2,
           "content" = $3,
           "updatedAt" = NOW()
         WHERE "id" = $4 AND "userId" = $5
         RETURNING *`,
        [payload.title, payload.targetRole, payload.content, id, user.id]
      );
      resume = updated.rows[0];
    } else {
      const newResumeId = randomUUID();
      const created = await resumePool.query(
        `INSERT INTO "Resume" ("id", "userId", "title", "targetRole", "content", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [newResumeId, user.id, payload.title, payload.targetRole, payload.content]
      );
      resume = created.rows[0];
    }

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error(error?.message || "Failed to save resume");
  }
}

export async function getResumes() {
  const user = await getAuthenticatedUser();

  const result = await resumePool.query(
    `SELECT *
     FROM "Resume"
     WHERE "userId" = $1
     ORDER BY "updatedAt" DESC`,
    [user.id]
  );

  return result.rows;
}

export async function getResume(id) {
  const user = await getAuthenticatedUser();

  if (!id) return null;

  const result = await resumePool.query(
    `SELECT *
     FROM "Resume"
     WHERE "id" = $1 AND "userId" = $2
     LIMIT 1`,
    [id, user.id]
  );

  return result.rows[0] || null;
}

export async function deleteResume(id) {
  const user = await getAuthenticatedUser();

  const existingResume = await resumePool.query(
    `SELECT *
     FROM "Resume"
     WHERE "id" = $1 AND "userId" = $2
     LIMIT 1`,
    [id, user.id]
  );

  if (!existingResume.rows.length) {
    throw new Error("Resume not found");
  }

  const deleted = await resumePool.query(
    `DELETE FROM "Resume"
     WHERE "id" = $1 AND "userId" = $2
     RETURNING *`,
    [id, user.id]
  );

  return deleted.rows[0];
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}
