import React, { useEffect, useState } from 'react';
import {
  FileTextIcon,
  Loader2Icon,
  Trash2Icon,
  CheckCircle2Icon,
  XIcon,
  SparklesIcon,
  EyeIcon,
  BriefcaseIcon,
  BookOpenIcon,
  AwardIcon,
  CodeIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { Dropzone } from '../ui/Dropzone';
import { initialDocuments } from '../../data/documents';
import { DocumentKind, VaultDocument, UploadedFile } from '../../types/document';
import { formatDate, formatFileSize } from '../../utils/format';
import { api } from '../../services/api';
import { useProfile } from '../../contexts/ProfileContext';

interface DocumentVaultProps {
  onReviewSop: () => void;
}

const kindFilters: ('All' | DocumentKind)[] = ['All', 'SOP', 'LOR', 'Resume', 'Transcript', 'Test report'];

export function DocumentVault({ onReviewSop }: DocumentVaultProps) {
  const [docs, setDocs] = useState<VaultDocument[]>(initialDocuments);
  const [kind, setKind] = useState<'All' | DocumentKind>('All');
  const [uploading, setUploading] = useState(false);
  const [parseMessage, setParseMessage] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<VaultDocument | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const { profile, refreshProfile } = useProfile();

  // Load saved documents from backend
  useEffect(() => {
    async function fetchDocs() {
      const remote = await api.listDocuments();
      if (remote && remote.length > 0) {
        setDocs(remote);
      }
    }
    fetchDocs();
  }, []);

  const addFiles = async (files: UploadedFile[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setParseMessage(null);

    try {
      for (const f of files) {
        const fileKind = inferKind(f.name);
        if (f.rawFile) {
          // Upload real file to FastAPI backend -> Cloudinary -> MongoDB
          try {
            const uploaded = await api.uploadDocument(f.rawFile, fileKind);
            const newDoc: VaultDocument = {
              id: String(uploaded.id),
              name: uploaded.filename,
              kind: fileKind,
              sizeKb: uploaded.size_kb,
              updated: new Date().toISOString().slice(0, 10),
              linkedTo: [],
              status: uploaded.status === 'analyzed' ? 'final' : 'needs review',
              cloudinaryUrl: uploaded.cloudinary_url,
              extractedText: uploaded.extracted_text,
              parsedData: uploaded.parsed_data
            };
            setDocs((prev) => [newDoc, ...prev]);

            // Auto-refresh profile and stacked ML model if Resume was uploaded
            if (fileKind === 'Resume' || uploaded.file_type === 'Resume') {
              await refreshProfile();
              const info = uploaded.parsed_data;
              if (info) {
                setParseMessage(
                  `Resume parsed successfully! Extracted ${info.work_experience_years ?? 0} yrs work experience, ${info.research_publications ?? 0} publications, ${info.internships_count ?? 0} internships. Profile & admission predictions updated!`
                );
              } else {
                setParseMessage('Resume uploaded and applicant profile refreshed.');
              }
            }
            continue;
          } catch (uploadErr) {
            console.warn('Backend upload failed, keeping local copy:', uploadErr);
          }
        }

        // Local fallback
        const localDoc: VaultDocument = {
          id: `u-${Date.now()}`,
          name: f.name,
          kind: fileKind,
          sizeKb: f.size / 1024,
          updated: new Date().toISOString().slice(0, 10),
          linkedTo: [],
          status: 'needs review'
        };
        setDocs((prev) => [localDoc, ...prev]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    const success = await api.deleteDocument(docId);
    if (success) {
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } else {
      // In-memory removal if local mock
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const visible = kind === 'All' ? docs : docs.filter((d) => d.kind === kind);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {parseMessage && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-[14px] text-ink">
            <div className="flex items-center gap-2.5">
              <SparklesIcon className="h-4 w-4 shrink-0 text-accent" />
              <span>{parseMessage}</span>
            </div>
            <button
              onClick={() => setParseMessage(null)}
              className="text-ink-3 hover:text-ink"
              aria-label="Dismiss message"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Extracted Resume Snapshot Banner */}
        {(() => {
          const resumeDoc = docs.find((d) => d.kind === 'Resume' || d.name.toLowerCase().includes('resume'));
          if (!resumeDoc) return null;
          const parsed = resumeDoc.parsedData;
          const expYears = parsed?.work_experience_years ?? (profile.workMonths ? (profile.workMonths / 12).toFixed(1) : 0);
          const expMonths = Math.round(Number(expYears) * 12);
          const pubs = parsed?.research_publications ?? profile.publications ?? 0;
          const interns = parsed?.internships_count ?? profile.internships ?? 0;
          const skills: string[] = parsed?.key_skills ?? [];

          return (
            <div className="mb-6 rounded-xl border border-line bg-gradient-to-br from-white to-canvas/80 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <BriefcaseIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink">Extracted Resume Profile</h3>
                    <p className="text-[12px] text-ink-3">Automatically parsed from {resumeDoc.name} & synced to your admission model</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedResume(resumeDoc)}
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md bg-accent/10 px-3 py-1.5 text-[12px] font-medium text-accent hover:bg-accent/20 transition-colors"
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                  Full Extraction Breakdown
                </button>
              </div>

              {/* Stat Badges */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-line/80 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Work Experience</p>
                  <p className="mt-1 font-mono text-[18px] font-bold text-ink">
                    {expYears} <span className="text-[12px] font-normal text-ink-2">yrs ({expMonths} mo)</span>
                  </p>
                </div>
                <div className="rounded-lg border border-line/80 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Publications</p>
                  <p className="mt-1 font-mono text-[18px] font-bold text-ink">
                    {pubs} <span className="text-[12px] font-normal text-ink-2">paper{Number(pubs) === 1 ? '' : 's'}</span>
                  </p>
                </div>
                <div className="rounded-lg border border-line/80 bg-white p-3 col-span-2 sm:col-span-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Internships</p>
                  <p className="mt-1 font-mono text-[18px] font-bold text-ink">
                    {interns} <span className="text-[12px] font-normal text-ink-2">role{Number(interns) === 1 ? '' : 's'}</span>
                  </p>
                </div>
              </div>

              {/* Skills Tags */}
              {skills && skills.length > 0 && (
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-line/50">
                  <span className="text-[12px] font-medium text-ink-3 mr-1">Skills identified:</span>
                  {skills.slice(0, 7).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-ink-2"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 7 && (
                    <span className="text-[11px] text-ink-3">+{skills.length - 7} more</span>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        <div role="radiogroup" aria-label="Filter by type" className="flex flex-wrap gap-1">
          {kindFilters.map((k) => (
            <button
              key={k}
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={`rounded px-3 py-1.5 text-[13px] transition-colors duration-150 ${
                kind === k ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.04] hover:text-ink'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line text-[12px] text-ink-3">
                <th className="px-4 py-3 font-normal">Document</th>
                <th className="px-4 py-3 font-normal">Used for</th>
                <th className="px-4 py-3 text-right font-normal">Updated</th>
                <th className="px-4 py-3 text-right font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0 hover:bg-canvas/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-[14px] text-ink font-medium">{d.name}</p>
                        <p className="font-mono text-[12px] text-ink-3">
                          {d.kind} · {formatFileSize(d.sizeKb)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3.5 text-[13px] text-ink-2">
                    {d.linkedTo.length ? d.linkedTo.join(', ') : 'Profile & Evaluation'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-[13px] tabular-nums text-ink-2">
                    {formatDate(d.updated)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {d.kind === 'SOP' ? (
                      <button
                        type="button"
                        onClick={onReviewSop}
                        className="inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      >
                        <SparklesIcon className="h-3 w-3" />
                        Critique in SOP Studio
                      </button>
                    ) : d.kind === 'Resume' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedResume(d)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-[12px] font-medium text-accent hover:bg-accent/20 transition-colors focus-visible:outline-none"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        View Extracted Data
                      </button>
                    ) : (
                      <span className={`text-[13px] ${d.status === 'final' ? 'text-ink font-medium' : 'text-ink-3'}`}>
                        {statusLabel(d.status)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
                      className="rounded p-1 text-ink-3 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none"
                      title="Delete document"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="px-6 py-12 text-center text-[14px] text-ink-3">No {kind} documents uploaded yet.</p>
          )}
        </div>

        {/* Modal Dialog for Extracted Resume Details */}
        {selectedResume && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-[620px] rounded-2xl border border-line bg-white p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                    <SparklesIcon className="h-3 w-3" />
                    Ms AI Extracted Metrics
                  </div>
                  <h3 className="mt-2 font-display text-[20px] font-semibold text-ink">
                    {selectedResume.name}
                  </h3>
                  <p className="text-[13px] text-ink-3">
                    Extracted quantitative and technical metrics synced into your applicant profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResume(null);
                    setShowRawText(false);
                  }}
                  className="rounded-lg p-1.5 text-ink-3 hover:bg-stone-100 hover:text-ink transition-colors"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Extracted Stats Grid */}
              {(() => {
                const parsed = selectedResume.parsedData;
                const expYears = parsed?.work_experience_years ?? (profile.workMonths ? (profile.workMonths / 12).toFixed(1) : 0);
                const expMonths = Math.round(Number(expYears) * 12);
                const pubs = parsed?.research_publications ?? profile.publications ?? 0;
                const interns = parsed?.internships_count ?? profile.internships ?? 0;
                const summary = parsed?.summary || 'Parsed candidate profile containing verified technical experience.';
                const skills: string[] = parsed?.key_skills ?? [];

                return (
                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-line bg-canvas/60 p-4 text-center">
                        <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Work Experience</dt>
                        <dd className="mt-1 font-mono text-[22px] font-bold text-ink">{expYears} yrs</dd>
                        <span className="text-[11px] text-ink-3">{expMonths} months</span>
                      </div>
                      <div className="rounded-xl border border-line bg-canvas/60 p-4 text-center">
                        <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Publications</dt>
                        <dd className="mt-1 font-mono text-[22px] font-bold text-ink">{pubs}</dd>
                        <span className="text-[11px] text-ink-3">peer-reviewed</span>
                      </div>
                      <div className="rounded-xl border border-line bg-canvas/60 p-4 text-center">
                        <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Internships</dt>
                        <dd className="mt-1 font-mono text-[22px] font-bold text-ink">{interns}</dd>
                        <span className="text-[11px] text-ink-3">completed roles</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl border border-line bg-white p-4">
                      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">Professional Summary</h4>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{summary}</p>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div>
                        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">Key Skills & Frameworks</h4>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-line bg-canvas px-2.5 py-1 text-[12px] font-medium text-ink"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verification & Sync Notice */}
                    <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-50/50 p-3.5 text-[13px] text-emerald-900">
                      <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        <strong>Synced to Profile:</strong> These metrics are actively used in your Ms AI Competitiveness Score and university portfolio matching.
                      </span>
                    </div>

                    {/* Raw Text Collapsible */}
                    {selectedResume.extractedText && (
                      <div className="border-t border-line pt-4">
                        <button
                          type="button"
                          onClick={() => setShowRawText((v) => !v)}
                          className="flex items-center justify-between w-full text-left text-[13px] font-medium text-ink-2 hover:text-ink"
                        >
                          <span>View Raw Extracted Text from PDF</span>
                          <span className="text-[12px] text-accent">{showRawText ? 'Hide' : 'Show'}</span>
                        </button>
                        {showRawText && (
                          <div className="mt-2.5 max-h-[180px] overflow-y-auto rounded-lg border border-line bg-stone-50 p-3 font-mono text-[11px] leading-relaxed text-ink-2 whitespace-pre-wrap">
                            {selectedResume.extractedText}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResume(null);
                          setShowRawText(false);
                        }}
                        className="rounded-lg bg-ink px-5 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
      <aside className="lg:col-span-4">
        <Dropzone
          id="vault-upload"
          label="Upload documents"
          hint="PDF, DOCX"
          multiple
          files={[]}
          onFiles={addFiles}
        />
        {uploading && (
          <div className="mt-3 flex items-center gap-2 text-[13px] text-ink-2">
            <Loader2Icon className="h-4 w-4 animate-spin text-accent" />
            <span>Uploading & analyzing with Ms AI...</span>
          </div>
        )}
        <div className="mt-4 space-y-2 rounded-lg border border-line bg-canvas p-4 text-[13px] leading-relaxed text-ink-2">
          <div className="flex items-center gap-1.5 font-medium text-ink">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-500/20">
              <SparklesIcon className="h-3 w-3 text-indigo-600" />
              Ms AI
            </span>
            Automated Parsing
          </div>
          <p>
            • <strong>Resumes:</strong> Automatically parsed by Ms AI to extract work experience and research publications, syncing directly into your admission probability.
          </p>
          <p>
            • <strong>SOPs:</strong> Ready for evaluation under the 8-Criteria Graduate Rubric in SOP Studio.
          </p>
        </div>
      </aside>
    </div>
  );
}

function inferKind(name: string): DocumentKind {
  const n = name.toLowerCase();
  if (n.includes('sop') || n.includes('statement') || n.includes('purpose')) return 'SOP';
  if (n.includes('lor') || n.includes('recommendation') || n.includes('letter')) return 'LOR';
  if (n.includes('resume') || n.includes('cv')) return 'Resume';
  if (n.includes('transcript') || n.includes('grades') || n.includes('marksheet')) return 'Transcript';
  if (n.includes('gre') || n.includes('toefl') || n.includes('ielts') || n.includes('score')) return 'Test report';
  return 'Other';
}

function statusLabel(status: VaultDocument['status']): string {
  switch (status) {
    case 'final':
      return 'Final';
    case 'reviewed':
      return 'Reviewed';
    case 'needs review':
    default:
      return 'Needs review';
  }
}