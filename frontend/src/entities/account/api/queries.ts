import { useQuery } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export const accountKeys = {
  summary: (companyId: string) => ['account', 'summary', companyId] as const,
  turnover: (companyId: string) => ['account', 'turnover', companyId] as const,
};

export function useAccountSummary(companyId: string) {
  return useQuery({
    queryKey: accountKeys.summary(companyId),
    queryFn: () => mockResponse(() => server.getAccountSummary(companyId)),
  });
}

export function useYearTurnover(companyId: string) {
  return useQuery({
    queryKey: accountKeys.turnover(companyId),
    queryFn: () => mockResponse(() => server.getYearTurnover(companyId)),
  });
}
