import { FactorKey, Profile } from '../types/profile';
import { RankedUniversity } from '../types/university';
import { Priority, RoadmapItem } from '../types/roadmap';

export interface DynamicMonth {
  name: string; // e.g. "Oct"
  year: string; // e.g. "26"
  label: string; // e.g. "Oct"
  index: number;
}

/**
 * Generates the upcoming 12 calendar months starting from the current month.
 */
export function getDynamicMonths(): DynamicMonth[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const months: DynamicMonth[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentYear, currentMonth + i, 1);
    const mName = monthNames[d.getMonth()];
    const yStr = String(d.getFullYear()).slice(-2);
    months.push({
      name: mName,
      year: yStr,
      label: mName,
      index: i,
    });
  }
  return months;
}

function parseTimeline(timelineStr: string, defaultStart = 0, defaultSpan = 3): { start: number; span: number } {
  if (!timelineStr) return { start: defaultStart, span: defaultSpan };
  const matches = timelineStr.match(/(\d+)\s*[-–—to]+\s*(\d+)/i);
  if (matches) {
    const startMonth = Math.max(1, Math.min(12, parseInt(matches[1], 10)));
    const endMonth = Math.max(startMonth, Math.min(12, parseInt(matches[2], 10)));
    return {
      start: startMonth - 1,
      span: Math.max(1, endMonth - startMonth + 1),
    };
  }
  const singleMatch = timelineStr.match(/month\s*(\d+)/i);
  if (singleMatch) {
    const m = Math.max(1, Math.min(12, parseInt(singleMatch[1], 10)));
    return { start: m - 1, span: 1 };
  }
  return { start: defaultStart, span: defaultSpan };
}

function determineLever(
  area: string,
  action: string,
  profile: Profile
): { factor: FactorKey | 'strategy'; priority: Priority; lever?: Partial<Profile> } {
  const text = `${area} ${action}`.toLowerCase();
  if (text.includes('gre') || text.includes('quant')) {
    return {
      factor: 'gre',
      priority: 'high',
      lever: { gre: Math.min(335, Math.max(325, (profile.gre || 315) + 6)) },
    };
  }
  if (text.includes('sop') || text.includes('statement') || text.includes('faculty alignment')) {
    return {
      factor: 'strategy',
      priority: 'high',
      lever: { sopQuality: Math.min(95, Math.max(82, (profile.sopQuality || 65) + 15)) },
    };
  }
  if (
    text.includes('research') ||
    text.includes('paper') ||
    text.includes('preprint') ||
    text.includes('publication') ||
    text.includes('workshop')
  ) {
    return {
      factor: 'research',
      priority: 'high',
      lever: { publications: Math.max(1, (profile.publications || 0) + 1) },
    };
  }
  if (text.includes('recommend') || text.includes('lor') || text.includes('recommender')) {
    return {
      factor: 'strategy',
      priority: 'medium',
      lever: { lorStrength: 4.5 },
    };
  }
  if (text.includes('toefl') || text.includes('ielts') || text.includes('speaking')) {
    return {
      factor: 'toefl',
      priority: 'medium',
      lever: { toefl: 105 },
    };
  }
  if (text.includes('work') || text.includes('engineer') || text.includes('production') || text.includes('industry')) {
    return {
      factor: 'work',
      priority: 'medium',
      lever: { workMonths: Math.min(36, (profile.workMonths || 0) + 12) },
    };
  }
  if (text.includes('submission') || text.includes('apply') || text.includes('application') || text.includes('priority')) {
    return {
      factor: 'strategy',
      priority: 'high',
    };
  }
  return {
    factor: 'strategy',
    priority: 'low',
  };
}

/**
 * Dynamically synthesizes actionable, profile-aware roadmap milestones tailored
 * to the applicant's real scores, publications, work history, and target universities.
 * If aiStrategy is provided, aligns the timeline directly with Ms AI Advisory milestones.
 */
export function getDynamicRoadmapItems(
  profile: Profile,
  ranked: RankedUniversity[] = [],
  aiStrategy?: any
): RoadmapItem[] {
  // If AI Advisory strategy is loaded with prioritized milestones, display the exact AI plan!
  if (aiStrategy?.key_priorities && Array.isArray(aiStrategy.key_priorities) && aiStrategy.key_priorities.length > 0) {
    return aiStrategy.key_priorities.map((item: any, idx: number) => {
      const defaultStart = Math.min(10, Math.floor((idx / aiStrategy.key_priorities.length) * 11));
      const { start, span } = parseTimeline(item.timeline, defaultStart, 2);
      const { factor, priority, lever } = determineLever(item.area || '', item.action_item || '', profile);
      return {
        id: `ai-milestone-${idx}`,
        title: item.area ? `${item.area}: ${item.action_item.split('.')[0]}` : item.action_item,
        detail: item.action_item + (item.expected_score_lift ? ` (${item.expected_score_lift})` : ''),
        start,
        span,
        priority,
        factor,
        lever,
      };
    });
  }

  // Fallback: Comprehensive 12-Month Profile-Aware Roadmap
  const targetUnis = ranked.filter((r) => r.fit.tier === 'target').map((r) => r.university.name);
  const reachUnis = ranked.filter((r) => r.fit.tier === 'reach').map((r) => r.university.name);

  const topTarget = targetUnis[0] || 'Target Programs';
  const topReach = reachUnis[0] || 'Top Reach Universities';
  const primarySchool = topReach || topTarget || 'Top Graduate CS Programs';

  const items: RoadmapItem[] = [];

  // Phase 1: Research & Publications (Months 1-3)
  if (profile.publications === 0) {
    items.push({
      id: 'dyn-research',
      title: 'Deposit Capstone Project or arXiv Preprint',
      detail:
        'Synthesize your capstone or independent technical benchmark into a structured workshop paper or preprint. A single verifiable paper is the strongest differentiator for thesis programs.',
      start: 0,
      span: 3,
      priority: 'high',
      factor: 'research',
      lever: { publications: 1 },
    });
  } else {
    items.push({
      id: 'dyn-research-ext',
      title: `Extend research with production evaluation (${profile.publications} → ${profile.publications + 1} pubs)`,
      detail:
        'Expand existing published research with an empirical evaluation on real-world workloads to demonstrate independent technical depth for graduate assistantships.',
      start: 0,
      span: 3,
      priority: 'medium',
      factor: 'research',
      lever: { publications: profile.publications + 1 },
    });
  }

  // Phase 1: Standardized Exams / Quant Score (Months 1-4)
  if (profile.gre === 0) {
    items.push({
      id: 'dyn-gre',
      title: 'Take official GRE (Target 324+ Quant focus)',
      detail:
        'Standardized quant scores significantly bolster admission chances at quantitative CS programs. Focus on Data Interpretation, Algebra, and Geometry.',
      start: 1,
      span: 3,
      priority: 'high',
      factor: 'gre',
      lever: { gre: 324 },
    });
  } else if (profile.gre < 322) {
    const targetGre = Math.min(335, profile.gre + 6);
    items.push({
      id: 'dyn-gre',
      title: `Retake GRE (Current: ${profile.gre} → Target: ${targetGre}+)`,
      detail: `Your current score of ${profile.gre} is slightly below the median at ${topReach}. A 4–6 point lift in Quantitative reasoning moves your profile into the competitive pool.`,
      start: 1,
      span: 3,
      priority: 'high',
      factor: 'gre',
      lever: { gre: targetGre },
    });
  } else {
    items.push({
      id: 'dyn-gre-verified',
      title: `Verified GRE score (${profile.gre}) meets competitive bar`,
      detail: `Your ${profile.gre} score clears the median requirement for ${topTarget} and aligns with top 20% applicants. No retake necessary.`,
      start: 1,
      span: 2,
      priority: 'low',
      factor: 'gre',
    });
  }

  // Phase 2: Statement of Purpose Faculty Alignment (Months 4-6)
  const targetSop = Math.min(95, Math.max(82, (profile.sopQuality || 65) + 15));
  items.push({
    id: 'dyn-sop',
    title: `Tailor Statement of Purpose for ${primarySchool}`,
    detail: `Name 2 specific faculty research groups and align your undergraduate/industry achievements directly with curriculum specializations at ${topReach || topTarget}.`,
    start: 3,
    span: 3,
    priority: 'high',
    factor: 'strategy',
    lever: { sopQuality: targetSop },
  });

  // Phase 2: Recommendation Letters (Months 5-7)
  items.push({
    id: 'dyn-lor',
    title: 'Provide recommenders with detailed project dossiers',
    detail: `Supply your recommenders with a structured 1-page dossier highlighting your analytical contributions, code repo links, and specific fit with ${primarySchool}.`,
    start: 4,
    span: 3,
    priority: 'medium',
    factor: 'strategy',
    lever: { lorStrength: 4.5 },
  });

  // Phase 3: Application Priority Submissions (Months 7-9)
  const targetListStr = targetUnis.slice(0, 3).join(', ') || 'Matched Target Institutions';
  items.push({
    id: 'dyn-target-apps',
    title: `Submit Target & Reach applications (${targetListStr})`,
    detail: `Lock in early submissions before priority cutoffs to maximize fellowship and merit funding consideration.`,
    start: 6,
    span: 3,
    priority: 'high',
    factor: 'strategy',
  });

  // Phase 4: Interviews, GRA/GTA Outreach & Funding (Months 9-12)
  items.push({
    id: 'dyn-funding',
    title: 'Interviews, GRA/GTA Outreach & Funding Decisions',
    detail:
      'Prepare for departmental faculty interviews, apply for Graduate Research Assistantships (GRA/GTA), evaluate financial packages, and finalize I-20 documentation.',
    start: 8,
    span: 4,
    priority: 'low',
    factor: 'strategy',
  });

  return items;
}
