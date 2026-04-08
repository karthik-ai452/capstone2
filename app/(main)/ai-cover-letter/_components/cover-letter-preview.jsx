"use client";

import React from "react";
import MDEditor from "@uiw/react-md-editor";
import CoverLetterDownloadButton from "@/components/cover-letter-download-button";

const CoverLetterPreview = ({ content, jobTitle, companyName }) => {
  return (
    <div className="py-4">
      <div className="mb-4 flex justify-end">
        <CoverLetterDownloadButton
          content={content}
          jobTitle={jobTitle}
          companyName={companyName}
        />
      </div>
      <MDEditor value={content} preview="preview" height={700} />
    </div>
  );
};

export default CoverLetterPreview;
