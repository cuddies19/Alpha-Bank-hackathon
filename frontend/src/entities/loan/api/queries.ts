import { useQuery } from '@tanstack/react-query';
import type { Dto } from '@/shared/api';
import { http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import { formatDay, plural } from '@/shared/lib';
import * as server from '@/mocks/server';
import type { Loan } from '../model/types';

function toLoan(dto: Dto.LoanOut, now = new Date()): Loan {
  const schedule = dto.schedule ?? [];
  const today = now.toISOString().slice(0, 10);
  const paid = schedule.filter((row) => row.date < today);
  const next = schedule.find((row) => row.date >= today);
  const days = next ? Math.max(0, Math.round((new Date(next.date).getTime() - now.getTime()) / 86400000)) : 0;
  const last = schedule.at(-1);
  return {
    id: String(dto.id),
    productName: dto.product_name,
    contract: `№ ${dto.application_number}-Д`,
    signedAt: formatDay(dto.issued_at),
    rate: dto.rate,
    until: last ? formatDay(last.date, { year: true }) : '—',
    principal: dto.amount,
    rest: paid.at(-1)?.remaining ?? dto.amount,
    term: dto.term_months,
    payment: dto.monthly_payment,
    nextPaymentDate: next ? formatDay(next.date) : '—',
    nextPaymentIn: next ? (days === 0 ? 'сегодня' : `через ${days} ${plural(days, ['день', 'дня', 'дней'])}`) : '—',
    paidCount: paid.length,
    firstPaymentDate: schedule[0]?.date ?? dto.issued_at.slice(0, 10),
  };
}

const listLoans = USE_API
  ? async (_companyId: string) => (await http<Dto.LoanOut[]>('/loans')).map((l) => toLoan(l))
  : (companyId: string) => mockResponse(() => server.listLoans(companyId));

export function useLoans(companyId: string) {
  return useQuery({ queryKey: ['loans', companyId], queryFn: () => listLoans(companyId) });
}
