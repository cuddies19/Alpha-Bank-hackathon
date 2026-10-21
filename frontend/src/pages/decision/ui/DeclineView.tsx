import type { Application, Decision } from '@/entities/application';
import { routes } from '@/shared/config';
import { formatMoney } from '@/shared/lib';
import {
  AssistantMark,
  Badge,
  Button,
  ButtonLink,
  Callout,
  Cluster,
  Disclosure,
  Heading,
  PageHeader,
  ProductCard,
  ReasonList,
  Section,
  Stack,
  StepList,
  Text,
} from '@/shared/ui';
import { useAssistantPanel } from '@/widgets/assistant-panel';

export function DeclineView({ app, decision }: { app: Application; decision: Decision }) {
  const assistant = useAssistantPanel();
  return (
    <>
      <PageHeader
        titleVariant="display"
        title="Сейчас банк не может выдать кредит"
        eyebrow={
          <Cluster gap={3}>
            <Badge tone="danger">Отказ</Badge>
            <Text as="span" variant="body-sm" tone="secondary">
              Заявка № {app.id} · {app.productName.toLowerCase()} {formatMoney(app.amount)}
            </Text>
          </Cluster>
        }
      />
      <Section gap={3}>
        <Text as="span" variant="label" tone="secondary">
          Причина
        </Text>
        <Text variant="body-lg">{decision.declineReason}</Text>
        {decision.declineDetails ? (
          <Text variant="body-sm" tone="secondary">
            {decision.declineDetails}
          </Text>
        ) : null}
        {decision.reasons.length ? (
          <Disclosure divided summary={<span className="body-strong">Почему такое решение</span>}>
            <ReasonList items={decision.reasons} roomy />
          </Disclosure>
        ) : null}
      </Section>
      {decision.alternative || decision.improvePlan ? <Heading variant="title-2">Что можно сделать</Heading> : null}
      {decision.alternative ? (
        <ProductCard
          name={decision.alternative.name}
          purpose={decision.alternative.purpose}
          amountLabel={decision.alternative.amountLabel}
          amount={formatMoney(decision.alternative.amount)}
          params={decision.alternative.params}
          note={decision.alternative.note}
          actions={
            <ButtonLink variant="primary" to={routes.client.catalog()}>
              Посмотреть альтернативу
            </ButtonLink>
          }
        />
      ) : null}
      <Section title={decision.improvePlan ? 'Что улучшить за 3 месяца' : 'Что дальше'} headingLevel={3}>
        {decision.improvePlan ? <StepList items={decision.improvePlan} /> : null}
        {decision.reapplyAfter ? (
          <Callout icon="calendar">
            Подать заявку снова можно после <b>{decision.reapplyAfter}</b>.
          </Callout>
        ) : null}
        <Stack gap={0} selfStart>
          <Button onClick={assistant.show}>
            <AssistantMark size="sm" />
            Поговорить с ассистентом
          </Button>
        </Stack>
      </Section>
    </>
  );
}
