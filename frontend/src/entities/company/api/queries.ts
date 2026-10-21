import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';
import type { CompanyProfile, ConsentId, NotificationPrefId } from '../model/types';

export const companyKeys = {
  profile: (companyId: string) => ['company', 'profile', companyId] as const,
};

export const companyApi = {
  profile: (companyId: string) => mockResponse(() => server.getProfile(companyId)),
  setPref: (companyId: string, id: NotificationPrefId, enabled: boolean) =>
    mockResponse(() => server.setPref(companyId, id, enabled)),
  revokeConsent: (companyId: string, id: ConsentId) => mockResponse(() => server.revokeConsent(companyId, id)),
};

export function useCompanyProfile(companyId: string) {
  return useQuery({ queryKey: companyKeys.profile(companyId), queryFn: () => companyApi.profile(companyId) });
}

export function useSetNotificationPref(companyId: string) {
  const queryClient = useQueryClient();
  const queryKey = companyKeys.profile(companyId);
  const mutationKey = ['set-notification-pref', companyId];
  return useMutation({
    mutationKey,
    mutationFn: ({ id, enabled }: { id: NotificationPrefId; enabled: boolean }) =>
      companyApi.setPref(companyId, id, enabled),
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CompanyProfile>(queryKey);
      if (previous) {
        queryClient.setQueryData<CompanyProfile>(queryKey, {
          ...previous,
          prefs: previous.prefs.map((p) => (p.id === id ? { ...p, enabled } : p)),
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey }) === 1) void queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useRevokeConsent(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ConsentId) => companyApi.revokeConsent(companyId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.profile(companyId) }),
  });
}
