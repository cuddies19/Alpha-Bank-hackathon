// B1 · Главная · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Home.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Icon, MetricTile } from '../ui';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';
import NavMobile from './NavMobile';

function useScreen(): ScreenValues {
  return { incDelta: { value: '+12%', direction: 'up', tone: 'success', label: 'к сентябрю' } };
}

export default function MHome() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop mode="root" />
      <div className="kn-mobile__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 className="title-1">Добрый день, Игорь</h1>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Данные по счёту на 24 октября, 10:42
          </p>
        </div>
        <Alert tone="assistant" title="Через 12 дней возможен кассовый разрыв">
          <p>Выплата от маркетплейса придёт 6 ноября, а закупка нужна до 1 ноября.</p>
          <div style={{ marginTop: '12px' }}>
            <Link className="kk-btn kk-btn--primary kk-btn--full" to="/m-need">
              Подобрать финансирование
            </Link>
          </div>
        </Alert>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <MetricTile label="Остаток на счёте" value="1 240 500 ₽" icon="wallet" />{' '}
          <MetricTile label="Поступления за 30 дней" value="3 860 000 ₽" icon="arrow-down" delta={v.incDelta} />{' '}
          <MetricTile label="Чистый денежный поток" value="610 000 ₽" icon="trend-up" hint="в месяц" />{' '}
          <MetricTile label="Платежи по кредитам" value="38 000 ₽" icon="calendar" hint="в месяц" />
        </div>
        <section className="kk-card kk-card--sm" style={{ gap: '12px', padding: '20px 16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Поступления и списания</h2>
          </div>
          <div className="kn-legend">
            <span>
              <i style={{ background: 'var(--ink)' }}></i>Поступления
            </span>
            <span>
              <i style={{ background: 'var(--line-strong)' }}></i>Списания
            </span>
          </div>
          <div
            role="img"
            aria-label="Поступления растут с 1,9 млн ₽ в июле до 3,86 млн ₽ в октябре"
            style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            <div
              style={{
                height: '120px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                <span
                  style={{ width: '14px', height: '60%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                ></span>
                <span
                  style={{
                    width: '14px',
                    height: '43.75%',
                    background: 'var(--line-strong)',
                    borderRadius: '3px 3px 0 0',
                  }}
                ></span>
              </div>
              <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                <span
                  style={{ width: '14px', height: '52.5%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                ></span>
                <span
                  style={{
                    width: '14px',
                    height: '38.75%',
                    background: 'var(--line-strong)',
                    borderRadius: '3px 3px 0 0',
                  }}
                ></span>
              </div>
              <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                <span
                  style={{ width: '14px', height: '47.5%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                ></span>
                <span
                  style={{
                    width: '14px',
                    height: '36.25%',
                    background: 'var(--line-strong)',
                    borderRadius: '3px 3px 0 0',
                  }}
                ></span>
              </div>
              <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                <span
                  style={{ width: '14px', height: '62.5%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                ></span>
                <span
                  style={{
                    width: '14px',
                    height: '46.25%',
                    background: 'var(--line-strong)',
                    borderRadius: '3px 3px 0 0',
                  }}
                ></span>
              </div>
              <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                <span
                  style={{ width: '14px', height: '86.25%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                ></span>
                <span
                  style={{
                    width: '14px',
                    height: '70%',
                    background: 'var(--line-strong)',
                    borderRadius: '3px 3px 0 0',
                  }}
                ></span>
              </div>
              <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                <span
                  style={{ width: '14px', height: '96.5%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                ></span>
                <span
                  style={{
                    width: '14px',
                    height: '78.75%',
                    background: 'var(--line-strong)',
                    borderRadius: '3px 3px 0 0',
                  }}
                ></span>
              </div>
            </div>
            <div
              className="caption"
              style={{ display: 'flex', justifyContent: 'space-around', color: 'var(--ink-secondary)' }}
            >
              <span>май</span>
              <span>июн</span>
              <span>июл</span>
              <span>авг</span>
              <span>сен</span>
              <span>окт</span>
            </div>
          </div>
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '10px', padding: '20px 16px' }}>
          <h2 className="title-3">Активная заявка</h2>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            Активных заявок нет. Опишите задачу — подберём продукт и посчитаем платёж.
          </p>
          <Link className="kk-btn kk-btn--secondary kk-btn--full" to="/m-need">
            Подобрать под задачу
          </Link>
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '4px', padding: '20px 16px' }}>
          <h2 className="title-3">Ближайшие события</h2>
          <ul className="kn-feed">
            <li className="kn-feed__item">
              <span className="kn-feed__ic" style={{ color: 'var(--accent-text)' }}>
                <Icon name="sparkle" />
              </span>
              <span className="body">Ассистент заметил возможный кассовый разрыв</span>
              <time>10:42</time>
            </li>
            <li className="kn-feed__item">
              <span className="kn-feed__ic">
                <Icon name="document" />
              </span>
              <span className="body">Выписка по счёту обновлена</span>
              <time>10:40</time>
            </li>
            <li className="kn-feed__item">
              <span className="kn-feed__ic">
                <Icon name="calendar" />
              </span>
              <span className="body">Выплата от маркетплейса 6 ноября</span>
              <time>вчера</time>
            </li>
          </ul>
        </section>
        <div style={{ height: '64px' }} aria-hidden="true"></div>
      </div>
      <Link className="kn-demo kn-demo--m" to="/a2-demo">
        <Icon name="shield" size={16} />
        Режим проверки
      </Link>{' '}
      <Link className="kn-fab" to="/m-assistant" aria-label="Открыть ассистента">
        <Icon name="sparkle" size={24} />
      </Link>
      <NavMobile active="home" />
    </div>
  );
}
