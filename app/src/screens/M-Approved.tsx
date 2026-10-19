// B9a · Одобрено · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Approved.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon, PaymentLoadMeter } from '../ui';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';

function useScreen(): ScreenValues {
  return { pay: 47000, flow: 420000 };
}

export default function MApproved() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop
        mode="flow"
        title="Решение по заявке"
        sub="ИП Белова А. С. · № 2026-10-0139"
        back="/m-login"
        unread="1"
      />
      <div className="kn-mobile__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Badge tone="success">Одобрено</Badge>
          <h1 className="title-1">Банк одобрил овердрафт</h1>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Решение принято автоматически 24 октября, 10:31
          </p>
        </div>
        <section className="kk-card kk-card--sm" style={{ gap: '16px', padding: '20px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="label" style={{ color: 'var(--ink-secondary)' }}>
              Лимит
            </span>
            <span className="amount-xl amt">500 000 ₽</span>
          </div>
          <dl
            className="kn-kv"
            style={{
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              padding: '12px 0',
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div>
              <dt>Срок</dt>
              <dd className="amount-md">12 мес.</dd>
            </div>
            <div>
              <dt>Ставка</dt>
              <dd className="amount-md">23%</dd>
            </div>
            <div>
              <dt>Платёж</dt>
              <dd className="amount-md amt">≈ 47 000 ₽</dd>
            </div>
            <div>
              <dt>Первый платёж</dt>
              <dd className="amount-md">15 ноября</dd>
            </div>
          </dl>
          <PaymentLoadMeter payment={v.pay} cashFlow={v.flow} />
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '8px', padding: '20px 16px' }}>
          <h2 className="title-3">График платежей</h2>
          <dl className="kn-rows">
            <div>
              <dt>15 ноября 2026</dt>
              <dd>47 037 ₽</dd>
            </div>
            <div>
              <dt>15 декабря 2026</dt>
              <dd>47 037 ₽</dd>
            </div>
            <div>
              <dt>15 января 2027</dt>
              <dd>47 037 ₽</dd>
            </div>
          </dl>
          <Button variant="ghost" iconRight="chevron-right">
            Показать весь график
          </Button>
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
                Поступления стабильны 4 года
              </li>
              <li className="body" style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--success)' }}>
                  <Icon name="check-circle" />
                </span>
                Нет просрочек по кредитам
              </li>
              <li className="body" style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--success)' }}>
                  <Icon name="check-circle" />
                </span>
                Платёж — 11% потока, комфортно
              </li>
            </ul>
          </details>
        </section>
      </div>
      <div className="kn-mbar">
        <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/m-sign">
          Принять условия
        </Link>
        <p className="caption" style={{ textAlign: 'center', color: 'var(--ink-secondary)', fontWeight: '400' }}>
          Условия действуют до 31 октября
        </p>
      </div>
    </div>
  );
}
