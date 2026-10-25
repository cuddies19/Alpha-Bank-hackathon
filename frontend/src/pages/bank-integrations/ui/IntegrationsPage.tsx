import { todayLabel } from '@/shared/lib';
import { useApplicationQueue } from '@/entities/application';
import { useSources, type Source, type SourceState } from '@/entities/integration';
import { routes } from '@/shared/config';
import {
  Alert,
  AsyncContent,
  Badge,
  ButtonLink,
  CardList,
  CellStack,
  DescriptionList,
  ExpandableCard,
  PageContainer,
  PageHeader,
  Table,
  TableSkeleton,
  Td,
  Text,
  Th,
  type IconName,
  type Tone,
} from '@/shared/ui';

const STATE_VIEW: Record<SourceState, { word: string; tone: Tone; icon: IconName }> = {
  up: { word: 'Работает', tone: 'success', icon: 'check-circle' },
  slow: { word: 'Медленно', tone: 'warning', icon: 'clock' },
  down: { word: 'Не отвечает', tone: 'danger', icon: 'x-circle' },
};

export function IntegrationsPage() {
  const sources = useSources();
  const queue = useApplicationQueue();
  const affected = queue.data?.filter((a) => a.sourceIssue && a.status === 'manual_review').length ?? 0;
  return (
    <PageContainer spacing="tight">
      <PageHeader title="Внешние источники" description={`Проверка каждые 30 секунд · ${todayLabel()}`} />
      <AsyncContent query={sources} skeleton={<TableSkeleton rows={5} />}>
        {(list) => (
          <>
            {list
              .filter((s) => s.state === 'down')
              .map((s) => (
                <DownAlert key={s.id} source={s} affected={affected} />
              ))}
            <CardList>
              {list.map((s) => (
                <ExpandableCard
                  key={s.id}
                  title={s.name}
                  aside={
                    <Badge tone={STATE_VIEW[s.state].tone} icon={STATE_VIEW[s.state].icon}>
                      {STATE_VIEW[s.state].word}
                    </Badge>
                  }
                  meta={`Ответ ${s.responseTime} · ошибок за час: ${s.errorsPerHour}`}
                >
                  <DescriptionList
                    variant="rows"
                    items={[
                      { term: 'Последний успешный ответ', details: s.lastSuccess },
                      { term: 'Правило при сбое', details: s.fallbackRule, regular: true },
                    ]}
                  />
                </ExpandableCard>
              ))}
            </CardList>
            <Table caption="Внешние источники" desktopOnly>
              <thead>
                <tr>
                  <Th>Источник</Th>
                  <Th>Статус</Th>
                  <Th align="right">Среднее время ответа</Th>
                  <Th align="right">Ошибки за час</Th>
                  <Th>Последний успешный ответ</Th>
                  <Th>Правило при сбое</Th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <Td>
                      <CellStack main={s.name} sub="Смоделированная интеграция" />
                    </Td>
                    <Td>
                      <Badge tone={STATE_VIEW[s.state].tone} icon={STATE_VIEW[s.state].icon}>
                        {STATE_VIEW[s.state].word}
                      </Badge>
                    </Td>
                    <Td align="right">{s.responseTime}</Td>
                    <Td align="right" strong={s.errorsPerHour > 5}>
                      <Text as="span" tone={s.errorsPerHour > 5 ? 'danger' : 'default'}>
                        {s.errorsPerHour}
                      </Text>
                    </Td>
                    <Td nowrap>{s.lastSuccess}</Td>
                    <Td tone="secondary">{s.fallbackRule}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Text variant="body-sm" tone="secondary">
              Тайм-аут запроса — 10 секунд, 3 попытки. Статусы можно переключить в «Режиме проверки».
            </Text>
          </>
        )}
      </AsyncContent>
    </PageContainer>
  );
}

function DownAlert({ source, affected }: { source: Source; affected: number }) {
  return (
    <Alert
      tone="danger"
      title={`${source.name} не отвечает`}
      action={
        <ButtonLink size="sm" to={routes.bank.queue()}>
          Открыть в очереди
        </ButtonLink>
      }
    >
      <p>
        Новые заявки не падают: они уходят на ручную проверку с меткой «Источник недоступен». Сейчас таких заявок —{' '}
        {affected}.
      </p>
    </Alert>
  );
}
