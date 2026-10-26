import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Dto } from '@/shared/api';
import { http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import { formatClock, formatRelativeDay } from '@/shared/lib';
import * as server from '@/mocks/server';
import type { AppNotification } from '../model/types';

export const notificationKeys = {
  list: (companyId: string) => ['notifications', companyId] as const,
};

const TITLE: Record<Dto.NotificationType, string> = {
  status_change: 'Статус заявки изменился',
  decision: 'Решение по заявке готово',
  document_request: 'Банку нужны документы',
  info: 'Сообщение банка',
};

function link(n: Dto.NotificationOut) {
  if (!n.application_id) return '/client/applications';
  const base = `/client/applications/${n.application_id}`;
  return n.type === 'decision' || n.type === 'document_request' ? `${base}/decision` : base;
}

function toNotification(n: Dto.NotificationOut): AppNotification {
  return {
    id: String(n.id),
    title: TITLE[n.type],
    text: n.text,
    time: formatClock(n.created_at),
    day: formatRelativeDay(n.created_at),
    to: link(n),
    unread: !n.read,
  };
}

const notificationApi = USE_API
  ? {
      list: async (_companyId: string) =>
        (await http<Dto.NotificationList>('/notifications')).items.map(toNotification),
      markAll: async (_companyId: string) => {
        const { items } = await http<Dto.NotificationList>('/notifications');
        await Promise.all(
          items.filter((n) => !n.read).map((n) => http(`/notifications/${n.id}/read`, { method: 'POST' })),
        );
      },
      markOne: async (_companyId: string, id: string) => {
        await http(`/notifications/${id}/read`, { method: 'POST' });
      },
    }
  : {
      list: (companyId: string) => mockResponse(() => server.listNotifications(companyId)),
      markAll: (companyId: string) => mockResponse(() => server.markAllNotificationsRead(companyId)),
      markOne: (companyId: string, id: string) => mockResponse(() => server.markNotificationRead(companyId, id)),
    };

export function useNotifications(companyId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.list(companyId ?? ''),
    queryFn: () => notificationApi.list(companyId!),
    enabled: Boolean(companyId),
    refetchInterval: 10000,
  });
}

export function useMarkAllNotificationsRead(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAll(companyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.list(companyId) }),
  });
}

export function useMarkNotificationRead(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markOne(companyId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.list(companyId) }),
  });
}
