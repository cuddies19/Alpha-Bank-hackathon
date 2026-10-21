import { useQuery } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export const productKeys = {
  all: ['products'] as const,
  recommendation: (companyId: string) => ['products', 'recommendation', companyId] as const,
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: () => mockResponse(() => server.listProducts()) });
}

export function useRecommendation(companyId: string) {
  return useQuery({
    queryKey: productKeys.recommendation(companyId),
    queryFn: () => mockResponse(() => server.getRecommendation(companyId)),
  });
}
