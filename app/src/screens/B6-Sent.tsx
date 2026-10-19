// B6 · Заявка отправлена — перенесено из макета «Кредитный кабинет — макет» (B6-Sent.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

export default function B6Sent() {
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
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
              <h1 className="title-1">Заявка отправлена</h1>
              <p className="body-lg" style={{ color: 'var(--ink-secondary)' }}>
                Кредитная линия · <span className="amt">3 000 000 ₽</span> · № 2026-10-0142
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="title-3">Что будет дальше</h2>
              <ol style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li className="body" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className="kn-avatar" style={{ width: '32px', height: '32px' }}>
                    1
                  </span>
                  Проверим данные и документы
                </li>
                <li className="body" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className="kn-avatar" style={{ width: '32px', height: '32px' }}>
                    2
                  </span>
                  Запросим сведения в ЕГРЮЛ, ФНС и бюро кредитных историй
                </li>
                <li className="body" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className="kn-avatar" style={{ width: '32px', height: '32px' }}>
                    3
                  </span>
                  Примем решение
                </li>
              </ol>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--surface-muted)',
              }}
            >
              <span style={{ color: 'var(--ink-secondary)' }}>
                <Icon name="clock" />
              </span>
              <p className="body">
                <b>Обычно до 2 часов.</b> Сообщим о решении здесь, в кабинете.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link className="kk-btn kk-btn--primary kk-btn--lg" to="/b8-status">
                Следить за заявкой
              </Link>{' '}
              <Link className="kk-btn kk-btn--ghost kk-btn--lg" to="/b1-home">
                На главную
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
