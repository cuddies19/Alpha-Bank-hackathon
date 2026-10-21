import { useQuery } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export function useLoans(companyId: string) {
  return useQuery({ queryKey: ['loans', companyId], queryFn: () => mockResponse(() => server.listLoans(companyId)) });
}
