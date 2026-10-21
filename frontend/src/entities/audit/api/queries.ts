import { useQuery } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export function useAuditLog() {
  return useQuery({ queryKey: ['audit'], queryFn: () => mockResponse(() => server.listAudit()) });
}
