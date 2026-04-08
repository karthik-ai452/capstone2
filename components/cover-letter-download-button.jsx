"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function markdownToHtml(markdown = "") {
  const escaped = escapeHtml(markdown);

  return escaped
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");
}

function buildWordDocument(content, jobTitle, companyName) {
  const htmlBody = markdownToHtml(content);

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(jobTitle)} Cover Letter</title>
        <style>
          body {
            font-family: Calibri, Arial, sans-serif;
            margin: 32px;
            line-height: 1.6;
            color: #111827;
          }
          h1, h2, h3 {
            margin-bottom: 12px;
            color: #111827;
          }
          p {
            margin: 0 0 14px 0;
          }
          a {
            color: #1d4ed8;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <p><strong>Role:</strong> ${escapeHtml(jobTitle)}</p>
        <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
        <hr />
        <p>${htmlBody}</p>
      </body>
    </html>
  `;
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function CoverLetterDownloadButton({
  content,
  jobTitle,
  companyName,
  variant = "outline",
  size = "sm",
  className,
}) {
  const handleDownload = () => {
    const docContent = buildWordDocument(content, jobTitle, companyName);
    const blob = new Blob(["\ufeff", docContent], {
      type: "application/msword",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slugify(jobTitle)}-${slugify(companyName)}-cover-letter.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
    >
      <Download className="mr-2 h-4 w-4" />
      Download Word
    </Button>
  );
}
