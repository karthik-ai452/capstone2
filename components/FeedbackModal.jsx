"use client";

import Feedback from "./Feedback";

export default function FeedbackModal({
  recommendationId = "career",
  recommendationTitle = "Recommendation",
  recommendationType = "recommendation",
}) {
  return (
    <Feedback
      recommendationId={recommendationId}
      recommendationTitle={recommendationTitle}
      recommendationType={recommendationType}
    />
  );
}
