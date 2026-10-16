import React from 'react';
import { Dropzone } from '../ui/Dropzone';
import { UploadedFile } from '../../types/document';

export type UploadKey = 'resume' | 'sop' | 'lor';

interface StepDocumentsProps {
  files: Record<UploadKey, UploadedFile[]>;
  onChange: (key: UploadKey, files: UploadedFile[]) => void;
}

export function StepDocuments({ files, onChange }: StepDocumentsProps) {
  const merge = (key: UploadKey, incoming: UploadedFile[], multiple: boolean) => {
    if (!multiple) return onChange(key, incoming);
    const names = new Set(files[key].map((f) => f.name));
    onChange(key, [...files[key], ...incoming.filter((f) => !names.has(f.name))]);
  };
  const remove = (key: UploadKey, name: string) => onChange(key, files[key].filter((f) => f.name !== name));

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-indigo-500/20 bg-indigo-50/50 p-4 text-[13px] text-ink-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 mr-1.5">
          ✨ Ms AI Extraction
        </span>
        Upload your resume and our Ms AI engine will automatically extract your work experience, internships, and research publications to power your competitiveness score.
      </div>
      <Dropzone id="resume" label="Resume / CV" hint="PDF · Work experience, publications & internships auto-extracted by AI" files={files.resume} onFiles={(f) => merge('resume', f, false)} onRemove={(n) => remove('resume', n)} />
      <Dropzone id="sop" label="Statement of purpose" hint="Draft is fine, you'll get 8-criteria rubric feedback" files={files.sop} onFiles={(f) => merge('sop', f, false)} onRemove={(n) => remove('sop', n)} />
      <Dropzone id="lor" label="Letters of recommendation" hint="Up to 3 files" multiple files={files.lor} onFiles={(f) => merge('lor', f.slice(0, 3), true)} onRemove={(n) => remove('lor', n)} />
      <p className="text-[13px] text-ink-3">Documents stay private. They are parsed to score SOP and profile quality, and are never shared with programs.</p>
    </div>);

}