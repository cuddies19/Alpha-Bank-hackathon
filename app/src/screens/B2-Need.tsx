// B2 · Подбор: задача — перенесено из макета «Кредитный кабинет — макет» (B2-Need.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon } from '../ui';
import AssistantPanel from './AssistantPanel';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

export default function B2Need() {
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="financing" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="title-1">Для чего нужны деньги?</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              Расскажите о задаче словами бизнеса — подберём продукт и посчитаем платёж по данным вашего счёта.
            </p>
          </div>
          <div className="kn-cols">
            <div className="kn-cols__main" style={{ gap: '24px', flexBasis: '400px' }}>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="kn-mark">
                    <Icon name="sparkle" size={16} />
                  </span>
                  <h2 className="title-3">Описать своими словами</h2>
                </div>
                <label className="kn-field">
                  <span className="kk-sr">Задача бизнеса</span>
                  <textarea
                    className="kn-textarea"
                    rows={3}
                    placeholder="Например: нужно закупить товар к распродаже, а выплата от маркетплейса придёт позже"
                    style={{ minHeight: '104px', fontSize: '17px', lineHeight: '26px' }}
                  ></textarea>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <Link className="kk-chip" to="/b2-dialog">
                    Закупить товар к сезону
                  </Link>{' '}
                  <Link className="kk-chip" to="/b2-dialog">
                    Не хватает на зарплату до поступления выручки
                  </Link>{' '}
                  <Link className="kk-chip" to="/b2-dialog">
                    Купить оборудование
                  </Link>{' '}
                  <Link className="kk-chip" to="/b2-dialog">
                    Выиграли тендер
                  </Link>
                </div>
                <Link className="kk-btn kk-btn--secondary" to="/b2-dialog" style={{ alignSelf: 'flex-start' }}>
                  <Icon name="arrow-up" size={20} /> Отправить ассистенту
                </Link>
              </section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} aria-hidden="true">
                <span className="kn-divider" style={{ flex: '1' }}></span>{' '}
                <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                  или
                </span>{' '}
                <span className="kn-divider" style={{ flex: '1' }}></span>
              </div>
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 className="title-3">Выбрать цель</h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))',
                    gap: '16px',
                  }}
                >
                  <Link className="kn-goal" to="/b2-goal">
                    <span className="kn-goal__ic">
                      <Icon name="calendar" size={24} />
                    </span>{' '}
                    <span className="body-strong">Кассовый разрыв</span>{' '}
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Деньги нужны до поступления выручки
                    </span>
                  </Link>{' '}
                  <Link className="kn-goal" to="/b2-goal">
                    <span className="kn-goal__ic">
                      <Icon name="trend-up" size={24} />
                    </span>{' '}
                    <span className="body-strong">Пополнить оборот</span>{' '}
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Закупки партиями, сезонный товар
                    </span>
                  </Link>{' '}
                  <Link className="kn-goal" to="/b2-goal">
                    <span className="kn-goal__ic">
                      <Icon name="wallet" size={24} />
                    </span>{' '}
                    <span className="body-strong">Развитие и оборудование</span>{' '}
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Кредит на любые цели
                    </span>{' '}
                    <Badge tone="neutral">Лизинг — скоро</Badge>
                  </Link>{' '}
                  <Link className="kn-goal" to="/b2-goal">
                    <span className="kn-goal__ic">
                      <Icon name="document" size={24} />
                    </span>{' '}
                    <span className="body-strong">Тендер и контракт</span>{' '}
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Исполнение контракта до оплаты
                    </span>{' '}
                    <Badge tone="neutral">Гарантия — скоро</Badge>
                  </Link>{' '}
                  <Link className="kn-goal" to="/b2-goal">
                    <span className="kn-goal__ic">
                      <Icon name="trend-down" size={24} />
                    </span>{' '}
                    <span className="body-strong">Рефинансировать кредиты</span>{' '}
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Снизить платёж по текущим кредитам
                    </span>
                  </Link>
                </div>
              </section>
            </div>
            <aside className="kn-cols__side" aria-label="Что поняли о задаче" style={{ flexBasis: '260px' }}>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <h2 className="title-3">Что поняли о задаче</h2>
                <dl className="kn-rows">
                  <div>
                    <dt>Цель</dt>
                    <dd style={{ color: 'var(--ink-secondary)', fontWeight: '400' }}>—</dd>
                  </div>
                  <div>
                    <dt>Сумма</dt>
                    <dd style={{ color: 'var(--ink-secondary)', fontWeight: '400' }}>—</dd>
                  </div>
                  <div>
                    <dt>Срок</dt>
                    <dd style={{ color: 'var(--ink-secondary)', fontWeight: '400' }}>—</dd>
                  </div>
                  <div>
                    <dt>Когда нужны деньги</dt>
                    <dd style={{ color: 'var(--ink-secondary)', fontWeight: '400' }}>—</dd>
                  </div>
                </dl>
                <Button variant="primary" disabled={true} fullWidth={true}>
                  Показать варианты
                </Button>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Опишите задачу или выберите цель — после этого покажем подходящие продукты.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <aside className="kn-app__assist">
        <AssistantPanel mode="start" screen="Подбор финансирования" />
      </aside>
    </div>
  );
}
