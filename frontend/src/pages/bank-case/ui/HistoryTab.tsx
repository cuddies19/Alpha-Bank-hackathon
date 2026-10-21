import { routes } from '@/shared/config';
import { Badge, ButtonLink, EmptyState, Feed, Section } from '@/shared/ui';
import { useCaseData } from './useCaseData';

export function HistoryTab() {
  const { history } = useCaseData();
  return (
    <Section
      title="История заявки"
      gap={2}
      aside={
        <ButtonLink variant="link" to={routes.bank.audit()}>
          Открыть в журнале аудита
        </ButtonLink>
      }
    >
      {history.length ? (
        <Feed
          timeFirst
          items={history.map((e) => ({
            id: e.id,
            time: e.time,
            text: e.what,
            detail: e.detail,
            aside: <Badge icon={false}>{e.actor}</Badge>,
          }))}
        />
      ) : (
        <EmptyState compact icon="clock" title="Событий пока нет" />
      )}
    </Section>
  );
}
