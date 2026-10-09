import React, { useState } from 'react';
import { FileTextIcon } from 'lucide-react';
import { Dropzone } from '../ui/Dropzone';
import { initialDocuments } from '../../data/documents';
import { DocumentKind, VaultDocument } from '../../types/document';
import { formatDate, formatFileSize } from '../../utils/format';

interface DocumentVaultProps {
  onReviewSop: () => void;
}

const kindFilters: ('All' | DocumentKind)[] = ['All', 'SOP', 'LOR', 'Resume', 'Transcript', 'Test report'];

export function DocumentVault({ onReviewSop }: DocumentVaultProps) {
  const [docs, setDocs] = useState<VaultDocument[]>(initialDocuments);
  const [kind, setKind] = useState<'All' | DocumentKind>('All');

  const addFiles = (files: {name: string;size: number;}[]) => {
    const added = files.map<VaultDocument>((f, i) => ({
      id: `u-${Date.now()}-${i}`,
      name: f.name,
      kind: inferKind(f.name),
      sizeKb: f.size / 1024,
      updated: '2026-09-25',
      linkedTo: [],
      status: 'needs review'
    }));
    setDocs((d) => [...added, ...d]);
  };

  const visible = kind === 'All' ? docs : docs.filter((d) => d.kind === kind);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div role="radiogroup" aria-label="Filter by type" className="flex flex-wrap gap-1">
          {kindFilters.map((k) =>
          <button
            key={k}
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={`rounded px-3 py-1.5 text-[13px] transition-colors duration-150 ${kind === k ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.04] hover:text-ink'}`}>
            
              {k}
            </button>
          )}
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line text-[12px] text-ink-3">
                <th className="px-4 py-3 font-normal">Document</th>
                <th className="px-4 py-3 font-normal">Used for</th>
                <th className="px-4 py-3 text-right font-normal">Updated</th>
                <th className="px-4 py-3 text-right font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((d) =>
              <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-[14px] text-ink">{d.name}</p>
                        <p className="font-mono text-[12px] text-ink-3">
                          {d.kind} · {formatFileSize(d.sizeKb)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3.5 text-[13px] text-ink-2">{d.linkedTo.length ? d.linkedTo.join(', ') : '—'}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-[13px] tabular-nums text-ink-2">{formatDate(d.updated)}</td>
                  <td className="px-4 py-3.5 text-right">
                    {d.kind === 'SOP' && d.status === 'needs review' ?
                  <button type="button" onClick={onReviewSop} className="rounded-sm text-[13px] font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
                        Review feedback
                      </button> :

                  <span className={`text-[13px] ${d.status === 'final' ? 'text-ink' : 'text-ink-3'}`}>{statusLabel(d.status)}</span>
                  }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {visible.length === 0 && <p className="px-6 py-12 text-center text-[14px] text-ink-3">No {kind} documents yet.</p>}
        </div>
      </div>
      <aside className="lg:col-span-4">
        <Dropzone id="vault-upload" label="Upload documents" hint="PDF, DOCX" multiple files={[]} onFiles={addFiles} />
        <p className="mt-4 text-[13px] leading-relaxed text-ink-3">SOPs and LORs are analyzed on upload. Feedback feeds your SOP and letter factors in the score breakdown.</p>
      </aside>
    </div>);

}

function inferKind(name: string): DocumentKind {
  const n = name.toLowerCase();
  if (n.includes('sop') || n.includes('statement')) return 'SOP';
  if (n.includes('lor') || n.includes('recommend')) return 'LOR';
  if (n.includes('resume') || n.includes('cv')) return 'Resume';
  if (n.includes('transcript')) return 'Transcript';
  if (n.includes('gre') || n.includes('toefl') || n.includes('ielts')) return 'Test report';
  return 'Other';
}

function statusLabel(s: VaultDocument['status']): string {
  if (s === 'final') return 'Final';
  if (s === 'reviewed') return 'Reviewed';
  return 'Needs review';
}