import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export const notificationKeys = {
  list: (companyId: string) => ['notifications', companyId] as const,
};

export function useNotifications(companyId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.list(companyId ?? ''),
    queryFn: () => mockResponse(() => server.listNotifications(companyId!)),
    enabled: Boolean(companyId),
    refetchInterval: 10_000,
  });
}

export function useMarkAllNotificationsRead(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mockResponse(() => server.markAllNotificationsRead(companyId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.list(companyId) }),
  });
}

export function useMarkNotificationRead(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockResponse(() => server.markNotificationRead(companyId, id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.list(companyId) }),
  });
}
