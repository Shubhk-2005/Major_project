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
      <Dropzone id="resume" label="Resume" hint="PDF or DOCX · 1 file" files={files.resume} onFiles={(f) => merge('resume', f, false)} onRemove={(n) => remove('resume', n)} />
      <Dropzone id="sop" label="Statement of purpose" hint="Draft is fine, you'll get feedback" files={files.sop} onFiles={(f) => merge('sop', f, false)} onRemove={(n) => remove('sop', n)} />
      <Dropzone id="lor" label="Letters of recommendation" hint="Up to 3 files" multiple files={files.lor} onFiles={(f) => merge('lor', f.slice(0, 3), true)} onRemove={(n) => remove('lor', n)} />
      <p className="text-[13px] text-ink-3">Documents stay private. They are parsed to score SOP and LOR quality, and are never shared with programs.</p>
    </div>);

}