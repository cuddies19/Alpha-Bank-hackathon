// B2 · Подбор · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Need.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import MobileTop from './MobileTop';
import NavMobile from './NavMobile';

export default function MNeed() {
  return (
    <div className="kn-mobile">
      <MobileTop mode="root" />
      <div className="kn-mobile__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h1 className="title-1">Для чего нужны деньги?</h1>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            Расскажите о задаче словами бизнеса — подберём продукт и посчитаем платёж.
          </p>
        </div>
        <section className="kk-card kk-card--sm" style={{ gap: '12px', padding: '20px 16px' }}>
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
              placeholder="Например: нужно закупить товар к распродаже, а выплата придёт позже"
            ></textarea>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Link className="kk-chip" to="/m-assistant">
              Закупить товар к сезону
            </Link>{' '}
            <Link className="kk-chip" to="/m-assistant">
              Не хватает на зарплату
            </Link>{' '}
            <Link className="kk-chip" to="/m-assistant">
              Купить оборудование
            </Link>{' '}
            <Link className="kk-chip" to="/m-assistant">
              Выиграли тендер
            </Link>
          </div>
          <Link className="kk-btn kk-btn--secondary kk-btn--full" to="/m-assistant">
            <Icon name="arrow-up" />
            Отправить ассистенту
          </Link>
        </section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} aria-hidden="true">
          <span className="kn-divider" style={{ flex: '1' }}></span>
          <span className="label" style={{ color: 'var(--ink-secondary)' }}>
            или выберите цель
          </span>
          <span className="kn-divider" style={{ flex: '1' }}></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          <Link className="kn-goal" to="/m-assistant" style={{ minHeight: '128px', padding: '16px' }}>
            <span className="kn-goal__ic">
              <Icon name="calendar" />
            </span>
            <span className="body-strong">Кассовый разрыв</span>
          </Link>{' '}
          <Link className="kn-goal" to="/m-assistant" style={{ minHeight: '128px', padding: '16px' }}>
            <span className="kn-goal__ic">
              <Icon name="trend-up" />
            </span>
            <span className="body-strong">Пополнить оборот</span>
          </Link>{' '}
          <Link className="kn-goal" to="/m-assistant" style={{ minHeight: '128px', padding: '16px' }}>
            <span className="kn-goal__ic">
              <Icon name="wallet" />
            </span>
            <span className="body-strong">Развитие и оборудование</span>
            <span className="caption" style={{ color: 'var(--ink-secondary)' }}>
              Лизинг — скоро
            </span>
          </Link>{' '}
          <Link className="kn-goal" to="/m-assistant" style={{ minHeight: '128px', padding: '16px' }}>
            <span className="kn-goal__ic">
              <Icon name="document" />
            </span>
            <span className="body-strong">Тендер и контракт</span>
            <span className="caption" style={{ color: 'var(--ink-secondary)' }}>
              Гарантия — скоро
            </span>
          </Link>{' '}
          <Link
            className="kn-goal"
            to="/m-assistant"
            style={{ minHeight: '128px', padding: '16px', gridColumn: 'span 2' }}
          >
            <span className="kn-goal__ic">
              <Icon name="trend-down" />
            </span>
            <span className="body-strong">Рефинансировать кредиты</span>
          </Link>
        </div>
        <div style={{ height: '64px' }} aria-hidden="true"></div>
      </div>
      <Link className="kn-demo kn-demo--m" to="/a2-demo">
        <Icon name="shield" size={16} />
        Режим проверки
      </Link>{' '}
      <Link className="kn-fab" to="/m-assistant" aria-label="Открыть ассистента">
        <Icon name="sparkle" size={24} />
      </Link>
      <NavMobile active="financing" />
    </div>
  );
}
