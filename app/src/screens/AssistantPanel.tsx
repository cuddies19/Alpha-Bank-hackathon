// B16 · Панель ассистента — перенесено из макета «Кредитный кабинет — макет» (AssistantPanel.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Button, ChatComposer, ChatMessage, Chip, Icon, MetricTile, PaymentLoadMeter, ProductCard } from '../ui';
import type { ScreenValues } from '../lib/screen';

export interface AssistantPanelProps {
  mode?: 'start' | 'dialog' | 'typing' | 'simplified' | 'error';
  screen?: string;
}

function useScreen(props: AssistantPanelProps): ScreenValues {
  const m = props.mode ?? 'dialog';
  const n = ' ';
  return {
    screen: props.screen ?? 'Подбор финансирования',
    isStart: m === 'start',
    isDialog: m === 'dialog',
    isTyping: m === 'typing',
    isSimple: m === 'simplified',
    isError: m === 'error',
    showTalk: m === 'dialog' || m === 'typing',
    pay3: 196500,
    flow: 610000,
    pcParams: [
      { label: 'Срок', value: '18' + n + 'мес.' },
      { label: 'Ставка', value: '21,5%' },
      { label: 'Платёж', value: '≈' + n + '196' + n + '500' + n + '₽' },
    ],
    pcReasons: [
      'Выручка приходит волнами раз в 2 недели',
      'За год 5 закупок партиями',
      'Берёте только нужную часть лимита',
    ],
    noop: () => {},
  };
}

export default function AssistantPanel(props: AssistantPanelProps) {
  const v = useScreen(props);
  return (
    <aside
      aria-label="Ассистент"
      style={{
        boxSizing: 'border-box',
        height: '100vh',
        minHeight: '560px',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 16px 16px 20px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span className="kn-mark" style={{ width: '36px', height: '36px' }}>
          <Icon name="sparkle" size={18} />
        </span>
        <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
          <span className="title-3">Ассистент</span>{' '}
          <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Видит экран «{v.screen}»
          </span>
        </div>
        <button type="button" className="kn-ibtn" aria-label="Свернуть панель ассистента">
          <Icon name="x" size={20} />
        </button>
      </div>
      <div
        style={{
          flex: '1',
          minHeight: '0',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
          padding: '20px',
        }}
      >
        <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {v.isStart ? (
            <>
              <ChatMessage role="assistant" time="10:30">
                <p>
                  Добрый день, Игорь. Помогу подобрать финансирование под задачу бизнеса и посчитаю, какой платёж будет
                  комфортным.
                </p>
                <p>С чего начнём?</p>
              </ChatMessage>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '40px' }}>
                <Link className="kk-chip" to="/b2-dialog">
                  Подобрать финансирование
                </Link>{' '}
                <Link className="kk-chip" to="/b8-status">
                  Что с моей заявкой?
                </Link>{' '}
                <Link className="kk-chip" to="/b3-offers">
                  Почему такая сумма?
                </Link>
              </div>
            </>
          ) : null}
          {v.showTalk ? (
            <>
              <ChatMessage role="user" time="10:31">
                Нужно закупить партию к распродаже 11.11, а выплата от маркетплейса только через две недели
              </ChatMessage>{' '}
              <ChatMessage role="assistant" time="10:31">
                <p>Понимаю: нужны деньги на закупку до поступления выручки.</p>
                <p>Сколько планируете потратить на партию?</p>
              </ChatMessage>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '40px' }}>
                <Chip>1–2 млн ₽</Chip> <Chip selected={true}>2–3 млн ₽</Chip> <Chip>Больше 3 млн ₽</Chip>
              </div>
              <ChatMessage role="user">2–3 млн ₽</ChatMessage>{' '}
              <ChatMessage role="user" time="10:32">
                3 миллиона
              </ChatMessage>{' '}
              <ChatMessage role="assistant" time="10:32">
                Когда деньги должны быть на счёте?
              </ChatMessage>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '40px' }}>
                <Chip selected={true}>До 1 ноября</Chip> <Chip>В течение ноября</Chip> <Chip>Не срочно</Chip>
              </div>
              <ChatMessage role="user" time="10:32">
                До 1 ноября
              </ChatMessage>{' '}
              <ChatMessage role="assistant" time="10:33">
                Посмотрю обороты по счёту.
              </ChatMessage>
            </>
          ) : null}
          {v.isTyping ? (
            <>
              <ChatMessage role="assistant" typing={true} />
            </>
          ) : null}
          {v.isDialog ? (
            <>
              <ChatMessage role="assistant" time="10:33">
                <p>По счёту видно: выручка приходит волнами раз в две недели, за год было 5 закупок партиями.</p>
                <p>Предлагаю кредитную линию: берёте нужную часть лимита и гасите с выплат маркетплейса.</p>
              </ChatMessage>
              <div style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
                  <MetricTile
                    label="Чистый денежный поток"
                    value="610 000 ₽"
                    icon="wallet"
                    hint="в месяц, в среднем за 6 месяцев"
                  />
                </div>
                <Link
                  to="/b3-offers"
                  aria-label="Открыть варианты: кредитная линия 3 000 000 ₽"
                  style={{ display: 'block', color: 'inherit', textDecoration: 'none', borderRadius: '16px' }}
                >
                  <ProductCard
                    name="Кредитная линия"
                    purpose="Закупки партиями, деньги нужны многократно"
                    amountLabel="Лимит"
                    amount="3 000 000 ₽"
                    params={v.pcParams}
                    reasons={v.pcReasons}
                  >
                    <PaymentLoadMeter payment={v.pay3} cashFlow={v.flow} />
                  </ProductCard>
                </Link>
              </div>
              <ChatMessage role="assistant" time="10:33">
                Платёж на 3 000 000 ₽ займёт 32% потока — это на грани. На экране вариантов покажу сумму с комфортной
                нагрузкой.
              </ChatMessage>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '40px' }}>
                <Link className="kk-chip" to="/b3-offers">
                  Открыть варианты
                </Link>{' '}
                <Link className="kk-chip" to="/b3-offers">
                  Почему не кредит?
                </Link>
              </div>
            </>
          ) : null}
          {v.isSimple ? (
            <>
              <Alert tone="info" title="Ассистент сейчас отвечает по шаблонам">
                Подбор работает как обычно: выберите цель, остальное посчитаем по данным счёта.
              </Alert>{' '}
              <ChatMessage role="user" time="10:31">
                Нужно закупить партию к распродаже, а выплата от маркетплейса через две недели
              </ChatMessage>{' '}
              <ChatMessage role="assistant" time="10:31">
                Выберите, на что нужны деньги, — так подбор будет точнее.
              </ChatMessage>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '40px' }}>
                <Link className="kk-chip" to="/b2-goal">
                  Кассовый разрыв
                </Link>{' '}
                <Link className="kk-chip is-selected" to="/b2-goal">
                  Пополнить оборот
                </Link>{' '}
                <Link className="kk-chip" to="/b2-goal">
                  Оборудование
                </Link>{' '}
                <Link className="kk-chip" to="/b2-goal">
                  Тендер и контракт
                </Link>
              </div>
            </>
          ) : null}
          {v.isError ? (
            <>
              <ChatMessage role="assistant" time="10:30">
                Добрый день, Игорь. Расскажите, на что нужны деньги.
              </ChatMessage>{' '}
              <ChatMessage role="user" time="10:31">
                Нужно закупить партию к распродаже 11.11
              </ChatMessage>{' '}
              <Alert tone="danger" title="Сообщение не отправлено">
                <p>Нет связи с сервером. Проверьте интернет и повторите — текст сохранён.</p>
                <div style={{ marginTop: '8px' }}>
                  <Button variant="secondary" size="sm">
                    Повторить
                  </Button>
                </div>
              </Alert>
            </>
          ) : null}
        </div>
      </div>
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--line)' }}>
        <ChatComposer
          placeholder="Опишите задачу своими словами"
          hint="Ассистент помогает с выбором. Решение по заявке принимает банк."
          onSend={v.noop}
          onAttach={v.noop}
        />
      </div>
    </aside>
  );
}
