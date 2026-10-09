import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrophyIcon,
  SearchIcon,
  GlobeIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  LayoutGridIcon,
  TableIcon,
  CheckCircle2Icon,
  RotateCcwIcon,
  DollarSignIcon,
  BuildingIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
  SparklesIcon,
} from 'lucide-react';
import { qsTop150Universities, QsUniversity } from '../data/qsUniversities';
import { QsUniversityDrawer } from '../components/qs/QsUniversityDrawer';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

type SortKey = 'rank' | 'name' | 'country' | 'tuition';
type ViewMode = 'table' | 'grid';

interface QsRankingsProps {
  standalone?: boolean;
}

export function QsRankings({ standalone = false }: QsRankingsProps) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [country, setCountry] = useState('all');
  const [rankRange, setRankRange] = useState('all');
  const [tuitionFilter, setTuitionFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedUni, setSelectedUni] = useState<QsUniversity | null>(null);

  // Computed regions and countries
  const regions = useMemo(() => {
    const list = Array.from(new Set(qsTop150Universities.map((u) => u.region))).sort();
    return list;
  }, []);

  const countriesWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    qsTop150Universities.forEach((u) => {
      map.set(u.country, (map.get(u.country) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, []);

  // Filtered and sorted data
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return qsTop150Universities.filter((u) => {
      // Search query
      if (q) {
        const text = `${u.name} ${u.country} ${u.region} ${u.notes || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      // Region
      if (region !== 'all' && u.region !== region) return false;

      // Country
      if (country !== 'all' && u.country !== country) return false;

      // Rank Range
      if (rankRange === '10' && u.rank > 10) return false;
      if (rankRange === '25' && u.rank > 25) return false;
      if (rankRange === '50' && u.rank > 50) return false;
      if (rankRange === '100' && u.rank > 100) return false;

      // Tuition Filter
      if (tuitionFilter === 'free' && u.tuitionUSD !== 0 && u.tuitionRaw !== '0') return false;
      if (tuitionFilter === 'sub5k' && (u.tuitionUSD === null || u.tuitionUSD > 5000)) return false;
      if (tuitionFilter === '5k-25k' && (u.tuitionUSD === null || u.tuitionUSD <= 5000 || u.tuitionUSD > 25000))
        return false;
      if (tuitionFilter === '25k-50k' && (u.tuitionUSD === null || u.tuitionUSD <= 25000 || u.tuitionUSD > 50000))
        return false;
      if (tuitionFilter === 'above50k' && (u.tuitionUSD === null || u.tuitionUSD <= 50000)) return false;

      return true;
    });
  }, [query, region, country, rankRange, tuitionFilter]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'rank') {
        comparison = a.rank - b.rank;
      } else if (sortKey === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === 'country') {
        comparison = a.country.localeCompare(b.country);
      } else if (sortKey === 'tuition') {
        const valA = a.tuitionUSD ?? 999999;
        const valB = b.tuitionUSD ?? 999999;
        comparison = valA - valB;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [filteredRows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const resetFilters = () => {
    setQuery('');
    setRegion('all');
    setCountry('all');
    setRankRange('all');
    setTuitionFilter('all');
    setSortKey('rank');
    setSortDir('asc');
  };

  const hasActiveFilters =
    query || region !== 'all' || country !== 'all' || rankRange !== 'all' || tuitionFilter !== 'all';

  // Key stats
  const totalFreePrograms = useMemo(
    () => qsTop150Universities.filter((u) => u.tuitionUSD === 0 || u.tuitionRaw === '0').length,
    []
  );
  const totalUnder5k = useMemo(
    () => qsTop150Universities.filter((u) => u.tuitionUSD !== null && u.tuitionUSD <= 5000).length,
    []
  );

  return (
    <div className={standalone ? 'min-h-screen bg-canvas pb-20' : 'pb-12'}>
      {/* Standalone Top Nav */}
      {standalone && (
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-10">
            <div className="flex items-center gap-4">
              <Logo />
              <div className="hidden h-5 w-px bg-line sm:block" />
              <Link
                to="/"
                className="hidden items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink sm:flex"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Home
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/app" className="text-[14px] text-ink-2 transition-colors hover:text-ink">
                Dashboard
              </Link>
              <Button to="/signup" size="sm">
                Get your score
              </Button>
            </div>
          </div>
        </header>
      )}

      <div className={standalone ? 'mx-auto max-w-[1200px] px-6 pt-10 md:px-10' : ''}>
        {/* Breadcrumb / Top Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent">
            <TrophyIcon className="h-3.5 w-3.5" />
            Official QS Rankings 2026 Edition
          </div>
          <div className="flex items-center gap-2 text-[13px] text-ink-3">
            <span>Last verified for Academic Year 2025–2026</span>
          </div>
        </div>

        {/* Page Title & Intro */}
        <div className="mt-4 flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.035em] text-ink md:text-[40px]">
              Top 150 QS World Universities
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
              Comprehensive global rankings of the world’s leading 150 institutions, complete with annual postgraduate
              (Master’s) Computer Science tuition fees, scholarship coverage, and admission guidelines.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button to="/app/explorer" variant="secondary" size="md">
              <SparklesIcon className="h-4 w-4 text-accent" />
              Simulate Profile Fit
            </Button>
          </div>
        </div>

        {/* Metric Highlight Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-ink-3">
              <BuildingIcon className="h-4 w-4 text-accent" />
              <span className="text-[12px] font-medium uppercase tracking-wider">Top Institutions</span>
            </div>
            <div className="mt-2 font-display text-[26px] font-bold text-ink">150</div>
            <div className="text-[12px] text-ink-3">Institutions ranked by QS</div>
          </div>

          <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-ink-3">
              <GlobeIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-[12px] font-medium uppercase tracking-wider">Countries</span>
            </div>
            <div className="mt-2 font-display text-[26px] font-bold text-ink">36</div>
            <div className="text-[12px] text-ink-3">Across 6 continents</div>
          </div>

          <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-ink-3">
              <CheckCircle2Icon className="h-4 w-4 text-teal-600" />
              <span className="text-[12px] font-medium uppercase tracking-wider">Free / Sub-$5K</span>
            </div>
            <div className="mt-2 font-display text-[26px] font-bold text-teal-700">{totalUnder5k}</div>
            <div className="text-[12px] text-ink-3">{totalFreePrograms} fully funded/free programs</div>
          </div>

          <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-ink-3">
              <DollarSignIcon className="h-4 w-4 text-amber-600" />
              <span className="text-[12px] font-medium uppercase tracking-wider">Tuition Span</span>
            </div>
            <div className="mt-2 font-display text-[22px] font-bold text-ink sm:text-[24px]">
              $0 – $87.7K
            </div>
            <div className="text-[12px] text-ink-3">Master's annual tuition range</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="relative flex h-11 flex-1 items-center rounded-lg border border-line bg-white px-3.5 shadow-sm transition-[border-color,box-shadow] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
              <SearchIcon className="h-4 w-4 text-ink-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search university name, country, or notes (e.g. Stanford, Germany, scholarship)..."
                className="ml-2.5 h-full w-full bg-transparent text-[14px] placeholder:text-ink-3 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="rounded p-1 text-[12px] text-ink-3 hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
              {/* Country Select */}
              <select
                aria-label="Filter by Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-11 rounded-lg border border-line bg-white px-3 text-[13.5px] text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 sm:w-[170px]"
              >
                <option value="all">All Countries ({qsTop150Universities.length})</option>
                {countriesWithCounts.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>

              {/* Rank Filter */}
              <select
                aria-label="Filter by Rank Tier"
                value={rankRange}
                onChange={(e) => setRankRange(e.target.value)}
                className="h-11 rounded-lg border border-line bg-white px-3 text-[13.5px] text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 sm:w-[130px]"
              >
                <option value="all">All Ranks</option>
                <option value="10">Top 10 Only</option>
                <option value="25">Top 25 Only</option>
                <option value="50">Top 50 Only</option>
                <option value="100">Top 100 Only</option>
              </select>

              {/* Tuition Filter */}
              <select
                aria-label="Filter by Tuition Fee"
                value={tuitionFilter}
                onChange={(e) => setTuitionFilter(e.target.value)}
                className="h-11 rounded-lg border border-line bg-white px-3 text-[13.5px] text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 sm:w-[170px]"
              >
                <option value="all">All Tuition Fees</option>
                <option value="free">Free / Scholarship ($0)</option>
                <option value="sub5k">Under $5,000 / yr</option>
                <option value="5k-25k">$5K – $25K / yr</option>
                <option value="25k-50k">$25K – $50K / yr</option>
                <option value="above50k">$50K+ / yr</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center rounded-lg border border-line bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="Table view"
                  className={`flex h-9 w-9 items-center justify-center rounded ${
                    viewMode === 'table' ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  <TableIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`flex h-9 w-9 items-center justify-center rounded ${
                    viewMode === 'grid' ? 'bg-ink text-white' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  <LayoutGridIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[13px] font-medium text-ink-3">Region:</span>
              <button
                type="button"
                onClick={() => setRegion('all')}
                className={`rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                  region === 'all'
                    ? 'bg-ink text-white shadow-sm'
                    : 'border border-line bg-white text-ink-2 hover:border-line-strong hover:text-ink'
                }`}
              >
                All Regions
              </button>
              {regions.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setRegion(reg)}
                  className={`rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                    region === reg
                      ? 'bg-ink text-white shadow-sm'
                      : 'border border-line bg-white text-ink-2 hover:border-line-strong hover:text-ink'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline"
                >
                  <RotateCcwIcon className="h-3 w-3" /> Reset Filters
                </button>
              )}
              <span className="font-mono text-[12.5px] text-ink-3">
                Showing {sortedRows.length} of {qsTop150Universities.length} universities
              </span>
            </div>
          </div>
        </div>

        {/* Content View */}
        {viewMode === 'table' ? (
          <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-b border-line bg-[#FAFAF8] text-[12px] font-medium uppercase tracking-wider text-ink-3">
                  <th scope="col" className="w-[90px] px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort('rank')}
                      className="inline-flex items-center gap-1 hover:text-ink"
                    >
                      Rank
                      {sortKey === 'rank' ? (
                        sortDir === 'asc' ? (
                          <ArrowUpIcon className="h-3 w-3 text-ink" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-ink" />
                        )
                      ) : (
                        <ArrowUpDownIcon className="h-3 w-3 text-ink-3" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-ink"
                    >
                      University
                      {sortKey === 'name' ? (
                        sortDir === 'asc' ? (
                          <ArrowUpIcon className="h-3 w-3 text-ink" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-ink" />
                        )
                      ) : (
                        <ArrowUpDownIcon className="h-3 w-3 text-ink-3" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="w-[180px] px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort('country')}
                      className="inline-flex items-center gap-1 hover:text-ink"
                    >
                      Country
                      {sortKey === 'country' ? (
                        sortDir === 'asc' ? (
                          <ArrowUpIcon className="h-3 w-3 text-ink" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-ink" />
                        )
                      ) : (
                        <ArrowUpDownIcon className="h-3 w-3 text-ink-3" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="w-[200px] px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('tuition')}
                      className="inline-flex items-center gap-1 hover:text-ink"
                    >
                      PG CS Annual Fee (USD)
                      {sortKey === 'tuition' ? (
                        sortDir === 'asc' ? (
                          <ArrowUpIcon className="h-3 w-3 text-ink" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-ink" />
                        )
                      ) : (
                        <ArrowUpDownIcon className="h-3 w-3 text-ink-3" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Notes & Details
                  </th>
                  <th scope="col" className="w-[100px] px-5 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sortedRows.map((u) => {
                  const isFree = u.tuitionUSD === 0 || u.tuitionRaw === '0';
                  const isLow = u.tuitionUSD !== null && u.tuitionUSD > 0 && u.tuitionUSD <= 5000;
                  const isTop3 = u.rank <= 3;
                  const isTop10 = u.rank <= 10;

                  return (
                    <tr
                      key={u.id}
                      tabIndex={0}
                      onClick={() => setSelectedUni(u)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedUni(u);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-black/[0.02] focus-visible:bg-black/[0.03] focus-visible:outline-none"
                    >
                      {/* Rank */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex h-8 w-11 items-center justify-center rounded-md font-mono text-[13px] font-bold ${
                            isTop3
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isTop10
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'bg-stone-100 text-ink'
                          }`}
                        >
                          #{u.rank}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-ink">{u.name}</div>
                        <div className="text-[12px] text-ink-3">{u.region}</div>
                      </td>

                      {/* Country */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-2">
                          <GlobeIcon className="h-3.5 w-3.5 text-ink-3" />
                          {u.country}
                        </span>
                      </td>

                      {/* Tuition */}
                      <td className="px-5 py-4 text-right">
                        {isFree ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-800 border border-emerald-200">
                            Free / Scholarship
                          </span>
                        ) : (
                          <div>
                            <span
                              className={`font-mono text-[14px] font-semibold tabular-nums ${
                                isLow ? 'text-teal-700' : 'text-ink'
                              }`}
                            >
                              {u.tuitionRaw.startsWith('$') ? u.tuitionRaw : `$${u.tuitionRaw}`}
                            </span>
                            {isLow && (
                              <div className="text-[11px] font-medium text-teal-700">Sub-$5K program</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="px-5 py-4">
                        <p className="max-w-[280px] truncate text-[12.5px] text-ink-2" title={u.notes}>
                          {u.notes || <span className="italic text-ink-3">Standard international fee</span>}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUni(u);
                          }}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                        >
                          Details <ExternalLinkIcon className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {sortedRows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="font-display text-[18px] font-semibold text-ink">No universities match your filters</p>
                <p className="mt-1 text-[14px] text-ink-3">Try adjusting your search query, rank range, or tuition tier.</p>
                <Button variant="secondary" size="sm" onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Grid Card View */
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedRows.map((u) => {
              const isFree = u.tuitionUSD === 0 || u.tuitionRaw === '0';
              const isLow = u.tuitionUSD !== null && u.tuitionUSD > 0 && u.tuitionUSD <= 5000;
              const isTop3 = u.rank <= 3;
              const isTop10 = u.rank <= 10;

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUni(u)}
                  className="group flex cursor-pointer flex-col justify-between rounded-xl border border-line bg-white p-5 shadow-sm transition-all duration-150 hover:border-line-strong hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Rank & Region */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[13px] font-bold ${
                          isTop3
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isTop10
                            ? 'bg-accent/10 text-accent'
                            : 'bg-stone-100 text-ink'
                        }`}
                      >
                        <TrophyIcon className="h-3 w-3" /> #{u.rank}
                      </span>
                      <span className="rounded-md border border-line bg-canvas px-2 py-0.5 text-[11.5px] text-ink-2">
                        {u.region}
                      </span>
                    </div>

                    {/* University Name */}
                    <h3 className="mt-3 font-display text-[17px] font-bold text-ink transition-colors group-hover:text-accent">
                      {u.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-[13px] text-ink-2">
                      <GlobeIcon className="h-3.5 w-3.5 text-ink-3" />
                      {u.country}
                    </p>

                    {/* Notes Callout if available */}
                    {u.notes && (
                      <p className="mt-3 line-clamp-2 rounded bg-canvas p-2 text-[12px] leading-relaxed text-ink-2">
                        {u.notes}
                      </p>
                    )}
                  </div>

                  {/* Bottom: Tuition Fee */}
                  <div className="mt-4 flex items-end justify-between border-t border-line pt-3.5">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-ink-3">Annual Tuition</span>
                      <div className="mt-0.5">
                        {isFree ? (
                          <span className="inline-block font-mono text-[14px] font-bold text-emerald-700">
                            100% Free / Funded
                          </span>
                        ) : (
                          <span
                            className={`font-mono text-[16px] font-bold ${isLow ? 'text-teal-700' : 'text-ink'}`}
                          >
                            {u.tuitionRaw.startsWith('$') ? u.tuitionRaw : `$${u.tuitionRaw}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent group-hover:underline">
                      View info <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}

            {sortedRows.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-line bg-white py-16 text-center">
                <p className="font-display text-[18px] font-semibold text-ink">No universities match your filters</p>
                <p className="mt-1 text-[14px] text-ink-3">Try adjusting your search query, rank range, or tuition tier.</p>
                <Button variant="secondary" size="sm" onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Callout banner */}
        <div className="mt-12 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent">
                <SparklesIcon className="h-3.5 w-3.5" /> Antigravity Admissions Engine
              </span>
              <h2 className="mt-2 font-display text-[22px] font-bold text-ink">
                Want to know where you stand for these top 150 universities?
              </h2>
              <p className="mt-2 text-[14px] text-ink-2">
                Calculate your admission readiness score using machine-learning models trained on historical admit/reject
                cycles across top global programs.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button to="/onboarding" size="md">
                Calculate My Score
              </Button>
              <Button to="/app/explorer" variant="secondary" size="md">
                Open Explorer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* University Details Drawer */}
      <QsUniversityDrawer item={selectedUni} onClose={() => setSelectedUni(null)} />
    </div>
  );
}
