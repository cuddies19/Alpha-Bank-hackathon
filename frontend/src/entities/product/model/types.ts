export type ProductId = 'overdraft' | 'credit-line' | 'loan' | 'guarantee' | 'leasing';

export interface Product {
  id: ProductId;
  name: string;
  task: string;
  purpose: string;
  status: 'active' | 'soon';
  amountLabel?: string;
  limitMin?: number;
  limitMax?: number;
  termLabel?: string;
  termMaxMonths?: number;
  rateFrom?: number;
  requirement?: string;
}

export interface Offer {
  productId: ProductId;
  name: string;
  purpose: string;
  amountLabel: string;
  amount: number;
  term: number;
  rate: number;
  recommended?: boolean;
  reasonsTitle: string;
  reasons: string[];
}

export interface FinancingNeed {
  quote: string;
  goal: string;
  amount: number;
  neededBy: string;
  term: number;
  termHint?: string;
  repaymentSource: string;
  pledge: boolean;
}

export interface Recommendation {
  need: FinancingNeed;
  cashFlow: number;
  offers: Offer[];
  comfortAmount: number;
  alternatives: Array<{ product: string; reason: string }>;
  comparisonColumns: string[];
  comparison: Array<{ param: string; values: string[] }>;
}
