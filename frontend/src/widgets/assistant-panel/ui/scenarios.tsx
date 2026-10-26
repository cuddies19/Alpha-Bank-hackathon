import { Link, useNavigate } from 'react-router';
import type { AssistantScenario } from '@/shared/config';
import { routes } from '@/shared/config';
import { annuityPayment, formatApproxMoney, formatMonths } from '@/shared/lib';
import { Alert, ChatMessage, Chip, MetricTile, PaymentLoadMeter, ProductCard, QuickReplies } from '@/shared/ui';
import styles from './AssistantPanel.module.css';

const CASH_FLOW = 610000;
const LINE = { amount: 3000000, term: 18, rate: 21.5 };
const LINE_PAYMENT = annuityPayment({ principal: LINE.amount, ratePct: LINE.rate, months: LINE.term, roundTo: 100 });

export interface ScenarioThreadProps {
  scenario: AssistantScenario;
  firstName: string;
  onReply: (text: string) => void;
}

export function ScenarioThread({ scenario, firstName, onReply }: ScenarioThreadProps) {
  const navigate = useNavigate();

  if (scenario === 'simplified') {
    return (
      <>
        <Alert tone="info" title="Ассистент сейчас отвечает по шаблонам">
          Подбор работает как обычно: выберите цель, остальное посчитаем по данным счёта.
        </Alert>
        <ChatMessage role="assistant" time="10:31">
          Выберите, на что нужны деньги, — так подбор будет точнее.
        </ChatMessage>
        <QuickReplies>
          {['Кассовый разрыв', 'Пополнить оборот', 'Оборудование', 'Тендер и контракт'].map((goal) => (
            <Chip key={goal} onClick={() => navigate(routes.client.financingGoal())}>
              {goal}
            </Chip>
          ))}
        </QuickReplies>
      </>
    );
  }

  if (scenario === 'dialog') {
    return (
      <>
        <ChatMessage role="user" time="10:31">
          Нужно закупить партию к распродаже 11.11, а выплата от маркетплейса только через две недели
        </ChatMessage>
        <ChatMessage role="assistant" time="10:31">
          <p>Понимаю: нужны деньги на закупку до поступления выручки.</p>
          <p>Сколько планируете потратить на партию?</p>
        </ChatMessage>
        <QuickReplies>
          <Chip disabled>1–2 млн ₽</Chip>
          <Chip selected>2–3 млн ₽</Chip>
          <Chip disabled>Больше 3 млн ₽</Chip>
        </QuickReplies>
        <ChatMessage role="user" time="10:32">
          3 миллиона
        </ChatMessage>
        <ChatMessage role="assistant" time="10:32">
          Когда деньги должны быть на счёте?
        </ChatMessage>
        <QuickReplies>
          <Chip selected>До 1 ноября</Chip>
          <Chip disabled>В течение ноября</Chip>
          <Chip disabled>Не срочно</Chip>
        </QuickReplies>
        <ChatMessage role="user" time="10:32">
          До 1 ноября
        </ChatMessage>
        <ChatMessage role="assistant" time="10:33">
          <p>По счёту видно: выручка приходит волнами раз в две недели, за год было 5 закупок партиями.</p>
          <p>Предлагаю кредитную линию: берёте нужную часть лимита и гасите с выплат маркетплейса.</p>
        </ChatMessage>
        <div className={styles.attachment}>
          <MetricTile
            outlined
            label="Чистый денежный поток"
            value="610 000 ₽"
            icon="wallet"
            hint="в месяц, в среднем за 6 месяцев"
          />
          <Link
            to={routes.client.offers()}
            className={styles.offerLink}
            aria-label="Открыть варианты: кредитная линия 3 000 000 ₽"
          >
            <ProductCard
              name="Кредитная линия"
              purpose="Закупки партиями, деньги нужны многократно"
              amount="3 000 000 ₽"
              params={[
                { label: 'Срок', value: formatMonths(LINE.term) },
                { label: 'Ставка', value: '21,5%' },
                { label: 'Платёж', value: formatApproxMoney(LINE_PAYMENT) },
              ]}
              reasons={[
                'Выручка приходит волнами раз в 2 недели',
                'За год 5 закупок партиями',
                'Берёте только нужную часть лимита',
              ]}
            >
              <PaymentLoadMeter payment={LINE_PAYMENT} cashFlow={CASH_FLOW} />
            </ProductCard>
          </Link>
        </div>
        <ChatMessage role="assistant" time="10:33">
          Платёж на 3 000 000 ₽ займёт 32% потока — это на грани. На экране вариантов покажу сумму с комфортной
          нагрузкой.
        </ChatMessage>
        <QuickReplies>
          <Chip onClick={() => navigate(routes.client.offers())}>Открыть варианты</Chip>
          <Chip onClick={() => onReply('Почему не кредит?')}>Почему не кредит?</Chip>
        </QuickReplies>
      </>
    );
  }

  return (
    <>
      <ChatMessage role="assistant">
        <p>
          Добрый день{firstName ? `, ${firstName}` : ''}. Помогу подобрать финансирование под задачу бизнеса и посчитаю,
          какой платёж будет комфортным.
        </p>
        <p>С чего начнём?</p>
      </ChatMessage>
      <QuickReplies>
        <Chip onClick={() => navigate(routes.client.financingDialog())}>Подобрать финансирование</Chip>
        <Chip onClick={() => onReply('Что с моей заявкой?')}>Что с моей заявкой?</Chip>
        <Chip onClick={() => onReply('Почему такая сумма?')}>Почему такая сумма?</Chip>
      </QuickReplies>
    </>
  );
}
