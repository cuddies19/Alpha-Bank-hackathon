import type { Application, Decision } from '@/entities/application';
import { routes } from '@/shared/config';
import { formatMoney } from '@/shared/lib';
import {
  ButtonLink,
  Callout,
  Cluster,
  Disclosure,
  Heading,
  PageHeader,
  ProductCard,
  ReasonList,
  Section,
  StepList,
  Text,
} from '@/shared/ui';

export function DeclineView({ app, decision }: { app: Application; decision: Decision }) {
  return (
    <>
      <PageHeader
        titleVariant="display"
        title="Сейчас банк не может выдать кредит"
        eyebrow={
          <Cluster gap={3}>
            <Text as="span" variant="body-sm" tone="secondary">
              Заявка № {app.number} · {app.productName.toLowerCase()} {formatMoney(app.amount)}
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
      {decision.improvePlan || decision.reapplyAfter ? (
        <Section title={decision.improvePlan ? 'Что улучшить за 3 месяца' : 'Когда подать снова'} headingLevel={3}>
          {decision.improvePlan ? <StepList items={decision.improvePlan} /> : null}
          {decision.reapplyAfter ? (
            <Callout icon="calendar">
              Подать заявку снова можно после <b>{decision.reapplyAfter}</b>.
            </Callout>
          ) : null}
        </Section>
      ) : null}
    </>
  );
}
