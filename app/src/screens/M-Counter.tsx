// B9b · Предложение банка · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Counter.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon, PaymentLoadMeter } from '../ui';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';

function useScreen(): ScreenValues {
  return { pay3: 196500, pay24: 157200, flow: 610000 };
}

export default function MCounter() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop
        mode="flow"
        title="Решение по заявке"
        sub="№ 2026-10-0142 · 24 октября, 11:32"
        back="/m-status"
        unread="3"
      />
      <div className="kn-mobile__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Badge tone="warning">Предложение банка</Badge>
          <h1 className="title-1">
            Банк готов выдать <span className="amt">2 400 000 ₽</span>
          </h1>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            Платёж на 3 000 000 ₽ занял бы треть вашего денежного потока. С этой суммой нагрузка комфортная.
          </p>
        </div>
        <section className="kk-card kk-card--sm" style={{ gap: '12px', padding: '20px 16px' }}>
          <span className="label" style={{ color: 'var(--ink-secondary)' }}>
            Вы просили
          </span>{' '}
          <span className="amount-lg amt" style={{ color: 'var(--ink-secondary)' }}>
            3 000 000 ₽
          </span>
          <dl className="kn-rows">
            <div>
              <dt>18 мес. · платёж</dt>
              <dd>196 500 ₽</dd>
            </div>
          </dl>
          <PaymentLoadMeter payment={v.pay3} cashFlow={v.flow} />
        </section>
        <section
          className="kk-card kk-card--sm"
          style={{ gap: '12px', padding: '20px 16px', boxShadow: 'inset 0 0 0 2px var(--ink)' }}
        >
          <span className="label">Банк предлагает</span> <span className="amount-xl amt">2 400 000 ₽</span>
          <dl className="kn-rows">
            <div>
              <dt>18 мес. · платёж</dt>
              <dd>157 200 ₽</dd>
            </div>
            <div>
              <dt>Ставка</dt>
              <dd>21,5%</dd>
            </div>
          </dl>
          <PaymentLoadMeter payment={v.pay24} cashFlow={v.flow} />
        </section>
        <section className="kk-card kk-card--sm" style={{ padding: '16px' }}>
          <details className="kn-disc">
            <summary>
              <span className="body-strong">Почему такое решение</span>
              <span className="kn-disc__chev">
                <Icon name="chevron-right" />
              </span>
            </summary>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px' }}>
              <li className="body" style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--success)' }}>
                  <Icon name="check-circle" />
                </span>
                Поступления стабильны 12 месяцев
              </li>
              <li className="body" style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--success)' }}>
                  <Icon name="check-circle" />
                </span>
                Нет просрочек по текущему кредиту
              </li>
              <li className="body" style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--warning)' }}>
                  <Icon name="alert" />
                </span>
                Платёж на 3 000 000 ₽ — 32% потока, выше 30%
              </li>
            </ul>
          </details>
        </section>
        <Link className="kk-btn kk-btn--link" to="/m-assistant" style={{ alignSelf: 'center' }}>
          <Icon name="sparkle" size={16} />
          Обсудить с ассистентом
        </Link>
      </div>
      <div className="kn-mbar">
        <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/m-sign">
          Принять предложение
        </Link>{' '}
        <Button variant="secondary" fullWidth={true}>
          Отказаться
        </Button>
        <p className="caption" style={{ textAlign: 'center', color: 'var(--ink-secondary)', fontWeight: '400' }}>
          Условия действуют до 31 октября
        </p>
      </div>
    </div>
  );
}
