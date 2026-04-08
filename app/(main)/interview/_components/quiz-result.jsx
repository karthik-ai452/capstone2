"use client";

import {
  Trophy,
  CheckCircle2,
  XCircle,
  BookOpen,
  BriefcaseBusiness,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Feedback from "@/components/Feedback";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  const recommendationSummary = result.recommendationSummary || {};
  const strongerSkills = recommendationSummary.strongerSkills || [];
  const improvementSkills = recommendationSummary.improvementSkills || [];
  const recommendedCourses = recommendationSummary.recommendedCourses || [];
  const recommendedJobs = recommendationSummary.recommendedJobs || [];
  const hasRecommendations =
    recommendedCourses.length > 0 || recommendedJobs.length > 0;

  return (
    <div className="mx-auto">
      <h1 className="flex items-center gap-2 text-3xl gradient-title">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Quiz Results
      </h1>

      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">
            {result.quizScore.toFixed(1)}%
          </h3>
          <Progress value={result.quizScore} className="w-full" />
        </div>

        {result.improvementTip && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">Improvement Tip:</p>
            <p className="text-muted-foreground">{result.improvementTip}</p>
          </div>
        )}

        {hasRecommendations && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-amber-50/80 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-700" />
                <h2 className="text-lg font-semibold text-amber-900">
                  Skills to Improve
                </h2>
              </div>

              {improvementSkills.length > 0 ? (
                <p className="mb-3 text-sm text-amber-900/80">
                  Focus next on {improvementSkills.join(", ")}.
                </p>
              ) : (
                <p className="mb-3 text-sm text-amber-900/80">
                  You did well overall, but these courses can still help deepen
                  your fundamentals.
                </p>
              )}

              {recommendedCourses.length > 0 ? (
                <div className="space-y-3">
                  {recommendedCourses.map((course) => (
                    <div
                      key={`${course.skill}-${course.provider}-${course.title}-${course.url}`}
                      className="block rounded-md border border-amber-200 bg-white p-3 transition-colors hover:bg-amber-100/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {course.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {course.skill} via {course.provider}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {course.reason}
                          </p>
                        </div>
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Open ${course.title}`}
                        >
                          <ExternalLink className="mt-1 h-4 w-4 shrink-0" />
                        </a>
                      </div>
                      <Feedback
                        recommendationId={`course-${course.provider}-${course.skill}-${course.title}`}
                        recommendationTitle={course.title}
                        recommendationType="course"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No course recommendations were generated for this attempt.
                </p>
              )}
            </div>

            <div className="rounded-lg border bg-emerald-50/80 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-semibold text-emerald-900">
                  LinkedIn Job Matches
                </h2>
              </div>

              {strongerSkills.length > 0 ? (
                <p className="mb-3 text-sm text-emerald-900/80">
                  Your stronger skills in this quiz were{" "}
                  {strongerSkills.join(", ")}.
                </p>
              ) : (
                <p className="mb-3 text-sm text-emerald-900/80">
                  As your accuracy improves, we will surface more targeted job
                  matches here.
                </p>
              )}

              {recommendedJobs.length > 0 ? (
                <div className="space-y-3">
                  {recommendedJobs.map((job) => (
                    <div
                      key={`${job.skill}-${job.title}-${job.url}`}
                      className="block rounded-md border border-emerald-200 bg-white p-3 transition-colors hover:bg-emerald-100/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {job.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Best matched with {job.skill}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {job.reason}
                          </p>
                        </div>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Open ${job.title} on LinkedIn`}
                        >
                          <ExternalLink className="mt-1 h-4 w-4 shrink-0" />
                        </a>
                      </div>
                      <Feedback
                        recommendationId={`job-${job.skill}-${job.title}`}
                        recommendationTitle={job.title}
                        recommendationType="job"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Keep improving your quiz accuracy to unlock job suggestions.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-medium">Question Review</h3>

          {result.questions?.map((q, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{q.question}</p>

                {q.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Your answer: {q.userAnswer}</p>
                {!q.isCorrect && <p>Correct answer: {q.answer}</p>}
              </div>

              <div className="text-sm bg-muted p-2 rounded">
                <p className="font-medium">Explanation:</p>
                <p>{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {!hideStartNew && (
        <CardFooter>
          <Button onClick={onStartNew} className="w-full">
            Start New Quiz
          </Button>
        </CardFooter>
      )}
    </div>
  );
}
