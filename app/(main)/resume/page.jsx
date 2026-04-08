import { getResume, getResumes } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import ResumeList from "./_components/resume-list";

export default async function ResumePage({ searchParams }) {
  const params = await searchParams;
  const selectedResumeId = params?.resumeId;
  const resumes = await getResumes();
  const selectedResume = selectedResumeId
    ? await getResume(selectedResumeId)
    : null;

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Saved Resumes</h2>
          <ResumeList
            resumes={resumes}
            selectedResumeId={selectedResume?.id}
          />
        </div>
        <ResumeBuilder
          key={selectedResume?.id || "new-resume"}
          initialResume={selectedResume}
        />
      </div>
    </div>
  );
}
