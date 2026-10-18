import React from 'react';
import {
  CheckCircle2Icon,
  Trash2Icon,
  Loader2Icon,
  AlertCircleIcon,
  SparklesIcon,
} from 'lucide-react';
import { Dropzone } from '../ui/Dropzone';
import { UploadedFile, VaultDocument } from '../../types/document';

export type UploadKey = 'resume' | 'sop' | 'lor';

interface StepDocumentsProps {
  files: Record<UploadKey, UploadedFile[]>;
  onChange: (key: UploadKey, files: UploadedFile[]) => void;
  existingDocs?: Record<UploadKey, VaultDocument[]>;
  onDeleteExisting?: (docId: string, key: UploadKey) => Promise<void>;
  deletingId?: string | null;
  loadingExisting?: boolean;
}

interface ExistingDocCardProps {
  doc: VaultDocument;
  label: string;
  onDelete?: () => void;
  isDeleting: boolean;
}

function ExistingDocCard({ doc, label, onDelete, isDeleting }: ExistingDocCardProps) {
  return (
    <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/80">
            <CheckCircle2Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-ink-3">
                {label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                Uploaded & Active
              </span>
            </div>
            <p className="mt-1 truncate text-[14px] font-semibold text-ink" title={doc.name}>
              {doc.name}
            </p>
            <p className="text-[12px] text-ink-3">
              {doc.sizeKb ? `${doc.sizeKb} KB` : 'Document'} · Saved in your document vault
            </p>
          </div>
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-red-200 bg-red-50/70 px-3 py-1.5 text-[12.5px] font-medium text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
            title="Delete this document to upload a new version"
          >
            {isDeleting ? (
              <>
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2Icon className="h-3.5 w-3.5" />
                <span>Delete & Replace</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-stone-50 border border-stone-200/70 px-3.5 py-2 text-[12.5px] text-ink-2">
        <span className="font-medium text-ink">Notice:</span>
        <span>
          You have already uploaded this file. If you want to upload a new one, delete this current one first.
        </span>
      </div>
    </div>
  );
}

export function StepDocuments({
  files,
  onChange,
  existingDocs = { resume: [], sop: [], lor: [] },
  onDeleteExisting,
  deletingId,
  loadingExisting = false,
}: StepDocumentsProps) {
  const merge = (key: UploadKey, incoming: UploadedFile[], multiple: boolean) => {
    if (!multiple) return onChange(key, incoming);
    const names = new Set(files[key].map((f) => f.name));
    onChange(key, [...files[key], ...incoming.filter((f) => !names.has(f.name))]);
  };

  const remove = (key: UploadKey, name: string) =>
    onChange(key, files[key].filter((f) => f.name !== name));

  const existingResume = existingDocs.resume?.[0];
  const existingSop = existingDocs.sop?.[0];
  const existingLors = existingDocs.lor || [];

  const totalLors = existingLors.length + files.lor.length;
  const maxLors = 3;

  return (
    <div className="space-y-8">
      {/* AI Extraction Banner */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 p-4.5 text-[13px] text-ink-2 shadow-2xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 mr-2">
          <SparklesIcon className="h-3 w-3" /> Ms AI Extraction
        </span>
        Upload your resume and our Ms AI engine will automatically parse your work experience,
        internships, and research publications to power your competitiveness score.
      </div>

      {loadingExisting && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-white p-3 text-[13px] text-ink-3">
          <Loader2Icon className="h-4 w-4 animate-spin text-accent" />
          Checking previously uploaded documents...
        </div>
      )}

      {/* 1. Resume / CV Section */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-ink">Resume / CV</span>
          <span className="text-[12px] text-ink-3">
            PDF · Work experience & publications auto-extracted
          </span>
        </div>

        {existingResume ? (
          <ExistingDocCard
            doc={existingResume}
            label="Resume / CV"
            onDelete={
              onDeleteExisting
                ? () => onDeleteExisting(existingResume.id, 'resume')
                : undefined
            }
            isDeleting={deletingId === existingResume.id}
          />
        ) : (
          <Dropzone
            id="resume"
            label="Resume / CV"
            hint="PDF · Work experience, publications & internships auto-extracted by AI"
            files={files.resume}
            onFiles={(f) => merge('resume', f, false)}
            onRemove={(n) => remove('resume', n)}
          />
        )}
      </div>

      {/* 2. Statement of Purpose Section */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-ink">Statement of Purpose</span>
          <span className="text-[12px] text-ink-3">
            Draft is fine, you'll receive 8-criteria rubric feedback
          </span>
        </div>

        {existingSop ? (
          <ExistingDocCard
            doc={existingSop}
            label="Statement of Purpose"
            onDelete={
              onDeleteExisting
                ? () => onDeleteExisting(existingSop.id, 'sop')
                : undefined
            }
            isDeleting={deletingId === existingSop.id}
          />
        ) : (
          <Dropzone
            id="sop"
            label="Statement of Purpose"
            hint="Draft is fine, you'll get 8-criteria rubric feedback"
            files={files.sop}
            onFiles={(f) => merge('sop', f, false)}
            onRemove={(n) => remove('sop', n)}
          />
        )}
      </div>

      {/* 3. Letters of Recommendation Section */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-ink">Letters of Recommendation</span>
          <span className="text-[12px] text-ink-3">
            Up to 3 files ({totalLors} / {maxLors} uploaded)
          </span>
        </div>

        {/* Existing uploaded LORs */}
        {existingLors.length > 0 && (
          <div className="space-y-2.5">
            {existingLors.map((lorDoc) => (
              <ExistingDocCard
                key={lorDoc.id}
                doc={lorDoc}
                label="Letter of Recommendation"
                onDelete={
                  onDeleteExisting
                    ? () => onDeleteExisting(lorDoc.id, 'lor')
                    : undefined
                }
                isDeleting={deletingId === lorDoc.id}
              />
            ))}
          </div>
        )}

        {/* Allow uploading additional LORs if under max */}
        {totalLors < maxLors ? (
          <Dropzone
            id="lor"
            label="Add Recommendation Letter"
            hint={`Up to ${maxLors - totalLors} more file(s)`}
            multiple
            files={files.lor}
            onFiles={(f) => merge('lor', f.slice(0, maxLors - existingLors.length), true)}
            onRemove={(n) => remove('lor', n)}
          />
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-stone-50 border border-stone-200/70 p-3 text-[13px] text-ink-2">
            <AlertCircleIcon className="h-4 w-4 shrink-0 text-accent" />
            <span>
              Maximum of 3 recommendation letters reached. To upload a different letter, please delete one above.
            </span>
          </div>
        )}
      </div>

      <p className="text-[13px] text-ink-3">
        Documents stay strictly private. They are parsed to score SOP and profile quality, and are never shared with programs.
      </p>
    </div>
  );
}