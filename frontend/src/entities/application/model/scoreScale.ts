import type { RiskClass } from './types';

export const SCORE_MIN = 300;
export const SCORE_MAX = 850;

export const RISK_BANDS: ReadonlyArray<{ riskClass: RiskClass; from: number; to: number }> = [
  { riskClass: 'E', from: 300, to: 400 },
  { riskClass: 'D', from: 400, to: 500 },
  { riskClass: 'C', from: 500, to: 620 },
  { riskClass: 'B', from: 620, to: 750 },
  { riskClass: 'A', from: 750, to: 850 },
];

export const SCORE_RANGE_LABEL = `${SCORE_MIN}–${SCORE_MAX}`;

export function scorePosition(score: number): number {
  const clamped = Math.min(SCORE_MAX, Math.max(SCORE_MIN, score));
  return ((clamped - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
}
