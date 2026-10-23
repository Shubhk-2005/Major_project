import React, { useCallback, useMemo, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, SearchIcon, SlidersHorizontalIcon, SparklesIcon, Loader2Icon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SelectField } from '../components/ui/SelectField';
import { RangeField } from '../components/ui/RangeField';
import { TierBadge } from '../components/ui/TierBadge';
import { Button } from '../components/ui/Button';
import { UniversityDrawer } from '../components/explorer/UniversityDrawer';
import { useProfile } from '../contexts/ProfileContext';
import { universities } from '../data/universities';
import { formatUSD } from '../utils/format';
import { RankedUniversity, Tier } from '../types/university';
import { api } from '../services/api';

type SortKey = 'fit' | 'rank' | 'acceptance' | 'avgGre' | 'tuition' | 'living';

const MAX_TUITION = 65000;
const MAX_LIVING = 30000;

const SAMPLE_AI_QUERIES = [
  "Top universities for robotics and autonomous systems",
  "High co-op internship placement in tech hubs",
  "World-leading NLP and foundational AI research labs",
  "Affordable tuition with high acceptance rate"
];

export function Explorer() {
  const { ranked } = useProfile();
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [course, setCourse] = useState('all');
  const [maxRank, setMaxRank] = useState('all');
  const [tier, setTier] = useState<'all' | Tier>('all');
  const [maxTuition, setMaxTuition] = useState(MAX_TUITION);
  const [maxLiving, setMaxLiving] = useState(MAX_LIVING);
  const [showBudget, setShowBudget] = useState(false);
  const [sort, setSort] = useState<{key: SortKey;dir: 'asc' | 'desc';}>({ key: 'fit', dir: 'desc' });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ChromaDB AI Semantic Search Mode State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [lastAiQuery, setLastAiQuery] = useState('');

  const countries = useMemo(() => Array.from(new Set(universities.map((u) => u.country))).sort(), []);
  const courses = useMemo(() => Array.from(new Set(universities.map((u) => u.course))).sort(), []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = ranked.filter(({ university: u, fit }) => {
      if (q && !`${u.name} ${u.program} ${u.city}`.toLowerCase().includes(q)) return false;
      if (country !== 'all' && u.country !== country) return false;
      if (course !== 'all' && u.course !== course) return false;
      if (maxRank !== 'all' && u.rank > Number(maxRank)) return false;
      if (tier !== 'all' && fit.tier !== tier) return false;
      if (u.tuition > maxTuition || u.living > maxLiving) return false;
      return true;
    });
    const val = (r: RankedUniversity) => sort.key === 'fit' ? r.fit.fit : r.university[sort.key];
    return [...filtered].sort((a, b) => sort.dir === 'asc' ? val(a) - val(b) : val(b) - val(a));
  }, [ranked, query, country, course, maxRank, tier, maxTuition, maxLiving, sort]);

  const selected = ranked.find((r) => r.university.id === selectedId) ?? null;
  const close = useCallback(() => setSelectedId(null), []);

  const reset = () => {
    setQuery('');
    setCountry('all');
    setCourse('all');
    setMaxRank('all');
    setTier('all');
    setMaxTuition(MAX_TUITION);
    setMaxLiving(MAX_LIVING);
  };

  const toggleSort = (key: SortKey) =>
  setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'fit' || key === 'acceptance' ? 'desc' : 'asc' });

  const SortHeader = ({ k, label, align = 'right' }: {k: SortKey;label: string;align?: 'left' | 'right';}) =>
  <th scope="col" aria-sort={sort.key === k ? sort.dir === 'asc' ? 'ascending' : 'descending' : 'none'} className={`px-4 py-3 font-normal ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button type="button" onClick={() => toggleSort(k)} className={`inline-flex items-center gap-1 rounded-sm transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${sort.key === k ? 'text-ink' : ''}`}>
        {label}
        {sort.key === k && (sort.dir === 'asc' ? <ArrowUpIcon className="h-3 w-3" aria-hidden /> : <ArrowDownIcon className="h-3 w-3" aria-hidden />)}
      </button>
    </th>;


  const handleAiSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : query).trim();
    if (!q) return;
    setAiLoading(true);
    setLastAiQuery(q);
    const resp = await api.semanticSearch({
      query: q,
      country: country !== 'all' ? country : undefined
    });
    setAiLoading(false);
    if (resp && resp.results) {
      setAiResults(resp.results);
    } else {
      setAiResults([]);
    }
  };

  // Auto-search as user types when AI mode is active
  useEffect(() => {
    if (!isAiMode) return;
    const q = query.trim();
    if (!q || q.length < 2) {
      setAiResults([]);
      setLastAiQuery('');
      return;
    }
    const timer = setTimeout(() => {
      handleAiSearch(q);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, isAiMode, country]);

  const budgetActive = maxTuition < MAX_TUITION || maxLiving < MAX_LIVING;

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeader
          title="University Explorer"
          description="Explore graduate programs, compare admissions metrics, or use AI Semantic Search to discover universities by research focus and lab specialties."
        />
        <Button
          variant={isAiMode ? "primary" : "secondary"}
          onClick={() => {
            const nextMode = !isAiMode;
            setIsAiMode(nextMode);
            if (nextMode && query.trim() && aiResults.length === 0) {
              handleAiSearch(query);
            }
          }}
          className={`shrink-0 transition-all ${isAiMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}
        >
          <SparklesIcon className="h-4 w-4 text-amber-400" aria-hidden />
          {isAiMode ? "AI Vector Search Active" : "Enable AI Semantic Search"}
        </Button>
      </div>

      {isAiMode && (
        <div className="mt-4 rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
              AI
            </span>
            <p className="text-[13px] font-medium text-indigo-950">
              ChromaDB Semantic Discovery Engine
            </p>
          </div>
          <p className="mt-1 text-[12px] text-indigo-800">
            Search using natural language (e.g., specific faculty labs, funding/assistantships, career outcomes, or geographic traits). ChromaDB computes vector similarities across 140+ university profiles.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-indigo-900">Try asking:</span>
            {SAMPLE_AI_QUERIES.map((sampleQ, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sampleQ);
                  handleAiSearch(sampleQ);
                }}
                className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-normal text-indigo-900 shadow-2xs transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                "{sampleQ}"
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex h-10 flex-1 items-center gap-2 rounded border border-line bg-white px-3 transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
          <SearchIcon className="h-4 w-4 text-ink-3" aria-hidden />
          <label htmlFor="search" className="sr-only">
            Search programs
          </label>
          <input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isAiMode) {
                handleAiSearch();
              }
            }}
            placeholder={isAiMode ? "Type natural language query (e.g. 'Robotics in tech hubs with high assistantships')..." : "Search university, program or city..."}
            className="h-full w-full bg-transparent text-[14px] placeholder:text-ink-3 focus:outline-none"
          />
          {isAiMode && (
            <Button
              variant="primary"
              size="sm"
              disabled={aiLoading || !query.trim()}
              onClick={() => handleAiSearch()}
              className="h-7 px-3 text-[12px] bg-indigo-600 hover:bg-indigo-700"
            >
              {aiLoading ? <Loader2Icon className="h-3 w-3 animate-spin" /> : "Search AI"}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <SelectField
            id="country"
            label="Country"
            hideLabel
            compact
            value={country}
            onChange={(newCountry) => {
              setCountry(newCountry);
              if (isAiMode && query.trim()) {
                api.semanticSearch({ query, country: newCountry !== 'all' ? newCountry : undefined }).then((res) => {
                  if (res?.results) setAiResults(res.results);
                });
              }
            }}
            options={[{ value: 'all', label: 'All countries' }, ...countries.map((c) => ({ value: c, label: c }))]}
            className="sm:w-[160px]"
          />
          {!isAiMode && (
            <>
              <SelectField id="course" label="Course" hideLabel compact value={course} onChange={setCourse} options={[{ value: 'all', label: 'All courses' }, ...courses.map((c) => ({ value: c, label: c }))]} className="sm:w-[180px]" />
              <SelectField id="rank" label="Ranking" hideLabel compact value={maxRank} onChange={setMaxRank} options={[{ value: 'all', label: 'Any rank' }, { value: '10', label: 'Top 10' }, { value: '25', label: 'Top 25' }, { value: '50', label: 'Top 50' }]} className="sm:w-[124px]" />
              <Button variant="secondary" onClick={() => setShowBudget((v) => !v)} aria-expanded={showBudget} className={budgetActive ? 'border-accent text-accent' : ''}>
                <SlidersHorizontalIcon className="h-4 w-4" aria-hidden />
                Budget
              </Button>
            </>
          )}
        </div>
      </div>

      {!isAiMode && showBudget && (
        <div className="mt-3 grid gap-8 rounded-md border border-line bg-white px-5 py-5 md:grid-cols-2">
          <RangeField id="tuition" label="Max tuition per year" value={maxTuition} min={0} max={MAX_TUITION} step={1000} format={formatUSD} onChange={setMaxTuition} />
          <RangeField id="living" label="Max cost of living per year" value={maxLiving} min={10000} max={MAX_LIVING} step={1000} format={formatUSD} onChange={setMaxLiving} />
        </div>
      )}

      {!isAiMode ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div role="radiogroup" aria-label="Filter by tier" className="flex gap-1">
            {(['all', 'target', 'consider', 'reach'] as const).map((t) => (
              <button
                key={t}
                role="radio"
                aria-checked={tier === t}
                onClick={() => setTier(t)}
                className={`rounded px-3 py-1.5 text-[13px] capitalize transition-colors duration-150 ${tier === t ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.04] hover:text-ink'}`}
              >
                {t === 'all' ? 'All tiers' : t}
              </button>
            ))}
          </div>
          <p className="font-mono text-[12px] text-ink-3">
            {rows.length} of {universities.length} programs
          </p>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-[13px] text-ink-2">
            {aiLoading ? (
              <span className="flex items-center gap-1.5 text-indigo-600">
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> Querying vector embeddings in ChromaDB...
              </span>
            ) : lastAiQuery ? (
              <span>Showing ChromaDB semantic matches for: <strong className="text-ink">"{lastAiQuery}"</strong></span>
            ) : (
              <span>Enter a prompt or select a sample topic above to search semantically.</span>
            )}
          </p>
          <span className="font-mono text-[12px] text-indigo-600">
            {aiResults.length} matches found
          </span>
        </div>
      )}

      {isAiMode ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-indigo-200 bg-white shadow-2xs">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-indigo-100 bg-indigo-50/40 text-[12px] text-indigo-900 font-medium">
                <th className="px-4 py-3">University</th>
                <th className="px-4 py-3 text-right">QS Rank</th>
                <th className="px-4 py-3 text-right">Chroma Match</th>
                <th className="px-4 py-3 text-right">Admit Rate</th>
                <th className="px-4 py-3 text-right">Median GPA</th>
                <th className="px-4 py-3 text-right">Median GRE</th>
                <th className="px-4 py-3">Semantic Research Highlights</th>
              </tr>
            </thead>
            <tbody>
              {aiResults.map((uni: any) => (
                <tr
                  key={uni.id}
                  className="border-b border-line transition-colors duration-150 last:border-0 hover:bg-indigo-50/20"
                >
                  <td className="px-4 py-4">
                    <p className="text-[14px] font-semibold text-ink">{uni.name}</p>
                    <p className="text-[13px] text-ink-3">{uni.country} · {uni.tier}</p>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[13px] font-bold text-ink-2">
                    #{uni.qs_rank}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                      <SparklesIcon className="h-3 w-3 text-emerald-500" />
                      {uni.match_score}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[13px] text-ink-2">
                    {uni.admit_rate_pct}%
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[13px] text-ink-2">
                    {uni.median_gpa.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[13px] text-ink-2">
                    {uni.median_gre.toFixed(0)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[12px] text-ink-2 line-clamp-2 max-w-[360px]" title={uni.relevance_snippet}>
                      {uni.relevance_snippet}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {aiResults.length === 0 && !aiLoading && (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <SparklesIcon className="h-8 w-8 text-indigo-400" />
              <p className="text-[15px] font-medium text-ink">Ready for AI Semantic Search</p>
              <p className="text-[14px] text-ink-3 max-w-md">
                Type any natural language query above or click a suggested prompt chip to discover universities matching your goals.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-line text-[12px] text-ink-3">
                <th scope="col" className="px-4 py-3 font-normal">
                  Program
                </th>
                <SortHeader k="rank" label="Rank" />
                <SortHeader k="acceptance" label="Accept." />
                <SortHeader k="avgGre" label="Avg GRE" />
                <th scope="col" className="px-4 py-3 text-right font-normal">
                  Avg GPA
                </th>
                <SortHeader k="tuition" label="Tuition" />
                <SortHeader k="living" label="Living" />
                <SortHeader k="fit" label="Your fit" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const u = r.university;
                return (
                  <tr
                    key={u.id}
                    tabIndex={0}
                    onClick={() => setSelectedId(u.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSelectedId(u.id))}
                    className="cursor-pointer border-b border-line transition-colors duration-150 last:border-0 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none">
                    
                    <td className="px-4 py-4">
                      <p className="text-[14px] font-medium text-ink">{u.name}</p>
                      <p className="text-[13px] text-ink-3">
                        {u.program} · {u.city}, {u.country}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums">#{u.rank}</td>
                    <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums">{u.acceptance}%</td>
                    <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums">{u.avgGre}</td>
                    <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums">{u.avgGpa.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums">{formatUSD(u.tuition)}</td>
                    <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums">{formatUSD(u.living)}</td>
                    <td className="px-4 py-4 text-right">
                      <TierBadge tier={r.fit.tier} fit={r.fit.fit} />
                      <p className="mt-1 max-w-[220px] truncate text-[12px] text-ink-3" title={r.fit.reasons[0]?.text}>
                        {r.fit.reasons[0]?.label}
                      </p>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-[15px] font-medium">No programs match these filters</p>
              {query.trim() ? (
                <>
                  <p className="text-[14px] text-ink-3 max-w-md">
                    Looking for a specific research topic, lab, or specialization like "{query}"? 
                    Use ChromaDB AI Semantic Search to discover matched universities across 140+ institutions.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsAiMode(true);
                      handleAiSearch(query);
                    }}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <SparklesIcon className="h-3.5 w-3.5 text-amber-300 mr-1.5" />
                    Search "{query}" with AI Semantic Engine
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-[14px] text-ink-3">Try widening the budget or removing a filter.</p>
                  <Button variant="secondary" size="sm" onClick={reset}>
                    Reset filters
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <UniversityDrawer item={selected} onClose={close} />
    </div>);

}