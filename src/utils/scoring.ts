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
  const gpaVal = p.gpa ?? 0;
  const greVal = p.gre ?? 0;
  const toeflVal = p.toefl ?? 0;
  const pubsVal = p.publications ?? 0;
  const workVal = p.workMonths ?? 0;
  const internsVal = p.internships ?? 0;

  const gpa = clamp((gpaVal - 8) * 12, -12, 12);
  const gre = greVal > 0 ? clamp((greVal - 315) * 0.9, -12, 12) : 0;
  const toefl = toeflVal > 0 ? clamp((toeflVal - 100) * 0.3, -5, 4) : 0;
  const research = researchContribution(pubsVal);
  const work = Math.min(workVal, 36) / 36 * 8 - 3;
  const internships = clamp(internsVal * 1.5 - 1.5, -1.5, 4.5);
  const institution = p.institutionTier === 1 ? 4 : p.institutionTier === 2 ? 1 : -3;

  const factors: ShapFactor[] = [
  {
    key: 'gpa',
    label: 'Undergraduate GPA',
    value: `${gpaVal.toFixed(1)} / 10`,
    contribution: gpa,
    explanation:
    gpa >= 0 ?
    'Above the 8.0 median of admitted applicants from comparable programs.' :
    'Below the 8.0 median of admitted applicants. Committees screen on this first.'
  },
  {
    key: 'gre',
    label: 'GRE',
    value: greVal > 0 ? `${greVal}` : 'Not taken',
    contribution: gre,
    explanation:
    gre >= 0 ?
    'Above the 315 benchmark for admitted CS applicants, but under the 322+ medians at top-20 programs.' :
    'Below the 315 benchmark for admitted CS applicants. Quant carries most of the weight.'
  },
  {
    key: 'research',
    label: 'Research & publications',
    value: `${pubsVal} paper${pubsVal === 1 ? '' : 's'}`,
    contribution: research,
    explanation:
    pubsVal === 0 ?
    'No publications yet. Research-weighted programs discount otherwise strong profiles.' :
    `${pubsVal} publication${pubsVal > 1 ? 's' : ''}, a strong signal for thesis-track programs.`
  },
  {
    key: 'toefl',
    label: 'TOEFL',
    value: toeflVal > 0 ? `${toeflVal}` : 'Not taken',
    contribution: toefl,
    explanation:
    toefl >= 0 ?
    'Clears every program minimum with room to spare.' :
    'Close to the 100 cutoff several programs enforce.'
  },
  {
    key: 'work',
    label: 'Work experience',
    value: `${workVal} mo`,
    contribution: work,
    explanation:
    work >= 0 ?
    `${workVal} months of full-time work adds industry credibility.` :
    'Under a year of full-time work, so industry depth is not yet a strength.'
  },
  {
    key: 'internships',
    label: 'Internships',
    value: `${internsVal}`,
    contribution: internships,
    explanation:
    internsVal >= 2 ?
    'Multiple internships show sustained applied experience.' :
    'One or fewer internships. Neutral to slightly negative for applied programs.'
  },
  {
    key: 'institution',
    label: 'Undergraduate institution',
    value: p.undergrad || (p.institutionTier === 1 ? 'Tier 1 (IIT)' : p.institutionTier === 2 ? 'Tier 2 (NIT/IIIT)' : 'Tier 3 (Other)'),
    contribution: institution,
    explanation:
    p.institutionTier === 1 ?
    `Tier 1 Institution (${p.undergrad || 'IIT / IISc'}): Globally recognized top-tier engineering institution, providing significant pedigree advantage with admissions committees.` :
    p.institutionTier === 2 ?
    `Tier 2 Institution (${p.undergrad || 'NIT / IIIT / BITS'}): Nationally recognized premier institute with established reputation and strong technical rigor.` :
    `Tier 3 Institution (${p.undergrad || 'State / Affiliated College'}): Admissions committees scrutinize project depth, GPA, and test scores more heavily outside Tier 1/2.`
  }];

  return factors.
  map((f) => ({ ...f, contribution: round1(f.contribution) })).
  sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

export function computeScore(p: Profile): number {
  if (!p || (p.gpa ?? 0) <= 0 || !p.undergrad) return 0;
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

  const ugTierImpact = p.institutionTier === 1 ? 3 : p.institutionTier === 2 ? 0.5 : -2.5;

  const fit = clamp(Math.round(50 + base + greImpact + gpaImpact + research + ugTierImpact), 3, 97);

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
  },
  {
    key: 'institution',
    label: 'Undergraduate institution',
    impact: round1(ugTierImpact),
    text:
      p.institutionTier === 1 ?
      `Tier 1 Institution (${p.undergrad || 'IIT / IISc'}): Globally recognized pedigree provides an admissions advantage.` :
      p.institutionTier === 2 ?
      `Tier 2 Institution (${p.undergrad || 'NIT / IIIT / BITS'}): Recognized national technical institute with solid standing.` :
      `Tier 3 Institution (${p.undergrad || 'State / Affiliated College'}): Greater reliance on GPA, GRE, and projects to validate rigor.`
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
  const eligibleList = list.filter(
    (u) => !['india', 'pakistan'].includes((u.country || '').trim().toLowerCase())
  );
  return eligibleList
    .map((u) => ({ university: u, fit: computeFit(p, score, u) }))
    .sort((a, b) => {
      const diff = b.fit.fit - a.fit.fit;
      if (diff !== 0) return diff;
      return a.university.rank - b.university.rank;
    });
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