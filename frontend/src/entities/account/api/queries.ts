import { useQuery } from '@tanstack/react-query';
import type { Dto } from '@/shared/api';
import { cachedGet, http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import { formatStamp } from '@/shared/lib';
import * as server from '@/mocks/server';
import type { AccountSummary, MonthTurnover, YearTurnover } from '../model/types';

export const accountKeys = {
  summary: (companyId: string) => ['account', 'summary', companyId] as const,
  turnover: (companyId: string) => ['account', 'turnover', companyId] as const,
};

const MONTH_NAMES = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

const MONTH_DATIVE = [
  'январю',
  'февралю',
  'марту',
  'апрелю',
  'маю',
  'июню',
  'июлю',
  'августу',
  'сентябрю',
  'октябрю',
  'ноябрю',
  'декабрю',
];

const millions = (value: number) => Math.round(value / 10000) / 100;

function monthOf(key: string) {
  const [year, month] = key.split('-').map(Number);
  return { year, index: month - 1 };
}

function toMonths(cashflow: Dto.CashflowResponse): MonthTurnover[] {
  return cashflow.months.map((m) => ({
    label: MONTH_NAMES[monthOf(m.month).index],
    income: millions(m.inflows),
    outcome: millions(m.outflows),
  }));
}

function periodOf(cashflow: Dto.CashflowResponse) {
  const first = cashflow.months[0];
  const last = cashflow.months.at(-1);
  if (!first || !last) return '—';
  const a = monthOf(first.month);
  const b = monthOf(last.month);
  const name = (i: number) => MONTH_NAMES[i];
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  return a.year === b.year
    ? `${cap(name(a.index))} — ${name(b.index)} ${b.year}`
    : `${cap(name(a.index))} ${a.year} — ${name(b.index)} ${b.year}`;
}

async function getSummary(): Promise<AccountSummary> {
  const [cashflow, me] = await Promise.all([
    cachedGet<Dto.CashflowResponse>('/me/cashflow'),
    cachedGet<Dto.UserOut>('/me'),
  ]);
  const months = cashflow.months;
  const last = months.at(-1);
  const prev = months.at(-2);
  const delta = last && prev && prev.inflows ? Math.round(((last.inflows - prev.inflows) / prev.inflows) * 100) : 0;
  const netCashFlow = months.length ? Math.round(cashflow.net_flow / months.length) : cashflow.net_flow;
  const turnover = toMonths(cashflow);
  const peak = turnover.reduce((a, b) => (b.income > a.income ? b : a), turnover[0]);
  return {
    greetingName: me.full_name.split(' ')[0] ?? '',
    updatedAt: formatStamp(new Date()),
    accountMask: '',
    balance: cashflow.balance,
    incomes30d: last?.inflows ?? 0,
    incomeDelta: {
      value: `${delta >= 0 ? '+' : '−'}${Math.abs(delta)}%`,
      label: prev ? `к ${MONTH_DATIVE[monthOf(prev.month).index]}` : '',
    },
    netCashFlow,
    loanPayments: cashflow.loan_payments,
    loanPaymentsHint: cashflow.loan_payments ? 'в месяц по действующим кредитам' : 'в месяц, кредитов нет',
    period: periodOf(cashflow),
    months: turnover,
    chartSummary: peak ? `Больше всего поступлений было в месяце «${peak.label}» — ${peak.income} млн ₽.` : '',
    events: [],
  };
}

async function getTurnover(): Promise<YearTurnover> {
  const [cashflow, loans] = await Promise.all([
    cachedGet<Dto.CashflowResponse>('/me/cashflow'),
    http<Dto.LoanOut[]>('/loans').catch(() => [] as Dto.LoanOut[]),
  ]);
  return {
    period: periodOf(cashflow).toLowerCase(),
    totalIncome: cashflow.inflows,
    months: toMonths(cashflow),
    existingLoans: loans.map((loan) => ({
      title: `${loan.product_name}, договор № ${loan.application_number}-Д`,
      rest: loan.amount,
      payment: loan.monthly_payment,
    })),
  };
}

const accountApi = USE_API
  ? { summary: (_companyId: string) => getSummary(), turnover: (_companyId: string) => getTurnover() }
  : {
      summary: (companyId: string) => mockResponse(() => server.getAccountSummary(companyId)),
      turnover: (companyId: string) => mockResponse(() => server.getYearTurnover(companyId)),
    };

export function useAccountSummary(companyId: string) {
  return useQuery({ queryKey: accountKeys.summary(companyId), queryFn: () => accountApi.summary(companyId) });
}

export function useYearTurnover(companyId: string) {
  return useQuery({ queryKey: accountKeys.turnover(companyId), queryFn: () => accountApi.turnover(companyId) });
}
