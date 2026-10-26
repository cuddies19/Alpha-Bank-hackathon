import type { Dto } from '@/shared/api';
import { cachedGet, http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import { annuityPayment, formatApproxMoney, formatMoney, formatMonths, formatPercent } from '@/shared/lib';
import * as server from '@/mocks/server';
import type { Offer, Product, ProductId, Recommendation } from '../model/types';

const CODE_TO_ID: Record<string, ProductId> = {
  overdraft: 'overdraft',
  credit: 'loan',
  credit_line: 'credit-line',
};

const COMFORT_SHARE = 0.3;

export function productIdFromCode(code: string): ProductId {
  return CODE_TO_ID[code] ?? 'loan';
}

function termLabel(min: number, max: number) {
  return min === max ? formatMonths(max) : min <= 1 ? `до ${formatMonths(max)}` : `${min}–${formatMonths(max)}`;
}

function toProduct(dto: Dto.ProductOut): Product {
  const id = productIdFromCode(dto.code);
  const copy = server.listProducts().find((p) => p.id === id);
  return {
    id,
    name: dto.name,
    task: copy?.task ?? dto.name,
    purpose: copy?.purpose ?? dto.description,
    status: 'active',
    amountLabel: copy?.amountLabel ?? 'Сумма до',
    limitMin: dto.min_amount,
    limitMax: dto.max_amount,
    termLabel: termLabel(dto.min_term_months, dto.max_term_months),
    termMaxMonths: dto.max_term_months,
    rateFrom: dto.rate,
    requirement: copy?.requirement ?? (dto.features ?? [])[0],
  };
}

export const fetchProductDtos = () => cachedGet<Dto.ProductOut[]>('/products');

export async function productApiId(id: ProductId): Promise<number> {
  const dtos = await fetchProductDtos();
  const dto = dtos.find((p) => productIdFromCode(p.code) === id);
  if (!dto) throw new Error('Продукт пока недоступен для заявки');
  return dto.id;
}

async function listProducts(): Promise<Product[]> {
  const api = (await fetchProductDtos()).map(toProduct);
  const soon = server.listProducts().filter((p) => p.status === 'soon' && !api.some((a) => a.id === p.id));
  return [...api, ...soon];
}

export async function monthlyCashFlow(): Promise<number> {
  const cashflow = await cachedGet<Dto.CashflowResponse>('/me/cashflow');
  return cashflow.months.length ? Math.round(cashflow.net_flow / cashflow.months.length) : cashflow.net_flow;
}

function comfortAmount(cashFlow: number, rate: number, term: number) {
  const payment = cashFlow * COMFORT_SHARE;
  const r = rate / 1200;
  const principal = r > 0 ? (payment * (1 - Math.pow(1 + r, -term))) / r : payment * term;
  return Math.max(0, Math.floor(principal / 100000) * 100000);
}

async function getRecommendation(): Promise<Recommendation> {
  const base = server.getRecommendation('');
  const [response, products, cashFlow] = await Promise.all([
    http<Dto.RecommendationResponse>('/recommendations', {
      method: 'POST',
      body: { task: base.need.goal, amount: base.need.amount, term_months: base.need.term },
    }),
    listProducts(),
    monthlyCashFlow().catch(() => base.cashFlow),
  ]);
  const offers: Offer[] = response.items.slice(0, 3).map((item, index) => {
    const productId = productIdFromCode(item.product_code);
    const product = products.find((p) => p.id === productId);
    return {
      productId,
      name: item.product_name,
      purpose: product?.purpose ?? item.product_name,
      amountLabel: product?.amountLabel?.replace(/ до$/, '') ?? 'Сумма',
      amount: item.amount,
      term: item.term_months,
      rate: item.rate,
      recommended: index === 0,
      reasonsTitle: index === 0 ? 'Почему подходит' : 'Когда выбрать',
      reasons: item.reason
        .split(/\s{2,}|;\s*/)
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => r[0].toUpperCase() + r.slice(1)),
    };
  });
  for (const product of products) {
    if (offers.length >= 2) break;
    if (product.status !== 'active' || offers.some((o) => o.productId === product.id)) continue;
    const amount = Math.min(Math.max(base.need.amount, product.limitMin ?? 0), product.limitMax ?? base.need.amount);
    offers.push({
      productId: product.id,
      name: product.name,
      purpose: product.purpose,
      amountLabel: product.amountLabel?.replace(/ до$/, '') ?? 'Сумма',
      amount,
      term: Math.min(base.need.term, product.termMaxMonths ?? base.need.term),
      rate: product.rateFrom ?? 0,
      reasonsTitle: 'Когда выбрать',
      reasons: [product.task],
    });
  }
  const first = offers[0];
  const payment = (o: Offer) => annuityPayment({ principal: o.amount, ratePct: o.rate, months: o.term, roundTo: 100 });
  return {
    need: base.need,
    cashFlow,
    offers,
    comfortAmount: first ? comfortAmount(cashFlow, first.rate, first.term) : base.comfortAmount,
    alternatives: products
      .filter((p) => p.status === 'active' && !offers.some((o) => o.productId === p.id))
      .map((p) => ({ product: p.name, reason: p.purpose })),
    comparisonColumns: offers.map((o) => o.name),
    comparison: [
      { param: 'Сумма', values: offers.map((o) => formatMoney(o.amount)) },
      { param: 'Срок', values: offers.map((o) => formatMonths(o.term)) },
      { param: 'Ставка', values: offers.map((o) => `от ${formatPercent(o.rate)}`) },
      { param: 'Платёж', values: offers.map((o) => formatApproxMoney(payment(o))) },
    ],
  };
}

export const productApi = USE_API
  ? { list: listProducts, recommendation: (_companyId: string) => getRecommendation() }
  : {
      list: () => mockResponse(() => server.listProducts()),
      recommendation: (companyId: string) => mockResponse(() => server.getRecommendation(companyId)),
    };
