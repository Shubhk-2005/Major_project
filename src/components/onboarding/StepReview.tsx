import React from 'react';
import { Profile } from '../../types/profile';
import { UploadedFile, VaultDocument } from '../../types/document';
import { UploadKey } from './StepDocuments';
import { computeScore } from '../../utils/scoring';

interface StepReviewProps {
  draft: Profile;
  files: Record<UploadKey, UploadedFile[]>;
  existingDocs?: Record<UploadKey, VaultDocument[]>;
  onEdit: (step: number) => void;
}

export function StepReview({ draft, files, existingDocs, onEdit }: StepReviewProps) {
  const resumeName = files.resume[0]?.name || existingDocs?.resume?.[0]?.name;
  const sopName = files.sop[0]?.name || existingDocs?.sop?.[0]?.name;
  const totalLors = files.lor.length + (existingDocs?.lor?.length || 0);

  const sections = [
  {
    title: 'Academic',
    step: 0,
    rows: [
      ['Institution', draft.undergrad || 'Not specified'],
      ['Standing', draft.institutionTier === 1 ? 'Tier 1 (All IITs & IISc)' : draft.institutionTier === 2 ? 'Tier 2 (All NITs & IIITs)' : 'Tier 3 (Other Colleges / Fr. CRIT)'],
      ['Degree', draft.degree || 'Not specified'],
      ['GPA', `${draft.gpa} / 10`],
      ['Target', `${draft.targetProgram}, ${draft.intake}`]
    ]

  },
  {
    title: 'Tests',
    step: 1,
    rows: [
    ['GRE', `${draft.gre} / 340`],
    ['TOEFL', `${draft.toefl} / 120`]]

  },
  {
    title: 'Documents',
    step: 2,
    rows: [
      ['Resume', resumeName ? `${resumeName}${!files.resume[0] ? ' (saved)' : ''}` : 'Not uploaded'],
      ['SOP', sopName ? `${sopName}${!files.sop[0] ? ' (saved)' : ''}` : 'Not uploaded'],
      ['LORs', totalLors ? `${totalLors} file${totalLors > 1 ? 's' : ''}` : 'Not uploaded']
    ]
  }];


  return (
    <div className="space-y-10">
      {sections.map((s) =>
      <section key={s.title}>
          <div className="flex items-baseline justify-between border-b border-line pb-3">
            <h3 className="font-display text-[18px] font-medium tracking-[-0.02em]">{s.title}</h3>
            <button type="button" onClick={() => onEdit(s.step)} className="rounded-sm text-[13px] font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
              Edit
            </button>
          </div>
          <dl className="divide-y divide-line">
            {s.rows.map(([k, v]) =>
          <div key={k} className="grid grid-cols-[160px_1fr] gap-4 py-3">
                <dt className="text-[14px] text-ink-3">{k}</dt>
                <dd className={`truncate text-[14px] ${v === 'Not uploaded' ? 'text-ink-3' : 'text-ink'}`}>{v}</dd>
              </div>
          )}
          </dl>
        </section>
      )}
      <div className="flex items-baseline justify-between rounded-md border border-line bg-white px-5 py-4">
        <p className="text-[14px] text-ink-2">Preliminary estimate before document analysis</p>
        <p className="font-mono text-[24px] tabular-nums text-ink">{computeScore(draft)}</p>
      </div>
    </div>);

}