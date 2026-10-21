import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import {
  ApplicationStatusBadge,
  buildClientStages,
  isActive,
  isProcessing,
  useApplication,
  useWithdrawApplication,
  type Application,
} from '@/entities/application';
import { routes } from '@/shared/config';
import { formatApproxMoney, formatMoney, formatMonths, formatMonthsLong, formatPercent } from '@/shared/lib';
import {
  Alert,
  Amount,
  AsyncContent,
  Badge,
  Button,
  ButtonLink,
  Card,
  Columns,
  DescriptionList,
  Dot,
  Feed,
  Heading,
  Modal,
  PageContainer,
  PageHeader,
  Section,
  Stack,
  StatusTracker,
  Text,
  useToast,
} from '@/shared/ui';
import styles from './ApplicationStatusPage.module.css';

export function ApplicationStatusPage() {
  const { id = '' } = useParams();
  const application = useApplication(id);
  return (
    <PageContainer spacing="tight">
      <AsyncContent query={application}>
        {(app) =>
          app.status === 'draft' ? (
            <Navigate to={routes.client.applicationForm(app.id)} replace />
          ) : (
            <Status key={app.id} app={app} />
          )
        }
      </AsyncContent>
    </PageContainer>
  );
}

const DECIDED: Application['status'][] = ['counter_offer', 'approved', 'rejected', 'needs_info'];

function useStatusToasts(app: Application) {
  const toast = useToast();
  const previous = useRef(app.status);
  useEffect(() => {
    const before = previous.current;
    previous.current = app.status;
    if (before === app.status) return;
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (app.status === 'manual_review') {
      toast.show({
        tone: 'info',
        title: 'Заявка перешла к специалисту',
        description: `${time} · статус обновился сам, перезагружать не нужно`,
      });
    } else if (DECIDED.includes(app.status) && !app.closedReason) {
      toast.show({
        title: 'Решение готово',
        description: `Заявка № ${app.id} · ${time}`,
        action: { label: 'Посмотреть решение', to: routes.client.decision(app.id) },
      });
    }
  }, [app.status, app.id, app.closedReason, toast]);
}

function Status({ app }: { app: Application }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const withdraw = useWithdrawApplication({
    onSuccess: () => {
      setConfirm(false);
      toast.show({ tone: 'info', title: 'Заявка отозвана', description: `№ ${app.id}` });
      navigate(routes.client.applications());
    },
  });
  useStatusToasts(app);

  const live = isProcessing(app.status) || app.status === 'manual_review';
  const canWithdraw = isActive(app) && (live || app.status === 'needs_info');

  const doWithdraw = () => withdraw.mutate(app.id);

  return (
    <>
      <PageHeader
        back={{ to: routes.client.applications(), children: 'Мои заявки' }}
        title={
          <>
            {app.productName} на <Amount>{formatMoney(app.amount)}</Amount>
          </>
        }
        badge={<ApplicationStatusBadge application={app} />}
        description={`№ ${app.id} · подана ${app.submittedAt ?? app.createdAt}`}
      />
      <StatusBanner app={app} />
      <Columns
        main={
          <>
            <Section
              title="Где заявка"
              gap={5}
              aside={
                live ? (
                  <Text as="span" variant="body-sm" className={styles.live}>
                    <Dot tone="success" />
                    Обновляется сама
                  </Text>
                ) : undefined
              }
            >
              <StatusTracker stages={buildClientStages(app)} />
            </Section>
            <Section title="История событий" gap={2}>
              <Feed items={app.events.map((e) => ({ id: e.id, text: e.text, time: e.time, icon: e.icon }))} />
            </Section>
          </>
        }
        side={
          <>
            <Section title="Параметры заявки" gap={3}>
              <DescriptionList
                variant="rows"
                items={[
                  { term: 'Сумма', details: formatMoney(app.amount) },
                  { term: 'Срок', details: formatMonths(app.term) },
                  { term: 'Ставка', details: `от ${formatPercent(app.rate)}` },
                  { term: 'Платёж', details: formatApproxMoney(app.payment) },
                  { term: 'Цель', details: app.goal },
                ]}
              />
            </Section>
            <DocumentsCard app={app} />
            {canWithdraw ? (
              <Section title="Передумали?" subtitle="Банк перестанет рассматривать заявку" gap={4}>
                <Button fullWidth onClick={() => setConfirm(true)}>
                  Отозвать заявку
                </Button>
              </Section>
            ) : null}
          </>
        }
      />
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Отозвать заявку?"
        actions={
          <>
            <Button onClick={() => setConfirm(false)}>Оставить</Button>
            <Button variant="primary" loading={withdraw.isPending} onClick={doWithdraw}>
              Отозвать
            </Button>
          </>
        }
      >
        <p className="body">
          Банк перестанет её рассматривать. Чтобы получить деньги, понадобится новая заявка — данные компании подставим
          снова.
        </p>
      </Modal>
    </>
  );
}

function StatusBanner({ app }: { app: Application }) {
  const d = app.decision;
  if (app.closedReason) {
    return (
      <Alert tone="info" title="Заявка закрыта">
        {app.closedReason === 'withdrawn' ? 'Вы отозвали заявку.' : 'Вы отказались от предложения банка.'} Новую можно
        подать в любой момент — данные компании подставим снова.
      </Alert>
    );
  }
  if (app.status === 'needs_info') {
    return (
      <Alert
        tone="warning"
        title="Банку нужны ещё документы"
        action={
          <ButtonLink variant="primary" size="sm" iconLeft="upload" to={routes.client.decision(app.id)}>
            Загрузить
          </ButtonLink>
        }
      >
        <p>
          {d?.requestedDocs?.map((r) => r.title).join(' и ')}. Ответьте до {d?.deadline ?? '30 октября'}.
        </p>
      </Alert>
    );
  }
  if (app.sourceIssue && app.status === 'manual_review') {
    return (
      <Alert tone="info" title="Кредитная история пришла не сразу">
        Бюро кредитных историй не ответило — заявку проверит специалист, это добавит до часа. Делать ничего не нужно.
      </Alert>
    );
  }
  if (app.status === 'issued') {
    return (
      <Alert
        tone="success"
        title="Деньги зачислены"
        action={
          <ButtonLink size="sm" to={routes.client.loans()}>
            Открыть мои кредиты
          </ButtonLink>
        }
      >
        <p>Договор подписан, деньги на счёте. График платежей — в разделе «Мои кредиты».</p>
      </Alert>
    );
  }
  if (!d || !['counter_offer', 'approved', 'rejected'].includes(app.status)) return null;

  const headline =
    app.status === 'rejected'
      ? 'Банк не смог одобрить заявку'
      : app.status === 'approved' && d.outcome === 'counter'
        ? `Вы приняли предложение: ${formatMoney(d.amount)}`
        : `Банк готов выдать ${formatMoney(d.amount)} на ${formatMonthsLong(d.term)}`;
  const text =
    app.status === 'rejected'
      ? 'Посмотрите причину и что можно сделать — есть вариант, который банк может рассмотреть.'
      : app.status === 'approved' && d.outcome === 'counter'
        ? 'Осталось подписать документы — деньги придут на счёт сразу.'
        : `С этой суммой платёж займёт ${d.share ?? ''}% денежного потока — комфортная нагрузка. Условия действуют до ${d.validUntil}.`;
  const accepted = app.status === 'approved' && d.outcome === 'counter';

  return (
    <Card padding="lg" gap={4} className={styles.ready}>
      <Stack gap={1}>
        <Text as="span" variant="label" tone="secondary">
          Решение готово · {d.decidedAt}
        </Text>
        <Heading variant="title-2">{headline}</Heading>
      </Stack>
      <p className={`body ${styles.readyText}`}>{text}</p>
      <Stack gap={0} selfStart>
        <ButtonLink
          variant="primary"
          size="lg"
          to={accepted ? routes.client.sign(app.id) : routes.client.decision(app.id)}
        >
          {accepted ? 'Подписать документы' : 'Посмотреть решение'}
        </ButtonLink>
      </Stack>
    </Card>
  );
}

function DocumentsCard({ app }: { app: Application }) {
  const docs = app.documents.filter((d) => d.status !== 'missing');
  const consentsSigned = Object.values(app.consents).every(Boolean);
  if (!docs.length && !consentsSigned) return null;
  const word = { ok: 'Принят', checking: 'Проверяем', uploading: 'Загружается', error: 'Нужно заменить' } as const;
  const tone = { ok: 'success', checking: 'info', uploading: 'neutral', error: 'danger' } as const;
  return (
    <Section title="Документы" gap={3}>
      <Stack as="ul" gap={3}>
        {docs.map((d) => (
          <li key={d.id} className={styles.docRow}>
            <span className="body">{d.title}</span>
            {d.status !== 'missing' ? <Badge tone={tone[d.status]}>{word[d.status]}</Badge> : null}
          </li>
        ))}
        {consentsSigned ? (
          <li className={styles.docRow}>
            <span className="body">Согласия</span>
            <Badge tone="success">Подписано</Badge>
          </li>
        ) : null}
      </Stack>
    </Section>
  );
}
