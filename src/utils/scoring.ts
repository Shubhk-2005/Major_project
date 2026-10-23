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
    label: p.englishTestType === 'ielts' ? 'IELTS (TOEFL eq.)' : 'TOEFL',
    value:
      p.englishTestType === 'ielts' && p.ieltsScore
        ? `Band ${p.ieltsScore} (${toeflVal})`
        : toeflVal > 0
        ? `${toeflVal}`
        : 'Not taken',
    contribution: toefl,
    explanation:
      toefl >= 0
        ? 'Clears every program minimum with room to spare.'
        : 'Close to the 100 cutoff several programs enforce.'
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

export interface ScoreExplanation {
  score: number;
  label: string;
  tier: 'foundation' | 'developing' | 'moderate' | 'competitive' | 'high' | 'elite';
  oneLiner: string;
  detail: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  recommendationHint: string;
}

export function getScoreExplanation(score: number): ScoreExplanation {
  const s = Math.round(score);

  if (s <= 0) {
    return {
      score: 0,
      label: 'Pending Onboarding',
      tier: 'foundation',
      oneLiner: 'Complete your academic profile and test scores to calculate your verified competitiveness score.',
      detail: 'Once you enter your GPA, GRE/TOEFL, and experience, our ML model computes your profile competitiveness.',
      badgeClass: 'bg-canvas text-ink-3 border border-line',
      dotClass: 'bg-ink-3',
      borderClass: 'border-line',
      bgClass: 'bg-canvas/50',
      textClass: 'text-ink-3',
      recommendationHint: 'Start onboarding to discover your admission odds.'
    };
  }

  if (s < 40) {
    return {
      score: s,
      label: 'Early Foundation',
      tier: 'foundation',
      oneLiner: `A score of ${s}/100 indicates an early-stage profile needing foundational academic, test score, or project strengthening before targeting competitive master's programs.`,
      detail: `Your score is ${62 - s} points below the typical MS CS admitted benchmark (62). Focus on GRE prep, research output, or GPA upward trends.`,
      badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
      dotClass: 'bg-rose-500',
      borderClass: 'border-rose-200',
      bgClass: 'bg-rose-50/50',
      textClass: 'text-rose-700',
      recommendationHint: 'Prioritize programs with holistic review and no rigid cutoff bars.'
    };
  }

  if (s <= 49) {
    return {
      score: s,
      label: 'Developing Competitiveness',
      tier: 'developing',
      oneLiner: `A score of ${s}/100 indicates a developing profile below the 62 baseline — best suited for flexible mid-tier programs, while top-50 universities will require strategic score or research boosts.`,
      detail: `At ${s}/100, you are ${62 - s} points from the median CS baseline (62). Programs with admit bars around 50–55 are within reach, while top programs are reaches.`,
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
      dotClass: 'bg-amber-500',
      borderClass: 'border-amber-200',
      bgClass: 'bg-amber-50/50',
      textClass: 'text-amber-800',
      recommendationHint: 'Ideal for universities with admit bars of 50–56 (e.g. UT Dallas, ASU) and safe regional options.'
    };
  }

  if (s <= 59) {
    return {
      score: s,
      label: 'Moderate Competitiveness',
      tier: 'moderate',
      oneLiner: `A score of ${s}/100 represents moderate competitiveness approaching the 62 admitted baseline — well-positioned for consider & safe programs, with strong upside if GRE or SOP gaps are closed.`,
      detail: `At ${s}/100, you are within ${62 - s} points of the median admitted applicant. Solid candidate for mid-tier programs, with high upside via targeted roadmap levers.`,
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
      dotClass: 'bg-amber-500',
      borderClass: 'border-amber-200',
      bgClass: 'bg-amber-50/50',
      textClass: 'text-amber-800',
      recommendationHint: 'Competitively positioned for programs with admit bars of 54–62 (e.g. ASU, UT Dallas, Northeastern).'
    };
  }

  if (s <= 69) {
    return {
      score: s,
      label: 'Competitive (Admitted Benchmark)',
      tier: 'competitive',
      oneLiner: `A score of ${s}/100 matches or beats the 62 baseline of admitted graduate students — solidly competitive for established target programs with balanced admission odds.`,
      detail: `At ${s}/100, you match or exceed the average admitted profile (62). Established mid-to-high tier universities are in your target zone.`,
      badgeClass: 'bg-blue-50 text-blue-800 border border-blue-200',
      dotClass: 'bg-blue-500',
      borderClass: 'border-blue-200',
      bgClass: 'bg-blue-50/50',
      textClass: 'text-blue-800',
      recommendationHint: 'Target programs with admit bars of 60–68 (e.g. UMass, USC, TU Delft, Edinburgh).'
    };
  }

  if (s <= 84) {
    return {
      score: s,
      label: 'Highly Competitive',
      tier: 'high',
      oneLiner: `A score of ${s}/100 significantly outpaces average applicant pools — highly competitive for top-30 programs with strong academic and profile credentials.`,
      detail: `At ${s}/100, your profile is ${s - 62} points above benchmark. You are well-positioned for selective global programs and prestigious departments.`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      dotClass: 'bg-emerald-500',
      borderClass: 'border-emerald-200',
      bgClass: 'bg-emerald-50/50',
      textClass: 'text-emerald-800',
      recommendationHint: 'Competitive for top-30 programs with admit bars of 70–80 (e.g. Georgia Tech, UCSD, Waterloo, Columbia).'
    };
  }

  return {
    score: s,
    label: 'Elite Standing',
    tier: 'elite',
    oneLiner: `A score of ${s}/100 places you in the elite tier of applicants — exceptionally strong profile for top-10 global institutions and prestigious research fellowships.`,
    detail: `At ${s}/100, your profile is in the top percentile of global CS applicants, meeting the admit bars of world-renowned institutions.`,
    badgeClass: 'bg-purple-50 text-purple-800 border border-purple-200',
    dotClass: 'bg-purple-500',
    borderClass: 'border-purple-200',
    bgClass: 'bg-purple-50/50',
    textClass: 'text-purple-800',
    recommendationHint: 'Ready for top-10 institutions with admit bars of 80+ (e.g. CMU, Stanford, ETH Zürich, UIUC).'
  };
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