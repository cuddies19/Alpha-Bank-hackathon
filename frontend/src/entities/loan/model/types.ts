export interface Loan {
  id: string;
  productName: string;
  contract: string;
  signedAt: string;
  rate: number;
  until: string;
  principal: number;
  rest: number;
  term: number;
  payment: number;
  nextPaymentDate: string;
  nextPaymentIn: string;
  paidCount: number;
  firstPaymentDate: string;
  insight?: { title: string; text: string };
}
