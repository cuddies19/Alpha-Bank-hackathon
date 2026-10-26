import type { FinancingNeed } from './types';

export type NeedRequest = Partial<Pick<FinancingNeed, 'goal' | 'amount' | 'term' | 'neededBy' | 'repaymentSource'>>;

const KEYS = { goal: 'goal', amount: 'amount', term: 'term', neededBy: 'when', repaymentSource: 'source' } as const;

export function needToSearch(need: NeedRequest): string {
  const params = new URLSearchParams();
  for (const [field, key] of Object.entries(KEYS) as Array<[keyof NeedRequest, string]>) {
    const value = need[field];
    if (value !== undefined && value !== '' && value !== 0) params.set(key, String(value));
  }
  return params.toString();
}

export function needFromSearch(params: URLSearchParams): NeedRequest {
  const text = (key: string) => params.get(key)?.trim() || undefined;
  const num = (key: string) => {
    const value = Number(params.get(key));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  return {
    goal: text(KEYS.goal),
    amount: num(KEYS.amount),
    term: num(KEYS.term),
    neededBy: text(KEYS.neededBy),
    repaymentSource: text(KEYS.repaymentSource),
  };
}

export function mergeNeed(base: FinancingNeed, request: NeedRequest): FinancingNeed {
  const defined = Object.fromEntries(Object.entries(request).filter(([, value]) => value !== undefined));
  const merged = { ...base, ...defined };
  return request.goal && request.goal !== base.goal ? { ...merged, quote: request.goal, termHint: undefined } : merged;
}

export function parseNeedText(text: string): Pick<NeedRequest, 'amount' | 'term'> {
  const lower = text.toLowerCase().replace(/\s+/g, ' ');
  const millions = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:млн|миллион)/);
  const thousands = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:тыс)/);
  const months = lower.match(/(\d{1,3})\s*(?:мес)/);
  const years = lower.match(/(\d{1,2})\s*(?:год|года|лет)/);
  const amount = millions
    ? Math.round(Number(millions[1].replace(',', '.')) * 1000000)
    : thousands
      ? Math.round(Number(thousands[1].replace(',', '.')) * 1000)
      : undefined;
  const term = months ? Number(months[1]) : years ? Number(years[1]) * 12 : undefined;
  return { amount, term };
}
