import {
  NotificationItem,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type AppNotification,
} from '@/entities/notification';
import { useCompanyId } from '@/entities/session';
import { routes } from '@/shared/config';
import {
  AsyncContent,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  PageContainer,
  PageHeader,
  Stack,
  Text,
} from '@/shared/ui';

export function NotificationsPage() {
  const companyId = useCompanyId();
  const notifications = useNotifications(companyId);
  const markAll = useMarkAllNotificationsRead(companyId);
  const markOne = useMarkNotificationRead(companyId);
  const hasUnread = notifications.data?.some((n) => n.unread);

  return (
    <PageContainer width="narrow" spacing="tight">
      <PageHeader
        title="Уведомления"
        description="Все сообщения банка приходят сюда — без писем и SMS."
        actions={
          <Button
            variant="ghost"
            iconLeft="check"
            disabled={!hasUnread}
            loading={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            Отметить все прочитанными
          </Button>
        }
      />
      <AsyncContent query={notifications}>
        {(list) =>
          list.length ? (
            groupByDay(list).map(([day, items]) => (
              <Stack as="section" key={day} gap={2} aria-label={day}>
                <Text as="h2" variant="label" tone="secondary">
                  {day}
                </Text>
                <Card padding="sm" gap={1}>
                  {items.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onOpen={(item) => item.unread && markOne.mutate(item.id)}
                    />
                  ))}
                </Card>
              </Stack>
            ))
          ) : (
            <Card>
              <EmptyState
                icon="info"
                title="Уведомлений пока нет"
                description="Когда банк ответит по заявке, сообщение появится здесь."
              />
            </Card>
          )
        }
      </AsyncContent>
      <div>
        <ButtonLink variant="link" to={routes.client.profile()}>
          Настроить уведомления в профиле
        </ButtonLink>
      </div>
    </PageContainer>
  );
}

const DAY_ORDER = ['Сегодня, 24 октября', 'Вчера, 23 октября', 'Напоминания'];

function groupByDay(list: AppNotification[]): Array<[string, AppNotification[]]> {
  const groups = new Map<string, AppNotification[]>();
  for (const n of list) groups.set(n.day, [...(groups.get(n.day) ?? []), n]);
  return [...groups.entries()].sort(([a], [b]) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}
