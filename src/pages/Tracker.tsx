import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, ChevronRightIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { TierBadge } from '../components/ui/TierBadge';
import { FitReasons } from '../components/ui/FitReasons';
import { Button } from '../components/ui/Button';
import { useApplications } from '../contexts/ApplicationsContext';
import { useProfile } from '../contexts/ProfileContext';
import { daysUntil, formatDate } from '../utils/format';
import { countTiers } from '../utils/scoring';
import { DocKey, DocStatus, Stage } from '../types/application';

const docColumns: {key: DocKey;label: string;}[] = [
{ key: 'sop', label: 'SOP' },
{ key: 'lor1', label: 'LOR 1' },
{ key: 'lor2', label: 'LOR 2' },
{ key: 'lor3', label: 'LOR 3' },
{ key: 'transcript', label: 'Transcript' },
{ key: 'resume', label: 'Resume' }];


const stages: {value: Stage;label: string;}[] = [
{ value: 'shortlisted', label: 'Shortlisted' },
{ value: 'preparing', label: 'Preparing' },
{ value: 'submitted', label: 'Submitted' },
{ value: 'decision', label: 'Decision' }];


const nextStatus: Record<DocStatus, DocStatus> = { missing: 'draft', draft: 'final', final: 'missing' };

export function Tracker() {
  const { applications, updateApplication } = useApplications();
  const { ranked } = useProfile();
  const [filter, setFilter] = useState<'all' | Stage>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
    applications.
    map((a) => ({ app: a, ranked: ranked.find((r) => r.university.id === a.universityId), days: daysUntil(a.deadline) })).
    filter((r) => r.ranked && (filter === 'all' || r.app.stage === filter)).
    sort((x, y) => x.days - y.days),
    [applications, ranked, filter]
  );

  const tracked = ranked.filter((r) => applications.some((a) => a.universityId === r.university.id));
  const mix = countTiers(tracked);
  const outstanding = applications.filter((a) => a.stage !== 'submitted' && a.stage !== 'decision').reduce((n, a) => n + Object.values(a.docs).filter((s) => s !== 'final').length, 0);
  const dueSoon = applications.filter((a) => a.stage !== 'submitted' && a.stage !== 'decision' && daysUntil(a.deadline) <= 90).length;

  return (
    <div>
      <PageHeader
        title="Application tracker"
        description={
        <>
            <span className="font-mono tabular-nums text-ink">{applications.length}</span> applications ·{' '}
            <span className="font-mono tabular-nums text-ink">{dueSoon}</span> due in the next 90 days ·{' '}
            <span className="font-mono tabular-nums text-ink">{outstanding}</span> documents outstanding
          </>
        }
        actions={
        <Button variant="secondary" to="/app/explorer">
            Add program
          </Button>
        } />
      

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="radiogroup" aria-label="Filter by stage" className="flex flex-wrap gap-1">
          {[{ value: 'all' as const, label: 'All' }, ...stages].map((s) =>
          <button
            key={s.value}
            role="radio"
            aria-checked={filter === s.value}
            onClick={() => setFilter(s.value)}
            className={`rounded px-3 py-1.5 text-[13px] transition-colors duration-150 ${filter === s.value ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.04] hover:text-ink'}`}>
            
              {s.label}
            </button>
          )}
        </div>
        <Link to="/app/recommendations" className="group inline-flex items-center gap-3 text-[13px] text-ink-2 hover:text-ink">
          Your list:
          <span className="font-mono tabular-nums">
            <span className="text-target">{mix.target}T</span> · <span className="text-consider">{mix.consider}C</span> · <span className="text-reach">{mix.reach}R</span>
          </span>
          <span className="text-accent">Check strategy</span>
          <ArrowRightIcon className="h-3.5 w-3.5 text-accent" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-5 text-[12px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <DocGlyph status="missing" /> Missing
        </span>
        <span className="flex items-center gap-1.5">
          <DocGlyph status="draft" /> Draft
        </span>
        <span className="flex items-center gap-1.5">
          <DocGlyph status="final" /> Final
        </span>
        <span className="hidden sm:inline">Click a document to update it.</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[1000px] text-left">
          <thead>
            <tr className="border-b border-line text-[12px] text-ink-3">
              <th className="w-8 px-2 py-3" aria-label="Expand" />
              <th className="px-3 py-3 font-normal">Program</th>
              <th className="px-3 py-3 font-normal">Stage</th>
              <th className="px-3 py-3 font-normal">Deadline</th>
              {docColumns.map((d) =>
              <th key={d.key} className="px-2 py-3 text-center font-normal">
                  {d.label}
                </th>
              )}
              <th className="px-4 py-3 text-right font-normal">Ready</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ app, ranked: r, days }) => {
              if (!r) return null;
              const ready = Object.values(app.docs).filter((s) => s === 'final').length;
              const open = openId === app.id;
              const urgent = days <= 30 && app.stage !== 'submitted' && app.stage !== 'decision';
              return (
                <React.Fragment key={app.id}>
                  <tr className="border-b border-line">
                    <td className="px-2 py-4">
                      <button type="button" onClick={() => setOpenId(open ? null : app.id)} aria-expanded={open} aria-label={`Details for ${r.university.name}`} className="rounded-sm p-1 text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
                        <ChevronRightIcon className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                      </button>
                    </td>
                    <td className="px-3 py-4">
                      <p className="text-[14px] font-medium">{r.university.name}</p>
                      <div className="mt-1">
                        <TierBadge tier={r.fit.tier} fit={r.fit.fit} />
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <label htmlFor={`stage-${app.id}`} className="sr-only">
                        Stage
                      </label>
                      <select
                        id={`stage-${app.id}`}
                        value={app.stage}
                        onChange={(e) => updateApplication(app.id, { stage: e.target.value as Stage })}
                        className="h-8 rounded-sm border border-line bg-white px-2 text-[13px] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15">
                        
                        {stages.map((s) =>
                        <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        )}
                      </select>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-mono text-[13px] tabular-nums">{formatDate(app.deadline)}</p>
                      <p className={`font-mono text-[12px] tabular-nums ${urgent ? 'text-accent' : 'text-ink-3'}`}>{days >= 0 ? `${days}d left` : 'Passed'}</p>
                    </td>
                    {docColumns.map((d) =>
                    <td key={d.key} className="px-2 py-4 text-center">
                        <button
                        type="button"
                        onClick={() => updateApplication(app.id, { docs: { ...app.docs, [d.key]: nextStatus[app.docs[d.key]] } })}
                        aria-label={`${d.label}: ${app.docs[d.key]}. Change status.`}
                        className="rounded-sm p-1.5 transition-transform duration-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
                        
                          <DocGlyph status={app.docs[d.key]} />
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-line" aria-hidden>
                          <div className="h-full bg-ink transition-[width] duration-200 ease-out" style={{ width: `${ready / 6 * 100}%` }} />
                        </div>
                        <span className="font-mono text-[13px] tabular-nums">{ready}/6</span>
                      </div>
                    </td>
                  </tr>
                  {open &&
                  <tr className="border-b border-line bg-canvas">
                      <td />
                      <td colSpan={10} className="px-3 py-5">
                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="md:col-span-2">
                            <p className="text-[12px] text-ink-3">Why this is a {r.fit.tier}</p>
                            <div className="mt-2">
                              <FitReasons reasons={r.fit.reasons} limit={3} />
                            </div>
                          </div>
                          <div>
                            <p className="text-[12px] text-ink-3">Notes</p>
                            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{app.note}</p>
                            <p className="mt-3 font-mono text-[12px] text-ink-3">Application fee ${app.fee}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                </React.Fragment>);

            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-6 py-16 text-center text-[14px] text-ink-3">No applications at this stage.</p>}
      </div>
    </div>);

}

function DocGlyph({ status }: {status: DocStatus;}) {
  if (status === 'final')
  return (
    <span className="inline-grid h-4 w-4 place-items-center rounded-sm bg-ink text-white">
        <CheckIcon className="h-3 w-3" strokeWidth={2.5} />
      </span>);

  if (status === 'draft')
  return (
    <span className="relative inline-block h-4 w-4 overflow-hidden rounded-sm border border-ink-2 bg-white">
        <span className="absolute inset-y-0 left-0 w-1/2 bg-ink-2" />
      </span>);

  return <span className="inline-block h-4 w-4 rounded-sm border border-dashed border-line-strong" />;
}