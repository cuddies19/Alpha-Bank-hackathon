// B9b · Предложение банка — перенесено из макета «Кредитный кабинет — макет» (B9b-Counter.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon, PaymentLoadMeter } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  return {
    pay3: 196500,
    pay24: 157200,
    flow: 610000,
    decline: !!s.decline,
    askDecline: () => setState({ decline: true }),
    cancel: () => setState({ decline: false }),
  };
}

export default function B9bCounter() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main">
        <HeaderClient unread="3" />
        <div className="kn-page kn-page--narrow" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Badge tone="warning">Предложение банка</Badge>{' '}
              <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                Заявка № 2026-10-0142 · решение 24 октября, 11:32
              </span>
            </div>
            <h1 className="display">
              Банк готов выдать <span className="amt">2 400 000 ₽</span>
            </h1>
            <p className="body-lg" style={{ color: 'var(--ink-secondary)', maxWidth: '680px' }}>
              Платёж на 3 000 000 ₽ занял бы треть вашего денежного потока. С этой суммой нагрузка комфортная.
            </p>
          </div>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
              gap: '16px',
            }}
          >
            <div className="kk-card kk-card--md" style={{ gap: '16px' }}>
              <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                Вы просили
              </span>{' '}
              <span className="amount-xl amt" style={{ color: 'var(--ink-secondary)' }}>
                3 000 000 ₽
              </span>
              <dl className="kn-rows">
                <div>
                  <dt>Срок</dt>
                  <dd>18 мес.</dd>
                </div>
                <div>
                  <dt>Платёж</dt>
                  <dd>196 500 ₽</dd>
                </div>
                <div>
                  <dt>Доля потока</dt>
                  <dd>32%</dd>
                </div>
              </dl>
              <PaymentLoadMeter payment={v.pay3} cashFlow={v.flow} />
            </div>
            <div className="kk-card kk-card--md" style={{ gap: '16px', boxShadow: 'inset 0 0 0 2px var(--ink)' }}>
              <span className="label">Банк предлагает</span> <span className="amount-xl amt">2 400 000 ₽</span>
              <dl className="kn-rows">
                <div>
                  <dt>Срок</dt>
                  <dd>18 мес.</dd>
                </div>
                <div>
                  <dt>Платёж</dt>
                  <dd>157 200 ₽</dd>
                </div>
                <div>
                  <dt>Доля потока</dt>
                  <dd>26%</dd>
                </div>
              </dl>
              <PaymentLoadMeter payment={v.pay24} cashFlow={v.flow} />
            </div>
          </section>
          <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
            <dl className="kn-kv">
              <div>
                <dt>Продукт</dt>
                <dd>Кредитная линия</dd>
              </div>
              <div>
                <dt>Ставка</dt>
                <dd>21,5%</dd>
              </div>
              <div>
                <dt>Первый платёж</dt>
                <dd>15 ноября</dd>
              </div>
              <div>
                <dt>Залог</dt>
                <dd>Не нужен</dd>
              </div>
            </dl>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--line)',
              }}
            >
              <Link className="kk-btn kk-btn--primary kk-btn--lg" to="/b10-sign">
                Принять предложение
              </Link>{' '}
              <Button variant="secondary" size="lg" onClick={v.askDecline}>
                Отказаться
              </Button>{' '}
              <Link className="kk-btn kk-btn--link" to="/b2-dialog">
                <Icon name="sparkle" size={16} />
                Обсудить с ассистентом
              </Link>
            </div>
            <p
              className="body-sm"
              style={{ color: 'var(--ink-secondary)', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Icon name="calendar" size={16} />
              Условия действуют до 31 октября
            </p>
          </section>
          <section className="kk-card kk-card--md">
            <details className="kn-disc" open>
              <summary>
                <span className="title-3">Почему такое решение</span>
                <span className="kn-disc__chev">
                  <Icon name="chevron-right" />
                </span>
              </summary>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--success)' }}>
                    <Icon name="check-circle" />
                  </span>
                  Поступления по счёту стабильны все 12 месяцев
                </li>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--success)' }}>
                    <Icon name="check-circle" />
                  </span>
                  По текущему кредиту в другом банке нет просрочек
                </li>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--warning)' }}>
                    <Icon name="alert" />
                  </span>
                  Платёж на 3 000 000 ₽ — 32% потока, это выше комфортных 30%
                </li>
              </ul>
            </details>
          </section>
        </div>
      </main>
      {v.decline ? (
        <>
          <div className="kn-scrim">
            <div className="kn-modal" role="dialog" aria-modal="true" aria-labelledby="dc-title">
              <h2 className="title-3" id="dc-title">
                Отказаться от предложения?
              </h2>
              <p className="body">
                Заявка закроется. Новую можно подать в любой момент — данные компании подставим снова.
              </p>
              <div className="kn-modal__actions">
                <Button variant="secondary" onClick={v.cancel}>
                  Вернуться
                </Button>{' '}
                <Link className="kk-btn kk-btn--primary" to="/b7-applications">
                  Отказаться
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
