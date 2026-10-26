import { useState } from 'react';
import { useSources, usePipelineStats, type SourceState } from '@/entities/integration';
import { routes } from '@/shared/config';
import {
  AsyncContent,
  ButtonLink,
  Chip,
  Cluster,
  Columns,
  DescriptionList,
  Grid,
  HBarList,
  Heading,
  Icon,
  MetricTile,
  PageContainer,
  PageHeader,
  Section,
  Stack,
  Text,
  type IconName,
} from '@/shared/ui';

const PERIODS = ['Сегодня', 'Неделя', 'Месяц'] as const;
const STATE_VIEW: Record<SourceState, { icon: IconName; tone: 'success' | 'warning' | 'danger' }> = {
  up: { icon: 'check-circle', tone: 'success' },
  slow: { icon: 'alert', tone: 'warning' },
  down: { icon: 'x-circle', tone: 'danger' },
};

export function PipelinePage() {
  const stats = usePipelineStats();
  const sources = useSources();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Неделя');

  return (
    <PageContainer spacing="tight">
      <PageHeader
        title="Конвейер"
        description={stats.data ? `${stats.data.period} · синтетические данные демо` : undefined}
        actions={
          <Cluster role="group" aria-label="Период">
            {PERIODS.map((p) => (
              <Chip key={p} selected={p === period} onClick={() => setPeriod(p)}>
                {p}
              </Chip>
            ))}
          </Cluster>
        }
      />
      <AsyncContent query={stats}>
        {(data) => {
          const decisions = data.outcomes.reduce((s, o) => s + o.value, 0);
          return (
            <>
              <Grid min={220}>
                <MetricTile
                  label="Заявок за неделю"
                  value={data.metrics.applications}
                  icon="document"
                  delta={{
                    value: data.metrics.applicationsDelta,
                    direction: 'up',
                    tone: 'neutral',
                    label: 'к прошлой неделе',
                  }}
                />
                <MetricTile
                  label="Решено автоматически"
                  value={data.metrics.autoShare}
                  icon="check-circle"
                  hint={data.metrics.autoHint}
                />
                <MetricTile
                  label="Среднее время до решения"
                  value={data.metrics.avgTime}
                  icon="clock"
                  delta={{
                    value: data.metrics.avgTimeDelta,
                    direction: 'down',
                    tone: 'success',
                    label: 'к прошлой неделе',
                  }}
                />
                <MetricTile
                  label="Ждут клиента"
                  value={data.metrics.waitingClient}
                  icon="alert"
                  hint="запрошены документы"
                />
              </Grid>
              <Columns
                main={
                  <Section title="Воронка этапов">
                    <HBarList
                      items={data.funnel.map((f) => ({
                        ...f,
                        share: +((f.value / data.funnel[0].value) * 100).toFixed(1),
                      }))}
                    />
                    <Text variant="body-sm" tone="secondary">
                      {data.funnelNote}
                    </Text>
                  </Section>
                }
                side={
                  <Section title="Исходы решений">
                    <HBarList
                      labelWidth={120}
                      items={data.outcomes.map((o) => ({ ...o, share: Math.round((o.value / decisions) * 100) }))}
                    />
                    <Text variant="body-sm" tone="secondary">
                      Из {decisions} решений · шкала — доля от всех решений
                    </Text>
                  </Section>
                }
              />
              <Columns
                main={
                  <Section title="Частые причины">
                    <Grid min={260} gap={6}>
                      <Stack gap={1}>
                        <Heading level={3} variant="label" tone="secondary">
                          Отказ
                        </Heading>
                        <DescriptionList
                          variant="rows"
                          items={data.declineReasons.map((r) => ({ term: r.label, details: r.value }))}
                        />
                      </Stack>
                      <Stack gap={1}>
                        <Heading level={3} variant="label" tone="secondary">
                          Дозапрос
                        </Heading>
                        <DescriptionList
                          variant="rows"
                          items={data.requestReasons.map((r) => ({ term: r.label, details: r.value }))}
                        />
                      </Stack>
                    </Grid>
                  </Section>
                }
                side={
                  <Section
                    title="Состояние источников"
                    gap={3}
                    aside={
                      <ButtonLink variant="link" to={routes.bank.integrations()}>
                        Все
                      </ButtonLink>
                    }
                  >
                    <DescriptionList
                      variant="rows"
                      items={(sources.data ?? []).map((s) => ({
                        term: s.name,
                        termIcon: (
                          <Text as="span" tone={STATE_VIEW[s.state].tone}>
                            <Icon name={STATE_VIEW[s.state].icon} size={16} />
                          </Text>
                        ),
                        details:
                          s.state === 'down'
                            ? 'не отвечает'
                            : s.state === 'slow'
                              ? `медленно, ${s.responseTime}`
                              : s.responseTime,
                        tone: s.state === 'down' ? 'danger' : s.state === 'slow' ? 'warning' : 'default',
                        regular: s.state === 'up',
                      }))}
                    />
                  </Section>
                }
              />
            </>
          );
        }}
      </AsyncContent>
    </PageContainer>
  );
}
