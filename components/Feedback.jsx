"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { MessageSquare, Send, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Feedback({
  recommendationId,
  recommendationTitle,
  recommendationType = "recommendation",
}) {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [helpful, setHelpful] = useState(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedText = text.trim();

  const isValid = useMemo(() => {
    return rating > 0 && helpful !== null && trimmedText.length >= 8;
  }, [helpful, rating, trimmedText.length]);

  const resetForm = () => {
    setRating(0);
    setText("");
    setHelpful(null);
    setEmail("");
  };

  const submitFeedback = async () => {
    if (!isValid) {
      toast.error("Please add a rating, helpful vote, and a short comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId || "anonymous-user",
          recommendation_id: recommendationId,
          rating,
          is_helpful: helpful,
          feedback_text: trimmedText,
          email: email.trim(),
          recommendation_title: recommendationTitle,
          recommendation_type: recommendationType,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to submit feedback");
      }

      toast.success("Thanks for the feedback.");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.message || "Could not submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-3 w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          Give Feedback
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Feedback on {recommendationTitle}</DialogTitle>
          <DialogDescription>
            Tell us whether this {recommendationType} was helpful so we can
            improve future recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">Your rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`rounded-md border p-2 transition-colors ${
                    rating >= value
                      ? "border-yellow-400 bg-yellow-50 text-yellow-600"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                  aria-label={`Rate ${value} stars`}
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Was this useful?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHelpful(true)}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  helpful === true
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-border hover:bg-muted"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                Helpful
              </button>
              <button
                type="button"
                onClick={() => setHelpful(false)}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  helpful === false
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-border hover:bg-muted"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                Not helpful
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="feedback-comment">
              What worked or felt off?
            </label>
            <Textarea
              id="feedback-comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: This matched my current level well, but I want more beginner-friendly course suggestions."
              className="min-h-28"
            />
            <p className="text-xs text-muted-foreground">
              Share what made this useful or what you expected instead.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="feedback-email">
              Contact email (optional)
            </label>
            <Input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={submitFeedback} disabled={!isValid || isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
