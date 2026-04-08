import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const rating = Number(body.rating);
    const feedbackText = body.feedback_text?.trim();
    const recommendationId = body.recommendation_id?.trim();
    const userId = body.user_id?.trim();

    if (!userId || !recommendationId) {
      return NextResponse.json(
        { success: false, error: "Missing user or recommendation." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    if (typeof body.is_helpful !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Helpful vote is required." },
        { status: 400 }
      );
    }

    if (!feedbackText || feedbackText.length < 8) {
      return NextResponse.json(
        { success: false, error: "Please enter more detailed feedback." },
        { status: 400 }
      );
    }

    const feedback = await db.feedback.create({
      data: {
        user_id: userId,
        recommendation_id: recommendationId,
        rating,
        is_helpful: body.is_helpful,
        feedback_text: feedbackText,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Could not save feedback." },
      { status: 500 }
    );
  }
}
