import type { IconName } from '@/shared/ui';

export interface MonthTurnover {
  label: string;
  income: number;
  outcome: number;
}

export interface AccountEvent {
  id: string;
  text: string;
  time: string;
  icon: IconName;
  fromAssistant?: boolean;
}

export interface AccountSummary {
  greetingName: string;
  updatedAt: string;
  accountMask: string;
  balance: number;
  incomes30d: number;
  incomeDelta: { value: string; label: string };
  netCashFlow: number;
  loanPayments: number;
  loanPaymentsHint: string;
  insight?: { title: string; text: string };
  period: string;
  months: MonthTurnover[];
  chartSummary: string;
  events: AccountEvent[];
}

export interface YearTurnover {
  period: string;
  totalIncome: number;
  months: MonthTurnover[];
  existingLoans: Array<{ title: string; rest: number; payment: number }>;
}
