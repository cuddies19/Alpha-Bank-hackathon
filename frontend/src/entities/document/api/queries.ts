import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export const documentKeys = {
  list: (companyId: string) => ['documents', companyId] as const,
};

export function useClientDocuments(companyId: string) {
  return useQuery({
    queryKey: documentKeys.list(companyId),
    queryFn: () => mockResponse(() => server.listClientDocuments(companyId)),
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.tone === 'info' || d.tone === 'neutral') ? 1_500 : false,
  });
}

export function useUploadClientDocument(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, name, size }: { applicationId: string; name: string; size: string }) =>
      mockResponse(() => server.uploadClientDocument(companyId, applicationId, name, size)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.list(companyId) }),
  });
}
