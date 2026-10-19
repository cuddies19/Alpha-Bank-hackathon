// B16 · Ассистент · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Assistant.dc.html)
import { Link } from 'react-router-dom';
import { ChatComposer, ChatMessage, Chip, Icon, PaymentLoadMeter, ProductCard } from '../ui';
import type { ScreenValues } from '../lib/screen';

function useScreen(): ScreenValues {
  const n = ' ';
  return {
    pay: 196500,
    flow: 610000,
    noop: () => {},
    params: [
      { label: 'Срок', value: '18' + n + 'мес.' },
      { label: 'Ставка', value: '21,5%' },
      { label: 'Платёж', value: '≈' + n + '196' + n + '500' + n + '₽' },
    ],
  };
}

export default function MAssistant() {
  const v = useScreen();
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '390px',
        height: '100vh',
        paddingTop: '12px',
        background: 'var(--bg)',
        boxShadow: 'inset 0 0 0 9999px var(--scrim)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--ink)',
        display: 'flex',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Ассистент"
        style={{
          flex: '1',
          minHeight: '0',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '8px' }} aria-hidden="true">
          <span style={{ width: '40px', height: '4px', borderRadius: '9999px', background: 'var(--line)' }}></span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 8px 12px 16px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <span className="kn-mark" style={{ width: '36px', height: '36px' }}>
            <Icon name="sparkle" size={18} />
          </span>
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
            <span className="title-3">Ассистент</span>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Видит экран «Подбор»
            </span>
          </div>
          <Link className="kn-ibtn" to="/m-need" aria-label="Свернуть ассистента">
            <Icon name="x" />
          </Link>
        </div>
        <div
          style={{
            flex: '1',
            minHeight: '0',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
            padding: '16px',
          }}
        >
          <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
            <ChatMessage role="user" time="10:32">
              3 миллиона, деньги нужны до 1 ноября
            </ChatMessage>{' '}
            <ChatMessage role="assistant" time="10:33">
              <p>Посмотрю обороты по счёту.</p>
              <p>Выручка приходит волнами раз в две недели — предлагаю кредитную линию.</p>
            </ChatMessage>{' '}
            <Link
              to="/m-offers"
              aria-label="Открыть варианты: кредитная линия 3 000 000 ₽"
              style={{ display: 'block', paddingLeft: '40px', color: 'inherit', textDecoration: 'none' }}
            >
              <ProductCard
                name="Кредитная линия"
                purpose="Закупки партиями, деньги нужны многократно"
                amountLabel="Лимит"
                amount="3 000 000 ₽"
                params={v.params}
              >
                <PaymentLoadMeter payment={v.pay} cashFlow={v.flow} />
              </ProductCard>
            </Link>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '40px' }}>
              <Link className="kk-chip" to="/m-offers">
                Открыть варианты
              </Link>{' '}
              <Link className="kk-chip" to="/m-offers">
                Почему такая сумма?
              </Link>
            </div>
          </div>
        </div>
        <div style={{ padding: '10px 16px 16px', borderTop: '1px solid var(--line)' }}>
          <ChatComposer
            placeholder="Опишите задачу своими словами"
            hint="Ассистент помогает с выбором. Решение по заявке принимает банк."
            onSend={v.noop}
            onAttach={v.noop}
          />
        </div>
      </section>
    </div>
  );
}
