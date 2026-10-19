// B1 · Главная — перенесено из макета «Кредитный кабинет — макет» (B1-Home.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Icon, MetricTile } from '../ui';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  return {
    incDelta: { value: '+12%', direction: 'up', tone: 'success', label: 'к сентябрю' },
  };
}

export default function B1Home() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="home" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="display">Добрый день, Игорь</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              ООО «Дом и уют» · данные по счёту на 24 октября, 10:42
            </p>
          </div>
          <Alert tone="assistant" title="Через 12 дней возможен кассовый разрыв">
            <p>Выплата от маркетплейса придёт 6 ноября, а закупка нужна до 1 ноября.</p>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Link className="kk-btn kk-btn--primary" to="/b2-need">
                Подобрать финансирование
              </Link>{' '}
              <Link className="kk-btn kk-btn--ghost" to="/b2-dialog">
                Спросить ассистента
              </Link>
            </div>
          </Alert>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
              gap: '16px',
            }}
          >
            <MetricTile label="Остаток на счёте" value="1 240 500 ₽" icon="wallet" hint="Счёт •• 4821" />{' '}
            <MetricTile label="Поступления за 30 дней" value="3 860 000 ₽" icon="arrow-down" delta={v.incDelta} />{' '}
            <MetricTile
              label="Чистый денежный поток"
              value="610 000 ₽"
              icon="trend-up"
              hint="в месяц, в среднем за 6 месяцев"
            />{' '}
            <MetricTile
              label="Платежи по кредитам"
              value="38 000 ₽"
              icon="calendar"
              hint="в месяц, 1 кредит в другом банке"
            />
          </div>
          <div className="kn-cols">
            <section className="kk-card kk-card--md kn-cols__main" style={{ gap: '20px' }}>
              <div className="kn-sechead">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2 className="title-3">Поступления и списания</h2>
                  <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    Май — октябрь 2026, по счёту •• 4821
                  </p>
                </div>
                <div className="kn-legend">
                  <span>
                    <i style={{ background: 'var(--ink)' }}></i>Поступления
                  </span>
                  <span>
                    <i style={{ background: 'var(--line-strong)' }}></i>Списания
                  </span>
                </div>
              </div>
              <div
                role="img"
                aria-label="Столбики по месяцам: поступления растут с 1,9 млн ₽ в июле до 3,86 млн ₽ в октябре, списания — с 1,45 до 3,15 млн ₽"
              >
                <div className="kn-chart">
                  <div className="kn-chart__grid" style={{ top: '0%' }}>
                    <span>4 млн</span>
                  </div>
                  <div className="kn-chart__grid" style={{ top: '25%' }}>
                    <span>3 млн</span>
                  </div>
                  <div className="kn-chart__grid" style={{ top: '50%' }}>
                    <span>2 млн</span>
                  </div>
                  <div className="kn-chart__grid" style={{ top: '75%' }}>
                    <span>1 млн</span>
                  </div>
                  <div className="kn-chart__grid" style={{ top: '100%' }}>
                    <span>0</span>
                  </div>
                  <div className="kn-chart__bars">
                    <div className="kn-chart__group">
                      <div className="kn-chart__bar" style={{ height: '60%', background: 'var(--ink)' }}></div>
                      <div
                        className="kn-chart__bar"
                        style={{ height: '43.75%', background: 'var(--line-strong)' }}
                      ></div>
                    </div>
                    <div className="kn-chart__group">
                      <div className="kn-chart__bar" style={{ height: '52.5%', background: 'var(--ink)' }}></div>
                      <div
                        className="kn-chart__bar"
                        style={{ height: '38.75%', background: 'var(--line-strong)' }}
                      ></div>
                    </div>
                    <div className="kn-chart__group">
                      <div className="kn-chart__bar" style={{ height: '47.5%', background: 'var(--ink)' }}></div>
                      <div
                        className="kn-chart__bar"
                        style={{ height: '36.25%', background: 'var(--line-strong)' }}
                      ></div>
                    </div>
                    <div className="kn-chart__group">
                      <div className="kn-chart__bar" style={{ height: '62.5%', background: 'var(--ink)' }}></div>
                      <div
                        className="kn-chart__bar"
                        style={{ height: '46.25%', background: 'var(--line-strong)' }}
                      ></div>
                    </div>
                    <div className="kn-chart__group">
                      <div className="kn-chart__bar" style={{ height: '86.25%', background: 'var(--ink)' }}></div>
                      <div className="kn-chart__bar" style={{ height: '70%', background: 'var(--line-strong)' }}></div>
                    </div>
                    <div className="kn-chart__group">
                      <div className="kn-chart__bar" style={{ height: '96.5%', background: 'var(--ink)' }}></div>
                      <div
                        className="kn-chart__bar"
                        style={{ height: '78.75%', background: 'var(--line-strong)' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="kn-chart__x">
                  <span>май</span>
                  <span>июнь</span>
                  <span>июль</span>
                  <span>август</span>
                  <span>сентябрь</span>
                  <span>октябрь</span>
                </div>
              </div>
              <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                Выручка растёт к сезону распродаж: в октябре поступления выше июльских в 2 раза.
              </p>
            </section>
            <div className="kn-cols__side">
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Активная заявка</h2>
                <p className="body" style={{ color: 'var(--ink-secondary)' }}>
                  Активных заявок нет. Опишите задачу — подберём продукт и посчитаем платёж до подачи заявки.
                </p>
                <Link className="kk-btn kk-btn--secondary" to="/b2-need" style={{ alignSelf: 'flex-start' }}>
                  Подобрать под задачу
                </Link>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '8px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Ближайшие события</h2>
                  <Link className="kk-btn kk-btn--link" to="/b14-notifications">
                    Все
                  </Link>
                </div>
                <ul className="kn-feed">
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic" style={{ color: 'var(--accent-text)' }}>
                      <Icon name="sparkle" size={20} />
                    </span>{' '}
                    <span className="body">Ассистент заметил возможный кассовый разрыв</span> <time>10:42</time>
                  </li>
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="document" size={20} />
                    </span>{' '}
                    <span className="body">Выписка по счёту обновлена</span> <time>10:40</time>
                  </li>
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="calendar" size={20} />
                    </span>{' '}
                    <span className="body">Выплата от маркетплейса ожидается 6 ноября</span> <time>вчера</time>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
