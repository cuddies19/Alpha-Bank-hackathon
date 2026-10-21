import type { IconName } from '@/shared/ui';

export interface FinancingGoal {
  id: string;
  title: string;
  text: string;
  icon: IconName;
  soon?: string;
}

export const FINANCING_GOALS: FinancingGoal[] = [
  { id: 'gap', title: 'Кассовый разрыв', text: 'Деньги нужны до поступления выручки', icon: 'calendar' },
  { id: 'turnover', title: 'Пополнить оборот', text: 'Закупки партиями, сезонный товар', icon: 'trend-up' },
  {
    id: 'equipment',
    title: 'Развитие и оборудование',
    text: 'Кредит на любые цели',
    icon: 'wallet',
    soon: 'Лизинг — скоро',
  },
  {
    id: 'tender',
    title: 'Тендер и контракт',
    text: 'Исполнение контракта до оплаты',
    icon: 'document',
    soon: 'Гарантия — скоро',
  },
  { id: 'refinance', title: 'Рефинансировать кредиты', text: 'Снизить платёж по текущим кредитам', icon: 'trend-down' },
];

export const PRODUCT_ACCUSATIVE: Record<string, string> = {
  overdraft: 'овердрафт',
  'credit-line': 'кредитную линию',
  loan: 'кредит на любые цели',
  guarantee: 'банковскую гарантию',
  leasing: 'лизинг',
};
