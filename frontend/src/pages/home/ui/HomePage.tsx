import { useAccountSummary, type AccountSummary } from '@/entities/account';
import {
  ApplicationStatusBadge,
  buildClientStages,
  isActive,
  useCompanyApplications,
  type Application,
} from '@/entities/application';
import { useCompanyId } from '@/entities/session';
import { routes } from '@/shared/config';
import { formatMoney } from '@/shared/lib';
import {
  Alert,
  Amount,
  AsyncContent,
  BarChart,
  Button,
  ButtonLink,
  Cluster,
  Columns,
  Feed,
  Grid,
  Legend,
  MetricTile,
  PageContainer,
  PageHeader,
  Section,
  StatusTracker,
  Text,
} from '@/shared/ui';
import { useAssistantPanel } from '@/widgets/assistant-panel';

const SERIES = [
  { label: 'Поступления', color: 'var(--ink)' },
  { label: 'Списания', color: 'var(--line-strong)' },
];

export function HomePage() {
  const companyId = useCompanyId();
  const summary = useAccountSummary(companyId);
  const applications = useCompanyApplications(companyId);
  const active = applications.data?.find(isActive);

  return (
    <PageContainer>
      <AsyncContent query={summary}>
        {(data) => (
          <>
            <PageHeader
              titleVariant="display"
              title={`Добрый день${data.greetingName ? `, ${data.greetingName}` : ''}`}
              description={`Данные по счёту на ${data.updatedAt}`}
            />
            {data.insight ? <InsightAlert insight={data.insight} /> : null}
            <Metrics data={data} />
            <Columns
              main={<TurnoverSection data={data} />}
              side={
                <>
                  <ActiveApplication application={active} />
                  <Section
                    title="Ближайшие события"
                    gap={2}
                    aside={
                      <ButtonLink variant="link" to={routes.client.notifications()}>
                        Все
                      </ButtonLink>
                    }
                  >
                    <Feed
                      items={data.events.map((e) => ({
                        id: e.id,
                        text: e.text,
                        time: e.time,
                        icon: e.icon,
                        accent: e.fromAssistant,
                      }))}
                    />
                  </Section>
                </>
              }
            />
          </>
        )}
      </AsyncContent>
    </PageContainer>
  );
}

function InsightAlert({ insight }: { insight: NonNullable<AccountSummary['insight']> }) {
  const assistant = useAssistantPanel();
  return (
    <Alert
      tone="assistant"
      title={insight.title}
      action={
        <>
          <ButtonLink variant="primary" to={routes.client.financing()}>
            Подобрать финансирование
          </ButtonLink>
          <Button variant="ghost" onClick={assistant.show}>
            Спросить ассистента
          </Button>
        </>
      }
    >
      <p>{insight.text}</p>
    </Alert>
  );
}

function Metrics({ data }: { data: AccountSummary }) {
  return (
    <Grid min={220}>
      <MetricTile
        label="Остаток на счёте"
        value={formatMoney(data.balance)}
        icon="wallet"
        hint={`Счёт •• ${data.accountMask}`}
      />
      <MetricTile
        label="Поступления за 30 дней"
        value={formatMoney(data.incomes30d)}
        icon="arrow-down"
        delta={{ value: data.incomeDelta.value, direction: 'up', tone: 'success', label: data.incomeDelta.label }}
      />
      <MetricTile
        label="Чистый денежный поток"
        value={formatMoney(data.netCashFlow)}
        icon="trend-up"
        hint="в месяц, в среднем за 6 месяцев"
      />
      <MetricTile
        label="Платежи по кредитам"
        value={formatMoney(data.loanPayments)}
        icon="calendar"
        hint={data.loanPaymentsHint}
      />
    </Grid>
  );
}

function TurnoverSection({ data }: { data: AccountSummary }) {
  const max = Math.ceil(Math.max(...data.months.map((m) => m.income)));
  const yLabels = Array.from({ length: max + 1 }, (_, i) => (max - i === 0 ? '0' : `${max - i} млн`));
  const first = data.months[0];
  const last = data.months[data.months.length - 1];
  return (
    <Section
      title="Поступления и списания"
      subtitle={`${data.period}, по счёту •• ${data.accountMask}`}
      aside={<Legend items={SERIES} />}
      gap={5}
    >
      <BarChart
        series={SERIES}
        groups={data.months.map((m) => ({ label: m.label, values: [m.income, m.outcome] }))}
        max={max}
        yLabels={yLabels}
        ariaLabel={`Столбики по месяцам: поступления от ${first.income} млн ₽ в ${first.label} до ${last.income} млн ₽ в ${last.label}`}
      />
      <Text variant="body-sm" tone="secondary">
        {data.chartSummary}
      </Text>
    </Section>
  );
}

function ActiveApplication({ application }: { application?: Application }) {
  if (!application) {
    return (
      <Section title="Активная заявка" gap={3}>
        <Text tone="secondary">
          Активных заявок нет. Опишите задачу — подберём продукт и посчитаем платёж до подачи заявки.
        </Text>
        <Cluster>
          <ButtonLink to={routes.client.financing()}>Подобрать под задачу</ButtonLink>
        </Cluster>
      </Section>
    );
  }
  const stages = buildClientStages(application);
  const current = Math.max(
    0,
    stages.findIndex((s) => s.status !== 'done'),
  );
  return (
    <Section title="Активная заявка" aside={<ApplicationStatusBadge application={application} />}>
      <Text tone="secondary">
        {application.productName} · <Amount>{formatMoney(application.amount)}</Amount> · № {application.id}
      </Text>
      <StatusTracker stages={stages.slice(Math.max(0, current - 1), current + 2)} />
      <Cluster>
        <ButtonLink to={routes.client.application(application.id)}>Открыть заявку</ButtonLink>
      </Cluster>
    </Section>
  );
}
