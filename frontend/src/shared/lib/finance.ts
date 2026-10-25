import { formatDate } from './format';

export interface AnnuityInput {
  principal: number;
  ratePct: number;
  months: number;
  roundTo?: number;
}

export function annuityPayment({ principal, ratePct, months, roundTo }: AnnuityInput): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = ratePct / 1200;
  const raw = r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -months)) : principal / months;
  return roundTo ? Math.round(raw / roundTo) * roundTo : raw;
}

export function overpayment(input: AnnuityInput): number {
  return annuityPayment(input) * input.months - input.principal;
}

export function paymentShare(payment: number, cashFlow: number): number {
  return cashFlow > 0 ? Math.round((payment / cashFlow) * 100) : 100;
}

export interface ScheduleRow {
  index: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  rest: number;
}

export function buildSchedule(input: AnnuityInput & { firstDate: Date }): ScheduleRow[] {
  const pay = annuityPayment(input);
  const r = input.ratePct / 1200;
  let rest = input.principal;
  return Array.from({ length: input.months }, (_, i) => {
    const interest = rest * r;
    const principal = i === input.months - 1 ? rest : pay - interest;
    rest = Math.max(0, rest - principal);
    const date = new Date(input.firstDate.getFullYear(), input.firstDate.getMonth() + i, input.firstDate.getDate());
    return { index: i + 1, date: formatDate(date), payment: principal + interest, principal, interest, rest };
  });
}

export function loadLabel(share: number): string {
  if (share <= 30) return 'комфортная нагрузка';
  if (share <= 50) return 'нагрузка на грани';
  return 'высокая нагрузка';
}
