import type { AppNotification } from '@/entities/notification';

export function seedNotifications(): Record<string, AppNotification[]> {
  return {
    'dom-i-uyut': [
      {
        id: 'n-gap',
        title: 'Ассистент заметил возможный кассовый разрыв',
        text: 'Выплата от маркетплейса придёт 6 ноября, а закупка нужна до 1 ноября',
        time: '18:20',
        day: 'Вчера, 23 октября',
        to: '/client',
        unread: false,
      },
    ],
    belova: [
      {
        id: 'n-approved',
        title: 'Банк одобрил овердрафт 500 000 ₽',
        text: 'Примите условия до 31 октября',
        time: '10:31',
        day: 'Сегодня, 24 октября',
        to: '/client/applications/2026-10-0139/decision',
        unread: true,
      },
    ],
    'len-i-dub': [
      {
        id: 'n-docs',
        title: 'Банк запросил документы',
        text: 'Ответьте до 30 октября',
        time: '09:40',
        day: 'Сегодня, 24 октября',
        to: '/client/applications/2026-10-0141/decision',
        unread: true,
      },
    ],
    fomin: [
      {
        id: 'n-declined',
        title: 'Решение по заявке № 2026-10-0140',
        text: 'Сейчас банк не может выдать кредит. Посмотрите, что можно сделать',
        time: '10:12',
        day: 'Сегодня, 24 октября',
        to: '/client/applications/2026-10-0140/decision',
        unread: true,
      },
    ],
  };
}
