import { Profile, ShapFactor } from '../types/profile';
import { FitReason, FitResult, RankedUniversity, Tier, University } from '../types/university';
import { universities } from '../data/universities';

export const BASELINE = 62;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

function researchContribution(pubs: number): number {
  return pubs === 0 ? -4 : Math.min(9, -1 + pubs * 3.5);
}

export function computeShap(p: Profile): ShapFactor[] {
  const gpa = clamp((p.gpa - 8) * 12, -12, 12);
  const gre = clamp((p.gre - 315) * 0.9, -12, 12);
  const toefl = clamp((p.toefl - 100) * 0.3, -5, 4);
  const research = researchContribution(p.publications);
  const work = Math.min(p.workMonths, 36) / 36 * 8 - 3;
  const internships = clamp(p.internships * 1.5 - 1.5, -1.5, 4.5);
  const lor = (p.lorStrength - 3) * 3;
  const sop = (p.sopQuality - 70) * 0.25;
  const institution = p.institutionTier === 1 ? 4 : p.institutionTier === 2 ? 1 : -2;

  const factors: ShapFactor[] = [
  {
    key: 'gpa',
    label: 'Undergraduate GPA',
    value: `${p.gpa.toFixed(1)} / 10`,
    contribution: gpa,
    explanation:
    gpa >= 0 ?
    'Above the 8.0 median of admitted applicants from comparable programs.' :
    'Below the 8.0 median of admitted applicants. Committees screen on this first.'
  },
  {
    key: 'gre',
    label: 'GRE',
    value: `${p.gre}`,
    contribution: gre,
    explanation:
    gre >= 0 ?
    'Above the 315 benchmark for admitted CS applicants, but under the 322+ medians at top-20 programs.' :
    'Below the 315 benchmark for admitted CS applicants. Quant carries most of the weight.'
  },
  {
    key: 'research',
    label: 'Research & publications',
    value: `${p.publications} paper${p.publications === 1 ? '' : 's'}`,
    contribution: research,
    explanation:
    p.publications === 0 ?
    'No publications yet. Research-weighted programs discount otherwise strong profiles.' :
    `${p.publications} publication${p.publications > 1 ? 's' : ''}, a strong signal for thesis-track programs.`
  },
  {
    key: 'sop',
    label: 'Statement of purpose',
    value: `${Math.round(p.sopQuality)} / 100`,
    contribution: sop,
    explanation:
    p.sopQuality >= 70 ?
    'Specific, evidence-backed and aligned to named programs.' :
    'Generic motivation and thin program fit are holding the draft back.'
  },
  {
    key: 'toefl',
    label: 'TOEFL',
    value: `${p.toefl}`,
    contribution: toefl,
    explanation:
    toefl >= 0 ?
    'Clears every program minimum with room to spare.' :
    'Close to the 100 cutoff several programs enforce.'
  },
  {
    key: 'work',
    label: 'Work experience',
    value: `${p.workMonths} mo`,
    contribution: work,
    explanation:
    work >= 0 ?
    `${p.workMonths} months of full-time work adds industry credibility.` :
    'Under a year of full-time work, so industry depth is not yet a strength.'
  },
  {
    key: 'internships',
    label: 'Internships',
    value: `${p.internships}`,
    contribution: internships,
    explanation:
    p.internships >= 2 ?
    'Multiple internships show sustained applied experience.' :
    'One or fewer internships. Neutral to slightly negative for applied programs.'
  },
  {
    key: 'institution',
    label: 'Undergraduate institution',
    value: p.undergrad,
    contribution: institution,
    explanation:
    p.institutionTier === 1 ?
    'Top-tier institution that committees recognize immediately.' :
    p.institutionTier === 2 ?
    'Well-regarded institution. A mild positive.' :
    'Less-known institution, so scores and projects must carry more weight.'
  },
  {
    key: 'lor',
    label: 'Letters of recommendation',
    value: `${p.lorStrength} / 5`,
    contribution: lor,
    explanation:
    p.lorStrength >= 4 ?
    'Specific letters from supervisors who know your work closely.' :
    p.lorStrength === 3 ?
    'Solid but generic letters. They neither add nor subtract.' :
    'Letters read as generic and are costing you points.'
  }];


  return factors.
  map((f) => ({ ...f, contribution: round1(f.contribution) })).
  sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

export function computeScore(p: Profile): number {
  const sum = computeShap(p).reduce((acc, f) => acc + f.contribution, 0);
  return clamp(Math.round(BASELINE + sum), 1, 99);
}

export function tierForFit(fit: number): Tier {
  if (fit >= 60) return 'target';
  if (fit >= 40) return 'consider';
  return 'reach';
}

export function computeFit(p: Profile, score: number, u: University): FitResult {
  const scoreGap = score - u.bar;
  const base = scoreGap * 2.2;
  const greGap = p.gre - u.avgGre;
  const greImpact = clamp(greGap * 0.6, -6, 6);
  const gpaGap = p.gpa - u.avgGpa;
  const gpaImpact = clamp(gpaGap * 8, -6, 6);
  let research = 0;
  if (u.researchWeight === 'high') research = p.publications > 0 ? 4 : -4;
  if (u.researchWeight === 'medium') research = p.publications > 0 ? 2 : -1;

  const fit = clamp(Math.round(50 + base + greImpact + gpaImpact + research), 3, 97);

  const reasons: FitReason[] = [
  {
    key: 'overall',
    label: 'Profile vs. admit bar',
    impact: round1(base),
    text:
    scoreGap >= 0 ?
    `Your score of ${score} is ${scoreGap} above this program's typical admit bar of ${u.bar}.` :
    `Your score of ${score} is ${-scoreGap} below this program's typical admit bar of ${u.bar}.`
  },
  {
    key: 'gre',
    label: 'GRE vs. admitted median',
    impact: round1(greImpact),
    text:
    greGap >= 0 ?
    `GRE ${p.gre} meets or beats the admitted median of ${u.avgGre}.` :
    `GRE ${p.gre} is ${-greGap} points under the admitted median of ${u.avgGre}.`
  },
  {
    key: 'gpa',
    label: 'GPA vs. admitted median',
    impact: round1(gpaImpact),
    text:
    gpaGap >= 0 ?
    `GPA ${p.gpa.toFixed(1)} is at or above the admitted median of ${u.avgGpa.toFixed(1)}.` :
    `GPA ${p.gpa.toFixed(1)} trails the admitted median of ${u.avgGpa.toFixed(1)}.`
  }];


  if (u.researchWeight !== 'low') {
    reasons.push({
      key: 'research',
      label: 'Research fit',
      impact: research,
      text:
      u.researchWeight === 'high' ?
      p.publications > 0 ?
      'Your publication record matches this program’s research focus.' :
      'No publications, and this program weighs research heavily.' :
      p.publications > 0 ?
      'Publications add a modest edge here.' :
      'Research is valued here. A publication would help.'
    });
  }

  reasons.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  return { fit, tier: tierForFit(fit), reasons };
}

export function rankUniversities(p: Profile, list: University[] = universities): RankedUniversity[] {
  const score = computeScore(p);
  return list.
  map((u) => ({ university: u, fit: computeFit(p, score, u) })).
  sort((a, b) => b.fit.fit - a.fit.fit);
}

export function countTiers(ranked: RankedUniversity[]): Record<Tier, number> {
  return ranked.reduce(
    (acc, r) => {
      acc[r.fit.tier] += 1;
      return acc;
    },
    { target: 0, consider: 0, reach: 0 } as Record<Tier, number>
  );
}

export function applyLever(p: Profile, lever: Partial<Profile>): Profile {
  const next = { ...p } as unknown as Record<string, unknown>;
  (Object.keys(lever) as (keyof Profile)[]).forEach((k) => {
    const v = lever[k];
    const cur = p[k];
    if (typeof v === 'number' && typeof cur === 'number') next[k] = Math.max(cur, v);
  });
  return next as unknown as Profile;
}

export function scoreDelta(p: Profile, lever: Partial<Profile>): number {
  return computeScore(applyLever(p, lever)) - computeScore(p);
}

export function percentileFor(score: number): number {
  return clamp(Math.round(score * 1.1 - 8), 1, 99);
}

export function tierRank(t: Tier): number {
  return t === 'target' ? 0 : t === 'consider' ? 1 : 2;
}