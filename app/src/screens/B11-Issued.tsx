// B11 · Деньги зачислены — перенесено из макета «Кредитный кабинет — макет» (B11-Issued.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

export default function B11Issued() {
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="loans" appsCount="0" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page kn-page--narrow" style={{ paddingTop: '64px' }}>
          <section className="kk-card kk-card--lg" style={{ gap: '24px' }}>
            <span
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '9999px',
                background: 'var(--success-soft)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check-circle" size={32} />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p className="body-lg" style={{ color: 'var(--ink-secondary)' }}>
                Деньги зачислены
              </p>
              <h1 className="display">
                <span className="amt">2 400 000 ₽</span> на счёте
              </h1>
            </div>
            <dl
              className="kn-kv"
              style={{ padding: '16px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
            >
              <div>
                <dt>Счёт зачисления</dt>
                <dd className="amount-md">•• 4821</dd>
              </div>
              <div>
                <dt>Первый платёж</dt>
                <dd className="amount-md">15 ноября</dd>
              </div>
              <div>
                <dt>Сумма платежа</dt>
                <dd className="amount-md amt">157 200 ₽</dd>
              </div>
              <div>
                <dt>Договор</dt>
                <dd className="amount-md">№ 2026-10-0142-Д</dd>
              </div>
            </dl>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link className="kk-btn kk-btn--primary kk-btn--lg" to="/b12-loans">
                Открыть график платежей
              </Link>{' '}
              <Link className="kk-btn kk-btn--secondary kk-btn--lg" to="/b1-home">
                На главную
              </Link>
            </div>
            <p
              className="body-sm"
              style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink-secondary)' }}
            >
              <Icon name="info" size={16} />
              Выдача смоделирована, реального перевода нет.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
