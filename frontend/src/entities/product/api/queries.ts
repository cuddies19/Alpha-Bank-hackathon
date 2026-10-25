import { useQuery } from '@tanstack/react-query';
import { productApi } from './productApi';

export const productKeys = {
  all: ['products'] as const,
  recommendation: (companyId: string) => ['products', 'recommendation', companyId] as const,
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: productApi.list });
}

export function useRecommendation(companyId: string) {
  return useQuery({
    queryKey: productKeys.recommendation(companyId),
    queryFn: () => productApi.recommendation(companyId),
  });
}
