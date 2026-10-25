import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAcceptOffer, useDeclineOffer, type Application, type Decision } from '@/entities/application';
import { routes } from '@/shared/config';
import { formatMoney, formatMonths, formatPercent } from '@/shared/lib';
import {
  Badge,
  Button,
  Card,
  Cluster,
  DescriptionList,
  Disclosure,
  ErrorState,
  Heading,
  Modal,
  Note,
  PageHeader,
  PaymentLoadMeter,
  ReasonList,
  Section,
  Text,
  useToast,
} from '@/shared/ui';
import { useAssistantPanel } from '@/widgets/assistant-panel';
import styles from './DecisionPage.module.css';

export function CounterView({ app, decision }: { app: Application; decision: Decision }) {
  const navigate = useNavigate();
  const toast = useToast();
  const assistant = useAssistantPanel();
  const [confirmDecline, setConfirmDecline] = useState(false);
  const accept = useAcceptOffer({ onSuccess: () => navigate(routes.client.sign(app.id)) });
  const decline = useDeclineOffer({
    onSuccess: () => {
      setConfirmDecline(false);
      toast.show({
        tone: 'info',
        title: 'Вы отказались от предложения',
        description: 'Заявка закрыта. Новую можно подать в любой момент',
      });
      navigate(routes.client.applications());
    },
  });
  const requested = decision.requested ?? { amount: app.amount, term: app.term, payment: app.payment, share: 0 };

  const onAccept = () => accept.mutate(app.id);
  const onDecline = () => decline.mutate(app.id);

  return (
    <>
      <PageHeader
        titleVariant="display"
        title={`Банк готов выдать ${formatMoney(decision.amount)}`}
        descriptionSize="body-lg"
        description={decision.summary}
        eyebrow={
          <Cluster gap={3}>
            <Badge tone="warning">Предложение банка</Badge>
            <Text as="span" variant="body-sm" tone="secondary">
              Заявка № {app.number} · решение {decision.decidedAt}
            </Text>
          </Cluster>
        }
      />
      <section className={styles.compare} aria-label="Сравнение с заявкой">
        <Card gap={4}>
          <Text as="span" variant="label" tone="secondary">
            Вы просили
          </Text>
          <Text as="span" variant="amount-xl" numeric className={styles.requestedAmount}>
            {formatMoney(requested.amount)}
          </Text>
          <DescriptionList
            variant="rows"
            items={[
              { term: 'Срок', details: formatMonths(requested.term) },
              { term: 'Платёж', details: formatMoney(requested.payment) },
              { term: 'Доля потока', details: `${requested.share}%` },
            ]}
          />
          <PaymentLoadMeter payment={requested.payment} cashFlow={app.cashFlow} />
        </Card>
        <Card gap={4} tone="highlighted">
          <Text as="span" variant="label">
            Банк предлагает
          </Text>
          <Text as="span" variant="amount-xl" numeric>
            {formatMoney(decision.amount)}
          </Text>
          <DescriptionList
            variant="rows"
            items={[
              { term: 'Срок', details: formatMonths(decision.term) },
              { term: 'Платёж', details: formatMoney(decision.payment) },
              { term: 'Доля потока', details: `${decision.share}%` },
            ]}
          />
          <PaymentLoadMeter payment={decision.payment} cashFlow={app.cashFlow} />
        </Card>
      </section>
      <Section>
        <DescriptionList
          items={[
            { term: 'Продукт', details: app.productName },
            { term: 'Ставка', details: formatPercent(decision.rate) },
            { term: 'Первый платёж', details: decision.firstPayment ?? '—' },
            { term: 'Залог', details: app.pledge ? 'Нужен' : 'Не нужен' },
          ]}
        />
        <Cluster gap={3} className={styles.actions}>
          <Button variant="primary" size="lg" loading={accept.isPending} onClick={onAccept}>
            Принять предложение
          </Button>
          <Button size="lg" onClick={() => setConfirmDecline(true)}>
            Отказаться
          </Button>
          <Button variant="link" iconLeft="sparkle" onClick={assistant.show}>
            Обсудить с ассистентом
          </Button>
        </Cluster>
        {accept.isError ? <ErrorState error={accept.error} title="Не удалось принять предложение" /> : null}
        <Note icon="calendar" center>
          Условия действуют до {decision.validUntil}
        </Note>
      </Section>
      <Section>
        <Disclosure defaultOpen summary={<Heading>Почему такое решение</Heading>}>
          <ReasonList items={decision.reasons} roomy />
        </Disclosure>
      </Section>
      <Modal
        open={confirmDecline}
        onClose={() => setConfirmDecline(false)}
        title="Отказаться от предложения?"
        actions={
          <>
            <Button onClick={() => setConfirmDecline(false)}>Вернуться</Button>
            <Button variant="primary" loading={decline.isPending} onClick={onDecline}>
              Отказаться
            </Button>
          </>
        }
      >
        <p className="body">Заявка закроется. Новую можно подать в любой момент — данные компании подставим снова.</p>
      </Modal>
    </>
  );
}
