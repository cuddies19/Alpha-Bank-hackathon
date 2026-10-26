import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  OUTCOME_LABEL,
  OUTCOME_RESULT,
  useDecide,
  type ApplicationCase,
  type Decision,
  type DecisionOutcome,
} from '@/entities/application';
import { sessionApi, useSession } from '@/entities/session';
import { features, routes } from '@/shared/config';
import { annuityPayment, formatMoney, formatMonths, parseMoney } from '@/shared/lib';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  DescriptionList,
  ErrorState,
  Icon,
  Modal,
  PaymentLoadMeter,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextField,
  Textarea,
} from '@/shared/ui';
import styles from './DecisionPanel.module.css';

const OUTCOMES: DecisionOutcome[] = ['approve', 'counter', 'request', 'decline'];

const REQUEST_DOCS = [
  { id: 'bs', label: 'Бухгалтерская отчётность за 2025 год' },
  { id: 'stmt', label: 'Выписка из другого банка за 6 месяцев' },
  { id: 'supply', label: 'Договор поставки' },
  { id: 'other', label: 'Другое' },
];

const DECLINE_REASONS = [
  'Просрочка больше 60 дней за 12 месяцев',
  'Налоговая задолженность',
  'Возраст бизнеса меньше 12 месяцев',
  'Класс риска ниже C',
  'Другое',
];

const REQUEST_MESSAGE =
  'Пришлите бухгалтерскую отчётность за 2025 год и выписку из другого банка за 6 месяцев — так банк увидит всю выручку компании.';
const DECLINE_MESSAGE =
  'Сейчас банк не может выдать кредит: в кредитной истории есть просрочка больше 60 дней за последний год. Подать заявку снова можно через 3 месяца.';

function decisionTerms(decision: Decision) {
  if (decision.outcome === 'request')
    return `${decision.requestedDocs?.length ?? 0} док. до ${decision.deadline ?? '30 октября'}`;
  if (decision.outcome === 'decline') return decision.declineReason ?? 'Отказ';
  return `${formatMoney(decision.amount)} на ${formatMonths(decision.term)}`;
}

export interface DecisionPanelProps {
  caseData: ApplicationCase;
}

export function DecisionPanel({ caseData }: DecisionPanelProps) {
  const app = caseData.application;
  return (
    <section className={styles.panel} aria-label="Решение по заявке">
      <Stack gap={1}>
        <h2 className="title-3">Решение по заявке</h2>
        <Text variant="body-sm" tone="secondary">
          № {app.number} · {app.companyName}
        </Text>
      </Stack>
      {app.status === 'manual_review' ? (
        <DecisionForm caseData={caseData} />
      ) : app.decision ? (
        <DecidedView caseData={caseData} decision={app.decision} />
      ) : (
        <Alert tone="info" title="Заявка ещё в конвейере">
          Решение можно принять, когда заявка перейдёт на ручное рассмотрение.
        </Alert>
      )}
    </section>
  );
}

function DecisionForm({ caseData }: DecisionPanelProps) {
  const app = caseData.application;
  const rec = caseData.recommendation;
  const [confirming, setConfirming] = useState(false);
  const decide = useDecide({ onSuccess: () => setConfirming(false) });
  const [outcome, setOutcome] = useState<DecisionOutcome>(rec.outcome);
  const [amount, setAmount] = useState(rec.outcome === 'counter' ? rec.amount : app.amount);
  const [term, setTerm] = useState(app.term);
  const [rate, setRate] = useState(app.rate);
  const [docs, setDocs] = useState<string[]>(['bs', 'stmt']);
  const [requestMessage, setRequestMessage] = useState(REQUEST_MESSAGE);
  const [declineReason, setDeclineReason] = useState(DECLINE_REASONS[0]);
  const [declineMessage, setDeclineMessage] = useState(DECLINE_MESSAGE);
  const [comment, setComment] = useState('');

  const payment = annuityPayment({ principal: amount, ratePct: rate, months: term, roundTo: 100 });
  const shareFails = caseData.rules.some((r) => r.rule.startsWith('Доля платежа') && !r.passed);
  const terms =
    outcome === 'request'
      ? `${docs.length} док. до 30 октября`
      : outcome === 'decline'
        ? declineReason
        : outcome === 'approve'
          ? `${formatMoney(app.amount)} на ${formatMonths(app.term)}`
          : `${formatMoney(amount)} на ${formatMonths(term)}`;
  const invalid = (outcome === 'counter' && (amount <= 0 || term <= 0)) || (outcome === 'request' && docs.length === 0);

  const submit = () =>
    decide.mutate({
      applicationId: app.id,
      outcome,
      amount,
      term,
      rate,
      requestedDocs: docs,
      message: outcome === 'request' ? requestMessage : declineMessage,
      declineReason,
      comment,
    });

  return (
    <>
      <Stack gap={2}>
        <span className="label" id="dp-outcome">
          Исход
        </span>
        <SegmentedControl
          labelledBy="dp-outcome"
          layout="grid"
          value={outcome}
          onChange={setOutcome}
          options={OUTCOMES.map((value) => ({
            value,
            label: OUTCOME_LABEL[value],
            tag: value === rec.outcome ? 'Рекомендация системы' : undefined,
          }))}
        />
      </Stack>

      {outcome === 'approve' ? (
        <>
          {shareFails ? (
            <Alert tone="warning" title="Не проходит правило доли платежа">
              Платёж займёт {Math.round((app.payment / caseData.cashFlow) * 100)}% потока при пороге 30%. Система
              рекомендует встречное предложение.
            </Alert>
          ) : null}
          <Stack gap={1}>
            <Text variant="label" tone="secondary">
              Условия из заявки, только для чтения
            </Text>
            <DescriptionList
              variant="rows"
              items={[
                { term: 'Сумма', details: formatMoney(app.amount) },
                { term: 'Срок', details: formatMonths(app.term) },
                { term: 'Ставка', details: `${String(app.rate).replace('.', ',')}%` },
                { term: 'Платёж', details: formatMoney(app.payment) },
              ]}
            />
          </Stack>
          {caseData.cashFlow > 0 ? (
            <PaymentLoadMeter title="Доля платежа в потоке" payment={app.payment} cashFlow={caseData.cashFlow} />
          ) : null}
        </>
      ) : null}

      {outcome === 'counter' ? (
        <>
          <Text variant="body-sm" tone="secondary">
            {caseData.cashFlow > 0
              ? `Подобрана сумма, при которой платёж ${rec.share}% потока. Поля можно изменить — платёж пересчитается.`
              : 'Укажите условия предложения — платёж пересчитается.'}
          </Text>
          <TextField
            label="Сумма"
            format="money"
            value={formatMoney(amount, { currency: false })}
            onChange={(e) => setAmount(parseMoney(e.target.value))}
          />
          <div className={styles.terms}>
            <TextField
              label="Срок"
              suffix="мес."
              inputMode="numeric"
              value={String(term)}
              onChange={(e) => setTerm(Number(e.target.value.replace(/\D/g, '')) || 0)}
            />
            <TextField
              label="Ставка"
              suffix="%"
              inputMode="decimal"
              value={String(rate).replace('.', ',')}
              onChange={(e) => setRate(Number(e.target.value.replace(',', '.').replace(/[^\d.]/g, '')) || 0)}
            />
          </div>
          <DescriptionList variant="rows" items={[{ term: 'Платёж в месяц', details: formatMoney(payment) }]} />
          {caseData.cashFlow > 0 ? (
            <PaymentLoadMeter title="Доля платежа в потоке" payment={payment} cashFlow={caseData.cashFlow} />
          ) : null}
        </>
      ) : null}

      {outcome === 'request' ? (
        <>
          <Stack gap={2}>
            <span className="label">Что запросить у клиента</span>
            {REQUEST_DOCS.map((doc) => (
              <Checkbox
                key={doc.id}
                compact
                checked={docs.includes(doc.id)}
                onChange={(on) => setDocs((list) => (on ? [...list, doc.id] : list.filter((x) => x !== doc.id)))}
              >
                {doc.label}
              </Checkbox>
            ))}
          </Stack>
          <Textarea
            label="Сообщение клиенту"
            rows={4}
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />
        </>
      ) : null}

      {outcome === 'decline' ? (
        <>
          <Select
            label="Причина из справочника"
            value={declineReason}
            onChange={setDeclineReason}
            options={DECLINE_REASONS.map((r) => ({ value: r, label: r }))}
          />
          <Textarea
            label="Объяснение для клиента"
            rows={5}
            value={declineMessage}
            onChange={(e) => setDeclineMessage(e.target.value)}
            hint="Шаблон простыми словами — можно поправить"
          />
        </>
      ) : null}

      <Textarea
        label="Внутренний комментарий"
        rows={3}
        placeholder="Например: сезонность учтена, платёж проверен по выписке"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button variant="primary" fullWidth disabled={invalid} onClick={() => setConfirming(true)}>
        Принять решение
      </Button>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Принять решение?"
        actions={
          <>
            <Button onClick={() => setConfirming(false)}>Отмена</Button>
            <Button variant="primary" loading={decide.isPending} onClick={submit}>
              Принять решение
            </Button>
          </>
        }
      >
        <p className="body">Клиент увидит решение сразу. Отменить нельзя.</p>
        <DescriptionList
          variant="rows"
          items={[
            { term: 'Исход', details: OUTCOME_RESULT[outcome] },
            { term: 'Условия', details: terms },
          ]}
        />
        {decide.isError ? <ErrorState error={decide.error} title="Решение не сохранилось" /> : null}
      </Modal>
    </>
  );
}

function DecidedView({ caseData, decision }: { caseData: ApplicationCase; decision: Decision }) {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const app = caseData.application;

  const openAsClient = async () => {
    const known = (await sessionApi.personas()).find((p) => p.companyId === app.companyId || p.org === app.companyName);
    if (!known) return;
    signIn(await sessionApi.switchTo(known));
    navigate(routes.client.application(app.id));
  };

  return (
    <Stack gap={3}>
      <Stack gap={0} selfStart>
        <Badge tone="success">Решение принято</Badge>
      </Stack>
      <p className="body">
        {decision.decidedAt} · {decision.decidedBy === 'auto' ? 'автоматически' : decision.decidedBy}
      </p>
      <DescriptionList
        variant="rows"
        items={[
          { term: 'Исход', details: OUTCOME_RESULT[decision.outcome] },
          { term: 'Условия', details: decisionTerms(decision) },
        ]}
      />
      <Alert tone="info" title="Клиент уже видит решение">
        Уведомление пришло в кабинет клиента. Панель доступна только для чтения.
      </Alert>
      {features.demo ? (
        <button type="button" className={styles.clientLink} onClick={() => void openAsClient()}>
          <Icon name="shield" size={16} /> Режим проверки: войти как клиент
        </button>
      ) : null}
    </Stack>
  );
}
