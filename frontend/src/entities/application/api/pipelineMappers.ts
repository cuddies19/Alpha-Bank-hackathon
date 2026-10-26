import type { Dto } from '@/shared/api';
import { formatDay, formatMoney, formatMonths, plural } from '@/shared/lib';
import type { CheckStatus, ProductRuleResult, SourceCheck, SourceId } from '../model/types';

type Row = { term: string; details: string };
type Response = Record<string, unknown>;

const SOURCE_ID: Record<string, SourceId> = {
  egrul: 'egrul',
  fns: 'fns',
  bki: 'bki',
  statement: 'statement',
  scoring: 'scoring',
};

const CHECK_STATUS: Record<Dto.SourceStatus, CheckStatus> = {
  ok: 'ok',
  warn: 'warn',
  fail: 'fail',
  unavailable: 'fail',
};

const EGRUL_STATUS: Record<string, string> = {
  active: 'Действующее',
  liquidating: 'В процессе ликвидации',
  liquidated: 'Ликвидировано',
};

const TAX_REGIME: Record<string, string> = {
  usn_income: 'УСН «Доходы»',
  usn_income_expense: 'УСН «Доходы минус расходы»',
  osno: 'ОСНО',
  patent: 'Патент',
  eshn: 'ЕСХН',
};

const num = (value: unknown) => (typeof value === 'number' ? value : Number(value ?? 0));
const yesNo = (value: unknown) => (value ? 'Да' : 'Нет');
const days = (value: number) => (value > 0 ? `${value} ${plural(value, ['день', 'дня', 'дней'])}` : 'Нет');

interface StatementMonth {
  month: string;
  inflow_rub: number;
  outflow_rub: number;
}

interface BkiLoan {
  bank: string;
  balance_rub: number;
  monthly_payment_rub: number;
}

function findCheck(checks: Dto.SourceCheckOut[] | undefined, source: string): Response | undefined {
  return checks?.find((c) => c.source === source && c.status !== 'unavailable')?.response as Response | undefined;
}

export function statementMonths(checks: Dto.SourceCheckOut[] | undefined): StatementMonth[] {
  const months = findCheck(checks, 'statement')?.months;
  return Array.isArray(months) ? (months as StatementMonth[]) : [];
}

export function statementCashFlow(checks: Dto.SourceCheckOut[] | undefined): number {
  const months = statementMonths(checks);
  if (!months.length) return 0;
  const net = months.reduce((sum, m) => sum + num(m.inflow_rub) - num(m.outflow_rub), 0);
  return Math.round(net / months.length);
}

export function bkiLoans(checks: Dto.SourceCheckOut[] | undefined): BkiLoan[] {
  const loans = findCheck(checks, 'bki')?.loans;
  return Array.isArray(loans) ? (loans as BkiLoan[]) : [];
}

export function egrulResponse(checks: Dto.SourceCheckOut[] | undefined): Response | undefined {
  return findCheck(checks, 'egrul');
}

function egrul(r: Response): { summary: string; details: Row[] } {
  const status = String(r.status ?? '');
  return {
    summary: status === 'active' ? 'Компания действует' : `Статус в реестре: ${EGRUL_STATUS[status] ?? status}`,
    details: [
      { term: 'Статус', details: EGRUL_STATUS[status] ?? status },
      {
        term: 'Зарегистрировано',
        details: r.registration_date ? formatDay(String(r.registration_date), { year: true }) : '—',
      },
      { term: 'ОКВЭД', details: String(r.okved ?? '—') },
      { term: 'Руководитель', details: String(r.head_name ?? '—') },
      { term: 'Адрес', details: String(r.address ?? '—') },
    ],
  };
}

function fns(r: Response): { summary: string; details: Row[] } {
  const debt = num(r.tax_debt_rub);
  return {
    summary: debt > 0 ? `Налоговая задолженность ${formatMoney(debt)}` : 'Налоговой задолженности нет',
    details: [
      { term: 'Налоговая задолженность', details: debt > 0 ? formatMoney(debt) : 'Нет' },
      { term: 'Доходы за прошлый год', details: formatMoney(num(r.income_last_year_rub)) },
      { term: 'Расходы за прошлый год', details: formatMoney(num(r.expenses_last_year_rub)) },
      { term: 'Среднесписочная численность', details: String(r.avg_headcount ?? '—') },
      { term: 'Налоговый режим', details: TAX_REGIME[String(r.tax_regime)] ?? String(r.tax_regime ?? '—') },
      { term: 'Недостоверный адрес', details: yesNo(r.address_unreliable) },
      { term: 'Массовый руководитель', details: yesNo(r.mass_director) },
    ],
  };
}

function bki(r: Response): { summary: string; details: Row[] } {
  const overdue12 = num(r.max_overdue_days_12m);
  const loans = Array.isArray(r.loans) ? (r.loans as BkiLoan[]) : [];
  return {
    summary: overdue12 > 0 ? `Просрочка ${days(overdue12)} за последний год` : 'Просрочек за последний год нет',
    details: [
      { term: 'Просрочка за 12 месяцев', details: days(overdue12) },
      { term: 'Просрочка за 24 месяца', details: days(num(r.max_overdue_days_24m)) },
      { term: 'Действующие кредиты', details: loans.length ? String(loans.length) : 'Нет' },
      { term: 'Запросы истории за 30 дней', details: String(r.inquiries_30d ?? 0) },
    ],
  };
}

function statement(r: Response): { summary: string; details: Row[] } {
  const months = Array.isArray(r.months) ? (r.months as StatementMonth[]) : [];
  const count = months.length;
  const inflow = count ? months.reduce((s, m) => s + num(m.inflow_rub), 0) / count : 0;
  const net = count ? months.reduce((s, m) => s + num(m.inflow_rub) - num(m.outflow_rub), 0) / count : 0;
  return {
    summary: count ? `Средний чистый поток ${formatMoney(Math.round(net))} в месяц` : 'Операций по счёту нет',
    details: [
      { term: 'Период', details: count ? formatMonths(count) : '—' },
      { term: 'Средние поступления', details: `${formatMoney(Math.round(inflow))} в месяц` },
      { term: 'Средний чистый поток', details: `${formatMoney(Math.round(net))} в месяц` },
    ],
  };
}

const DESCRIBE: Record<string, (r: Response) => { summary: string; details: Row[] }> = { egrul, fns, bki, statement };

export function sourceCheckOf(c: Dto.SourceCheckOut): SourceCheck {
  const status = CHECK_STATUS[c.status];
  const time = `${(c.response_time_ms / 1000).toFixed(1).replace('.', ',')} с${c.attempts > 1 ? ` × ${c.attempts}` : ''}`;
  const base = { id: SOURCE_ID[c.source] ?? 'egrul', name: c.source_label, status, time };
  if (c.status === 'unavailable' || c.status === 'fail') {
    return {
      ...base,
      summary: `Не ответил${c.attempts > 1 ? ` за ${c.attempts} ${plural(c.attempts, ['попытку', 'попытки', 'попыток'])}` : ''}`,
      details: [{ term: 'Что делать', details: 'Запросите повторно или проверьте вручную' }],
    };
  }
  const describe = DESCRIBE[c.source];
  const described = describe ? describe((c.response ?? {}) as Response) : { summary: 'Ответ получен', details: [] };
  return { ...base, ...described };
}

const RULE_LABEL: Record<string, string> = {
  egrul_status: 'Компания действует',
  bki_overdue: 'Просрочка за 12 месяцев',
  risk_class: 'Класс риска',
  business_age: 'Возраст бизнеса',
  amount_min: 'Сумма не меньше минимальной',
  amount_max: 'Сумма не больше максимальной',
  term_min: 'Срок не меньше минимального',
  term_max: 'Срок не больше максимального',
  payment_share: 'Доля платежа в потоке',
  payment_share_max: 'Доля платежа, предел',
  financial_statements: 'Бухгалтерская отчётность',
  other_bank_revenue: 'Выручка через другой банк',
};

function percent(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? `${Math.round(n * 100)}%` : value;
}

function listValue(value: string) {
  return value
    .replace(/[[\]']/g, '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function ruleValues(code: string, value: string, threshold: string): { value: string; threshold: string } {
  switch (code) {
    case 'egrul_status':
      return {
        value: EGRUL_STATUS[value] ?? value,
        threshold: 'Действующее',
      };
    case 'bki_overdue':
      return { value: days(Number(value)), threshold: `не больше ${days(Number(threshold))}` };
    case 'risk_class':
      return { value, threshold: `не ${listValue(threshold).join(', ')}` };
    case 'business_age':
      return { value: formatMonths(Number(value)), threshold: `от ${formatMonths(Number(threshold))}` };
    case 'amount_min':
      return { value: formatMoney(Number(value)), threshold: `от ${formatMoney(Number(threshold))}` };
    case 'amount_max':
      return { value: formatMoney(Number(value)), threshold: `до ${formatMoney(Number(threshold))}` };
    case 'term_min':
      return { value: formatMonths(Number(value)), threshold: `от ${formatMonths(Number(threshold))}` };
    case 'term_max':
      return { value: formatMonths(Number(value)), threshold: `до ${formatMonths(Number(threshold))}` };
    case 'payment_share':
    case 'payment_share_max':
      return { value: percent(value), threshold: `не выше ${percent(threshold)}` };
    case 'financial_statements':
      return {
        value: value === 'True' ? 'Загружена' : 'Не нужна',
        threshold: `нужна при сумме от ${formatMoney(Number(threshold))}`,
      };
    case 'other_bank_revenue':
      return { value: value === 'True' ? 'Да' : 'Нет', threshold: 'Нет' };
    default:
      return { value, threshold };
  }
}

export function ruleOf(r: Dto.RuleResultOut): ProductRuleResult {
  return { rule: RULE_LABEL[r.code] ?? r.code, ...ruleValues(r.code, r.value, r.threshold), passed: r.passed };
}

export function turnoverOf(checks: Dto.SourceCheckOut[] | undefined) {
  const short = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return statementMonths(checks).map((m) => ({
    label: short[Number(m.month.slice(5, 7)) - 1] ?? m.month,
    income: Math.round(num(m.inflow_rub) / 10_000) / 100,
    outcome: Math.round(num(m.outflow_rub) / 10_000) / 100,
  }));
}
