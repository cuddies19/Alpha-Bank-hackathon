// B11 · Деньги зачислены · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Issued.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import MobileTop from './MobileTop';

export default function MIssued() {
  return (
    <div className="kn-mobile">
      <MobileTop mode="root" />
      <div className="kn-mobile__body" style={{ paddingTop: '32px', gap: '20px' }}>
        <span
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '9999px',
            background: 'var(--success-soft)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="check-circle" size={28} />
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            Деньги зачислены
          </p>
          <h1 className="title-1">
            <span className="amt">2 400 000 ₽</span> на счёте
          </h1>
        </div>
        <section className="kk-card kk-card--sm" style={{ padding: '8px 16px' }}>
          <dl className="kn-rows">
            <div>
              <dt>Счёт зачисления</dt>
              <dd>•• 4821</dd>
            </div>
            <div>
              <dt>Первый платёж</dt>
              <dd>15 ноября</dd>
            </div>
            <div>
              <dt>Сумма платежа</dt>
              <dd>157 200 ₽</dd>
            </div>
          </dl>
        </section>
        <p
          className="body-sm"
          style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink-secondary)' }}
        >
          <Icon name="info" size={16} />
          Выдача смоделирована, реального перевода нет.
        </p>
      </div>
      <div className="kn-mbar">
        <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/b12-loans">
          Открыть график платежей
        </Link>{' '}
        <Link className="kk-btn kk-btn--ghost kk-btn--full" to="/m-home">
          На главную
        </Link>
      </div>
    </div>
  );
}
