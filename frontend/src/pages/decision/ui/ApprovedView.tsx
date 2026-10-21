import type { Application, Decision } from '@/entities/application';
import { PRODUCT_ACCUSATIVE } from '@/entities/product';
import { routes } from '@/shared/config';
import { formatApproxMoney, formatMoney, formatMonths, formatPercent } from '@/shared/lib';
import {
  Badge,
  ButtonLink,
  Card,
  Cluster,
  DescriptionList,
  Disclosure,
  Heading,
  Note,
  PageHeader,
  PaymentLoadMeter,
  ReasonList,
  Section,
  Stack,
  Text,
} from '@/shared/ui';
import { PaymentSchedule } from '@/widgets/payment-schedule';

const FIRST_PAYMENT = new Date(2026, 10, 15);

export function ApprovedView({ app, decision }: { app: Application; decision: Decision }) {
  const auto = decision.decidedBy === 'auto';
  return (
    <>
      <PageHeader
        titleVariant="display"
        title={`Банк одобрил ${PRODUCT_ACCUSATIVE[app.productId] ?? app.productName}`}
        eyebrow={
          <Cluster gap={3}>
            <Badge tone="success">Одобрено</Badge>
            <Text as="span" variant="body-sm" tone="secondary">
              Заявка № {app.id} · решение принято {auto ? 'автоматически ' : ''}
              {decision.decidedAt}
            </Text>
          </Cluster>
        }
      />
      <Card padding="lg" gap={6}>
        <Stack gap={1}>
          <Text as="span" variant="label" tone="secondary">
            {app.productId === 'loan' ? 'Сумма' : 'Лимит'}
          </Text>
          <Text as="span" variant="amount-xl" numeric>
            {formatMoney(decision.amount)}
          </Text>
        </Stack>
        <DescriptionList
          divided
          items={[
            { term: 'Срок', details: formatMonths(decision.term), valueClassName: 'amount-md' },
            { term: 'Ставка', details: formatPercent(decision.rate), valueClassName: 'amount-md' },
            { term: 'Платёж', details: formatApproxMoney(decision.payment), valueClassName: 'amount-md tabular' },
            { term: 'Первый платёж', details: decision.firstPayment ?? '—', valueClassName: 'amount-md' },
          ]}
        />
        <PaymentLoadMeter payment={decision.payment} cashFlow={app.cashFlow} />
        <Cluster gap={3}>
          <ButtonLink variant="primary" size="lg" to={routes.client.sign(app.id)}>
            Принять условия
          </ButtonLink>
          <Note icon="calendar" center>
            Условия действуют до {decision.validUntil}
          </Note>
        </Cluster>
      </Card>
      <Section title="График платежей">
        <PaymentSchedule
          principal={decision.amount}
          ratePct={decision.rate}
          months={decision.term}
          firstDate={FIRST_PAYMENT}
        />
      </Section>
      {decision.reasons.length ? (
        <Section>
          <Disclosure summary={<Heading>Почему такое решение</Heading>}>
            <ReasonList items={decision.reasons} roomy />
          </Disclosure>
        </Section>
      ) : null}
    </>
  );
}
