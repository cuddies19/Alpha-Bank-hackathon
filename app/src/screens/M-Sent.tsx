// B6 · Отправлена · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Sent.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import MobileTop from './MobileTop';

export default function MSent() {
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
          <h1 className="title-1">Заявка отправлена</h1>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            Кредитная линия · 3 000 000 ₽ · № 2026-10-0142
          </p>
        </div>
        <section className="kk-card kk-card--sm" style={{ gap: '12px', padding: '20px 16px' }}>
          <h2 className="title-3">Что будет дальше</h2>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li className="body" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="kn-avatar" style={{ width: '28px', height: '28px' }}>
                1
              </span>
              Проверим данные и документы
            </li>
            <li className="body" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="kn-avatar" style={{ width: '28px', height: '28px' }}>
                2
              </span>
              Запросим сведения в ЕГРЮЛ, ФНС и БКИ
            </li>
            <li className="body" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="kn-avatar" style={{ width: '28px', height: '28px' }}>
                3
              </span>
              Примем решение
            </li>
          </ol>
        </section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'var(--surface)',
          }}
        >
          <span style={{ color: 'var(--ink-secondary)' }}>
            <Icon name="clock" />
          </span>
          <p className="body">
            <b>Обычно до 2 часов.</b> Сообщим о решении здесь, в кабинете.
          </p>
        </div>
      </div>
      <div className="kn-mbar">
        <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/m-status">
          Следить за заявкой
        </Link>{' '}
        <Link className="kk-btn kk-btn--ghost kk-btn--full" to="/m-home">
          На главную
        </Link>
      </div>
    </div>
  );
}
