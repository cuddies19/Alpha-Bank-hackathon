import type { AccountSummary, YearTurnover } from '@/entities/account';

export const ACCOUNT_SUMMARIES: Record<string, AccountSummary> = {
  'dom-i-uyut': {
    greetingName: 'Игорь',
    updatedAt: '24 октября, 10:42',
    accountMask: '4821',
    balance: 1240500,
    incomes30d: 3860000,
    incomeDelta: { value: '+12%', label: 'к сентябрю' },
    netCashFlow: 610000,
    loanPayments: 38000,
    loanPaymentsHint: 'в месяц, 1 кредит в другом банке',
    insight: {
      title: 'Через 12 дней возможен кассовый разрыв',
      text: 'Выплата от маркетплейса придёт 6 ноября, а закупка нужна до 1 ноября.',
    },
    period: 'Май — октябрь 2026',
    months: [
      { label: 'май', income: 2.4, outcome: 1.75 },
      { label: 'июнь', income: 2.1, outcome: 1.55 },
      { label: 'июль', income: 1.9, outcome: 1.45 },
      { label: 'август', income: 2.5, outcome: 1.85 },
      { label: 'сентябрь', income: 3.45, outcome: 2.8 },
      { label: 'октябрь', income: 3.86, outcome: 3.15 },
    ],
    chartSummary: 'Выручка растёт к сезону распродаж: в октябре поступления выше июльских в 2 раза.',
    events: [
      {
        id: 'e1',
        text: 'Ассистент заметил возможный кассовый разрыв',
        time: '10:42',
        icon: 'sparkle',
        fromAssistant: true,
      },
      { id: 'e2', text: 'Выписка по счёту обновлена', time: '10:40', icon: 'document' },
      { id: 'e3', text: 'Выплата от маркетплейса ожидается 6 ноября', time: 'вчера', icon: 'calendar' },
    ],
  },
};

export const YEAR_TURNOVER: Record<string, YearTurnover> = {
  'dom-i-uyut': {
    period: 'ноябрь 2025 — октябрь 2026',
    totalIncome: 33210000,
    months: [
      { label: 'ноя', income: 3.9, outcome: 3.2 },
      { label: 'дек', income: 4.1, outcome: 3.5 },
      { label: 'янв', income: 2.2, outcome: 1.7 },
      { label: 'фев', income: 2.0, outcome: 1.5 },
      { label: 'мар', income: 2.3, outcome: 1.7 },
      { label: 'апр', income: 2.5, outcome: 1.9 },
      { label: 'май', income: 2.4, outcome: 1.75 },
      { label: 'июн', income: 2.1, outcome: 1.55 },
      { label: 'июл', income: 1.9, outcome: 1.45 },
      { label: 'авг', income: 2.5, outcome: 1.85 },
      { label: 'сен', income: 3.45, outcome: 2.8 },
      { label: 'окт', income: 3.86, outcome: 3.15 },
    ],
    existingLoans: [{ title: 'Кредит в другом банке', rest: 450000, payment: 38000 }],
  },
};
