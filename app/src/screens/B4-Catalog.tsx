// B4 · Каталог продуктов — перенесено из макета «Кредитный кабинет — макет» (B4-Catalog.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Icon, ProductCard } from '../ui';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const n = ' ';
  return {
    p1: [
      { label: 'Срок', value: '12' + n + 'мес.' },
      { label: 'Ставка', value: 'от' + n + '23%' },
      { label: 'От суммы', value: '100' + n + '000' + n + '₽' },
    ],
    p2: [
      { label: 'Срок', value: 'до' + n + '36' + n + 'мес.' },
      { label: 'Ставка', value: 'от' + n + '21,5%' },
      { label: 'От суммы', value: '500' + n + '000' + n + '₽' },
    ],
    p3: [
      { label: 'Срок', value: '12–60' + n + 'мес.' },
      { label: 'Ставка', value: 'от' + n + '22,9%' },
      { label: 'От суммы', value: '300' + n + '000' + n + '₽' },
    ],
  };
}

export default function B4Catalog() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="financing" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page">
          <div className="kn-sechead" style={{ alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="title-1">Каталог продуктов</h1>
              <p className="body" style={{ color: 'var(--ink-secondary)' }}>
                Для тех, кто знает, что нужно. Условия — от каталога, точные посчитаем по данным счёта.
              </p>
            </div>
            <Link className="kk-btn kk-btn--secondary" to="/b2-need">
              <span className="kn-mark" style={{ width: '24px', height: '24px' }}>
                <Icon name="sparkle" size={14} />
              </span>{' '}
              Подобрать под задачу
            </Link>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
              gap: '24px',
              alignItems: 'stretch',
            }}
          >
            <ProductCard
              name="Овердрафт"
              purpose="Кассовый разрыв: деньги на счёте, когда поступления задерживаются"
              amountLabel="Лимит до"
              amount="5 000 000 ₽"
              params={v.p1}
              preliminary={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p className="body-sm" style={{ display: 'flex', gap: '8px', color: 'var(--ink-secondary)' }}>
                  <Icon name="shield" size={16} />
                  Счёт в банке от 3 месяцев
                </p>
                <Link className="kk-btn kk-btn--secondary" to="/b3-offers" style={{ alignSelf: 'flex-start' }}>
                  Рассчитать
                </Link>
              </div>
            </ProductCard>{' '}
            <ProductCard
              name="Кредитная линия"
              purpose="Регулярные закупки и оборот: берёте частями, проценты только на выбранное"
              amountLabel="Лимит до"
              amount="30 000 000 ₽"
              params={v.p2}
              preliminary={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p className="body-sm" style={{ display: 'flex', gap: '8px', color: 'var(--ink-secondary)' }}>
                  <Icon name="shield" size={16} />
                  Бизнес работает от 12 месяцев
                </p>
                <Link className="kk-btn kk-btn--secondary" to="/b3-offers" style={{ alignSelf: 'flex-start' }}>
                  Рассчитать
                </Link>
              </div>
            </ProductCard>{' '}
            <ProductCard
              name="Кредит на любые цели"
              purpose="Разовая крупная трата: вся сумма сразу, равные платежи"
              amountLabel="Сумма до"
              amount="50 000 000 ₽"
              params={v.p3}
              preliminary={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p className="body-sm" style={{ display: 'flex', gap: '8px', color: 'var(--ink-secondary)' }}>
                  <Icon name="shield" size={16} />
                  Бизнес работает от 12 месяцев
                </p>
                <Link className="kk-btn kk-btn--secondary" to="/b3-offers" style={{ alignSelf: 'flex-start' }}>
                  Рассчитать
                </Link>
              </div>
            </ProductCard>
            <section className="kn-goal is-soon" aria-label="Банковская гарантия — скоро">
              <div className="kn-sechead">
                <h2 className="title-3" style={{ color: 'var(--ink)' }}>
                  Банковская гарантия
                </h2>
                <Badge tone="neutral" icon="clock">
                  Скоро
                </Badge>
              </div>
              <p className="body">Для тендера и контракта: банк гарантирует заказчику исполнение обязательств.</p>
            </section>
            <section className="kn-goal is-soon" aria-label="Лизинг — скоро">
              <div className="kn-sechead">
                <h2 className="title-3" style={{ color: 'var(--ink)' }}>
                  Лизинг
                </h2>
                <Badge tone="neutral" icon="clock">
                  Скоро
                </Badge>
              </div>
              <p className="body">Для оборудования и транспорта: платите частями, пока пользуетесь.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
