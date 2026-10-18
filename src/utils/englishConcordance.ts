/**
 * Official ETS / IELTS Concordance Scale
 * https://www.ets.org/toefl/score-users/scores-admissions/compare/
 */

export const IELTS_BANDS = [9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0, 4.5, 4.0];

export function ieltsToToefl(ielts: number): number {
  if (ielts >= 9.0) return 120;
  if (ielts >= 8.5) return 115;
  if (ielts >= 8.0) return 110;
  if (ielts >= 7.5) return 105;
  if (ielts >= 7.0) return 98;
  if (ielts >= 6.5) return 86;
  if (ielts >= 6.0) return 75;
  if (ielts >= 5.5) return 60;
  if (ielts >= 5.0) return 45;
  if (ielts > 0) return 35;
  return 0;
}

export function toeflToIelts(toefl: number): number {
  if (toefl >= 118) return 9.0;
  if (toefl >= 115) return 8.5;
  if (toefl >= 110) return 8.0;
  if (toefl >= 102) return 7.5;
  if (toefl >= 94) return 7.0;
  if (toefl >= 79) return 6.5;
  if (toefl >= 60) return 6.0;
  if (toefl >= 46) return 5.5;
  if (toefl >= 35) return 5.0;
  return 0;
}
