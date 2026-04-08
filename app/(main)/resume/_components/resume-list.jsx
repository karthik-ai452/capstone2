"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteResume } from "@/actions/resume";

export default function ResumeList({ resumes, selectedResumeId }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    try {
      await deleteResume(id);
      toast.success("Resume deleted successfully!");

      if (selectedResumeId === id) {
        router.push("/resume");
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete resume");
    }
  };

  if (!resumes?.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No Resumes Yet</CardTitle>
          <CardDescription>
            Create your first role-specific resume to start building your library.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-sm font-medium">{resumes.length} saved resumes</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep separate versions for each role you apply to.
        </p>
      </div>

      {resumes.map((resume, index) => {
        const isSelected = selectedResumeId === resume.id;

        return (
          <div
            key={resume.id}
            className={`rounded-xl border transition-colors ${
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "bg-background hover:bg-muted/40"
            }`}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      Resume {index + 1}
                    </p>
                    <h3 className="truncate text-base font-semibold">
                      {resume.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {resume.targetRole || "General role"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => router.push(`/resume?resumeId=${resume.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Open
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {resume.title}
                            {resume.targetRole ? ` for ${resume.targetRole}` : ""}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(resume.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Updated {format(new Date(resume.updatedAt), "MMM d, yyyy")}</span>
                  <span>{Math.max(1, Math.ceil(resume.content.length / 900))} page estimate</span>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {resume.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
