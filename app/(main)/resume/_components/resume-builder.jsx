"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Download,
  Edit,
  FilePlus2,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import { CertificationForm } from "./certification-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { resumeSchema } from "@/app/lib/schema";
import {
  buildResumeFromTemplate,
  RESUME_TEMPLATES,
} from "@/lib/resume-templates";

function extractFullNameFromContent(content, fallback = "") {
  if (!content) return fallback;

  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function getDefaultResumeFormValues(initialResume) {
  const savedFormData = initialResume?.formData || {};

  return {
    resumeTitle: initialResume?.title || savedFormData.resumeTitle || "",
    fullName:
      savedFormData.fullName ||
      extractFullNameFromContent(initialResume?.content, ""),
    targetRole: initialResume?.targetRole || savedFormData.targetRole || "",
    contactInfo: savedFormData.contactInfo || {},
    summary: savedFormData.summary || "",
    skills: savedFormData.skills || "",
    experience: savedFormData.experience || [],
    education: savedFormData.education || [],
    projects: savedFormData.projects || [],
    certifications: savedFormData.certifications || [],
    achievements: savedFormData.achievements || "",
    additionalInfo: savedFormData.additionalInfo || "",
  };
}

export default function ResumeBuilder({ initialResume }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialResume ? "preview" : "edit");
  const [previewContent, setPreviewContent] = useState(initialResume?.content || "");
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialResume?.formData?.selectedTemplate || "classic"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isUsingSavedContent, setIsUsingSavedContent] = useState(
    Boolean(initialResume?.content)
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: getDefaultResumeFormValues(initialResume),
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();
  const fullName = formValues.fullName?.trim() || "Your Name";
  const isLegacyResume = Boolean(initialResume?.id && !initialResume?.formData);
  const shouldSyncTemplatePreview =
    activeTab === "edit" || resumeMode === "preview";

  const getCombinedContent = () =>
    buildResumeFromTemplate(
      selectedTemplate,
      formValues,
      fullName
    );

  const buildTemplateContent = (templateId = selectedTemplate) =>
    buildResumeFromTemplate(
      templateId,
      formValues,
      fullName
    );

  useEffect(() => {
    reset(getDefaultResumeFormValues(initialResume));

    setPreviewContent(initialResume?.content || "");
    setActiveTab(initialResume ? "preview" : "edit");
    setResumeMode("preview");
    setSelectedTemplate(initialResume?.formData?.selectedTemplate || "classic");
    setLastSavedAt(initialResume?.updatedAt ? new Date(initialResume.updatedAt) : null);
    setIsUsingSavedContent(Boolean(initialResume?.content));
  }, [initialResume, reset]);

  useEffect(() => {
    if (shouldSyncTemplatePreview && !isUsingSavedContent) {
      setPreviewContent(getCombinedContent());
    }
  }, [
    formValues,
    selectedTemplate,
    fullName,
    shouldSyncTemplatePreview,
    isUsingSavedContent,
  ]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
      setLastSavedAt(new Date());
      if (!initialResume?.id && saveResult.id) {
        router.replace(`/resume?resumeId=${saveResult.id}`);
      } else {
        router.refresh();
      }
    }

    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving, initialResume?.id, router]);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const { default: html2pdf } = await import(
        "html2pdf.js/dist/html2pdf.min.js"
      );
      const element = document.getElementById("resume-pdf");
      const opt = {
        margin: [15, 15],
        filename: `${formValues.resumeTitle || "resume"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    await saveResumeFn({
      id: initialResume?.id,
      title: data.resumeTitle,
      targetRole: data.targetRole,
      content: previewContent,
      formData: {
        ...data,
        selectedTemplate,
      },
    });
  };

  const handleSave = async () => {
    if (isLegacyResume && activeTab === "preview") {
      await saveResumeFn({
        id: initialResume.id,
        title: formValues.resumeTitle || initialResume.title,
        targetRole: formValues.targetRole || initialResume.targetRole,
        content: previewContent,
      });
      return;
    }

    await handleSubmit(onSubmit)();
  };

  const handleCreateNew = () => {
    setLastSavedAt(null);
    setIsUsingSavedContent(false);
    reset({
      resumeTitle: "",
      fullName: "",
      targetRole: "",
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: "",
      additionalInfo: "",
    });
    setPreviewContent("");
    setActiveTab("edit");
    setResumeMode("preview");
    router.push("/resume");
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    setIsUsingSavedContent(false);
    setPreviewContent(buildTemplateContent(templateId));
    if (activeTab === "preview") {
      setResumeMode("preview");
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div>
          <h1 className="font-bold gradient-title text-5xl md:text-6xl">
            Resume Builder
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSaving
              ? "Saving..."
              : lastSavedAt
                ? `Saved ${lastSavedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Save when you're ready"}
          </p>
          {initialResume?.title && (
            <p className="text-muted-foreground">
              Editing: {initialResume.title}
              {initialResume.targetRole ? ` for ${initialResume.targetRole}` : ""}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCreateNew}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            New Resume
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
        <div>
          <h2 className="text-lg font-medium">Templates</h2>
          <p className="text-sm text-muted-foreground">
            Pick from four resume layouts, including three new styles.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {RESUME_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateChange(template.id)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                selectedTemplate === template.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "bg-background hover:bg-muted"
              }`}
            >
              <div
                className={`mb-3 rounded-md border bg-gradient-to-br p-3 text-xs text-muted-foreground ${template.accent}`}
              >
                <div className="space-y-1">
                  <div className="h-2 w-2/3 rounded-full bg-foreground/70" />
                  <div className="h-2 w-full rounded-full bg-foreground/20" />
                  <div className="h-2 w-5/6 rounded-full bg-foreground/20" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{template.name}</p>
                {selectedTemplate === template.id && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {template.description}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {template.preview}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name *</label>
                <Input
                  {...register("fullName")}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Resume Name *</label>
                <Input
                  {...register("resumeTitle")}
                  placeholder="Frontend Resume"
                />
                {errors.resumeTitle && (
                  <p className="text-sm text-red-500">
                    {errors.resumeTitle.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Role</label>
                <Input
                  {...register("targetRole")}
                  placeholder="Frontend Developer"
                />
                {errors.targetRole && (
                  <p className="text-sm text-red-500">
                    {errors.targetRole.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills *</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Certifications</h3>
              <Controller
                name="certifications"
                control={control}
                render={({ field }) => (
                  <CertificationForm
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Achievements</h3>
              <Controller
                name="achievements"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder={"Examples:\n- Increased conversion by 18% through UI improvements\n- Won 1st place in college hackathon"}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              <Controller
                name="additionalInfo"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder={"Add anything else you want on the resume, such as languages, volunteering, interests, or publications."}
                  />
                )}
              />
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode((currentMode) => {
                  const nextMode = currentMode === "preview" ? "edit" : "preview";
                  if (nextMode === "edit") {
                    setIsUsingSavedContent(false);
                  }
                  return nextMode;
                })
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
              previewOptions={{
                className: "resume-markdown",
              }}
            />
          </div>
          <div className="hidden">
            <div id="resume-pdf">
              <MDEditor.Markdown
                source={previewContent}
                className="resume-markdown"
                style={{
                  background: "white",
                  color: "black",
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
