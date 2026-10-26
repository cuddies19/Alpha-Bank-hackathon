import { useQuery } from '@tanstack/react-query';
import type { NeedRequest } from '../model/needParams';
import { productApi } from './productApi';

export const productKeys = {
  all: ['products'] as const,
  recommendation: (companyId: string, request: NeedRequest = {}) =>
    ['products', 'recommendation', companyId, request] as const,
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: productApi.list });
}

export function useRecommendation(companyId: string, request: NeedRequest = {}) {
  return useQuery({
    queryKey: productKeys.recommendation(companyId, request),
    queryFn: () => productApi.recommendation(companyId, request),
  });
}
