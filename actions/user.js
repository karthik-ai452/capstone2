"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { generateAIInsights } from "./dashboard";

// Replace your previous helper with this resilient version:
async function getClerkPrimaryEmail(userId) {
  // Defensive: quick debug info if clerkClient is present or not
  try {
    console.log("getClerkPrimaryEmail: clerkClient keys:", Object.keys(clerkClient || {}));
  } catch (e) {
    console.warn("getClerkPrimaryEmail: clerkClient not iterable", e?.message);
  }

  // 1) Try using clerkClient if it exposes users.getUser()
  try {
    if (typeof clerkClient?.users?.getUser === "function") {
      const clerkUser = await clerkClient.users.getUser(userId);
      const emailObj =
        clerkUser?.emailAddresses?.find((e) => e?.primary || e?.verified) ??
        clerkUser?.emailAddresses?.[0];
      return emailObj?.emailAddress ?? "";
    } else {
      console.warn("getClerkPrimaryEmail: clerkClient.users.getUser not available");
    }
  } catch (err) {
    console.error("getClerkPrimaryEmail: clerkClient.users.getUser failed:", err?.message || err);
    // fall through to REST fallback
  }

  // 2) Fallback: call Clerk REST API directly using server key (CLERK_API_KEY)
  try {
    const clerkKey =
      process.env.CLERK_API_KEY ||
      process.env.CLERK_SECRET_KEY ||
      process.env.CLERK_API_SECRET ||
      process.env.NEXT_PUBLIC_CLERK_API_KEY; // check common names

    if (!clerkKey) {
      console.warn("getClerkPrimaryEmail: no Clerk server key found in env (CLERK_API_KEY)");
      return "";
    }

    const res = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${clerkKey}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("getClerkPrimaryEmail: Clerk REST fetch failed:", res.status, await res.text());
      return "";
    }

    const clerkUser = await res.json();
    const emailObj =
      clerkUser?.email_addresses?.find((e) => e?.primary || e?.verified) ??
      clerkUser?.email_addresses?.[0];
    // email field names differ between SDK and REST shape — handle both
    return emailObj?.email || emailObj?.email_address || emailObj?.emailAddress || "";
  } catch (err) {
    console.error("getClerkPrimaryEmail: fallback REST call failed:", err?.message || err);
    return "";
  }
}



export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  console.log("updateUser called for clerkUserId:", userId, "payload:", JSON.stringify(data));

  // 1) ensure user exists (upsert)
  const email = await getClerkPrimaryEmail(userId);
  const user = await db.user.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      email,
      industry: null,
      experience: 0,
      bio: null,
      skills: [],
    },
    update: {},
  });

  // 2) Create or find an industryInsight inside a transaction using default values
    // 2) Create or find an industryInsight inside a transaction using default values
  let industryInsight;
  try {
    const res = await db.$transaction(
      async (tx) => {
        let i = await tx.industryInsight.findFirst({
          where: { industry: data.industry },
        });

        if (!i) {
          i = await tx.industryInsight.create({
            data: {
              industry: data.industry,

              // 🔹 match your schema exactly
              salaryRanges: [],           // start empty; you can fill with AI later
              growthRate: 0,
              demandLevel: "unknown",
              topSkills: [],

              marketOutlook: "Neutral",   // 👈 REQUIRED string, pick any default ("Unknown"/"Neutral")
              keyTrends: [],

              recommendedSkills: [],

              // lastUpdated has default(now())
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // update user now inside transaction
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight: i };
      },
      { timeout: 10000 }
    );

    // commit succeeded
    revalidatePath("/");
    industryInsight = res.industryInsight;
  } catch (err) {
    console.error("updateUser transaction failed:", err);
    throw err;
  }


  // 3) AFTER commit: call AI and update insight row (outside transaction)
  // This is safe — if AI fails, user update already applied.
  (async () => {
    try {
      console.log("Running generateAIInsights for industry:", data.industry);
      const insights = await generateAIInsights(data.industry);

      await db.industryInsight.update({
        where: { id: industryInsight.id },
        data: {
          salaryRanges: insights.salaryRanges ?? [],
          growthRate: insights.growthRate ?? 0,
          demandLevel: insights.demandLevel ?? "unknown",
          topSkills: insights.topSkills ?? [],

          marketOutlook: insights.marketOutlook ?? "Neutral",
          keyTrends: insights.keyTrends ?? [],

          recommendedSkills: insights.recommendedSkills ?? [],

          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      console.log("AI insight updated for industry:", data.industry);
    } catch (aiErr) {
      console.error("generateAIInsights (post-commit) failed - logged and ignored:", {
        message: aiErr?.message,
        stack: aiErr?.stack,
        status: aiErr?.status || aiErr?.statusText,
        response: aiErr?.response ?? aiErr?.errorDetails ?? undefined,
      });
    }
  })();

  // ✅ STEP 4 — return fresh user
  const freshUser = await db.user.findUnique({ where: { id: user.id } });
  return freshUser;
}


export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // get Clerk email to satisfy required fields on create
    const email = await getClerkPrimaryEmail(userId);

    // Upsert ensures a DB row exists (idempotent, safe). We select only industry.
    const userRecord = await db.user.upsert({
      where: { clerkUserId: userId },
      create: {
        clerkUserId: userId,
        email,
        industry: null,
        experience: 0,
        bio: null,
        skills: [],
      },
      update: {}, // no-op
      select: { industry: true },
    });

    return { isOnboarded: !!userRecord.industry };
  } catch (error) {
    console.error("Error checking onboarding status (upsert):", error);
    throw new Error("Failed to check onboarding status");
  }
}
