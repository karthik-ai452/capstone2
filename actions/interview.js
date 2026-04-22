"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildInterviewRecommendations } from "@/lib/interview-recommendations";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function extractJsonPayload(text) {
  const cleanedText = text.replace(/```(?:json)?\n?/gi, "").trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    const objectMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return { questions: JSON.parse(arrayMatch[0]) };
    }

    throw new Error("Quiz response was not valid JSON");
  }
}

function normalizeQuestion(question, index) {
  const prompt =
    typeof question?.question === "string" ? question.question.trim() : "";
  const options = Array.isArray(question?.options)
    ? question.options
        .map((option) => (typeof option === "string" ? option.trim() : ""))
        .filter(Boolean)
    : [];
  const correctAnswer =
    typeof question?.correctAnswer === "string"
      ? question.correctAnswer.trim()
      : "";
  const explanation =
    typeof question?.explanation === "string"
      ? question.explanation.trim()
      : "";

  if (!prompt) {
    throw new Error(`Question ${index + 1} is missing its prompt`);
  }

  if (options.length !== 4) {
    throw new Error(`Question ${index + 1} does not have exactly 4 options`);
  }

  if (!correctAnswer || !options.includes(correctAnswer)) {
    throw new Error(
      `Question ${index + 1} is missing a valid correct answer from its options`
    );
  }

  return {
    question: prompt,
    options,
    correctAnswer,
    explanation: explanation || "Review the underlying concept and try again.",
  };
}

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    const response = result.response;
    const text = response.text();
    const quiz = extractJsonPayload(text);

    if (!Array.isArray(quiz?.questions) || quiz.questions.length === 0) {
      throw new Error("Quiz response did not include any questions");
    }

    return quiz.questions.slice(0, 10).map(normalizeQuestion);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const recommendations = buildInterviewRecommendations({
      questionResults,
      quizScore: score,
      userSkills: user.skills ?? [],
      industry: user.industry ?? "",
    });

    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return {
      ...assessment,
      recommendationSummary: recommendations,
    };
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments.map((assessment) => ({
      ...assessment,
      recommendationSummary: buildInterviewRecommendations({
        questionResults: assessment.questions,
        quizScore: assessment.quizScore,
        userSkills: user.skills ?? [],
        industry: user.industry ?? "",
      }),
    }));
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
