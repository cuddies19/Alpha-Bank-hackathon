// B8 · Статус: у специалиста — перенесено из макета «Кредитный кабинет — макет» (B8-Status.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon, StatusTracker } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  return {
    toast: !s.toastClosed,
    withdraw: !!s.withdraw,
    closeToast: () => setState({ toastClosed: true }),
    askWithdraw: () => setState({ withdraw: true }),
    cancelWithdraw: () => setState({ withdraw: false }),
    stages: [
      { title: 'Заявка отправлена', status: 'done', time: '10:51' },
      { title: 'Проверяем данные', status: 'done', time: '10:52' },
      {
        title: 'Запрашиваем сведения',
        status: 'done',
        time: '10:58',
        description: 'ЕГРЮЛ, ФНС «Прозрачный бизнес», кредитная история',
      },
      { title: 'Оцениваем заявку', status: 'done', time: '11:05' },
      {
        title: 'Рассматривает специалист',
        status: 'current',
        time: 'обычно до 1 часа',
        description:
          'Платёж на 3 000 000 ₽ — заметная часть денежного потока, поэтому заявку смотрит специалист. Решение придёт сюда.',
      },
      { title: 'Решение', status: 'pending' },
      { title: 'Подписание', status: 'pending', time: 'в кабинете' },
      { title: 'Деньги на счёте', status: 'pending' },
    ],
  };
}

export default function B8Status() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main" style={{ position: 'relative' }}>
        <HeaderClient />
        {v.toast ? (
          <>
            <div className="kn-toast kn-toast--float" role="status">
              <span className="kn-toast__ic" style={{ color: '#7fb0ff' }}>
                <Icon name="info" />
              </span>
              <div className="kn-toast__body">
                <b>Заявка перешла к специалисту</b>
                <span>11:05 · статус обновился сам, перезагружать не нужно</span>
              </div>
              <button
                type="button"
                className="kn-ibtn"
                aria-label="Закрыть уведомление"
                onClick={v.closeToast}
                style={{ width: '28px', height: '28px', color: '#ffffff' }}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </>
        ) : null}
        <div className="kn-page" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link
              className="kk-btn kk-btn--link"
              to="/b7-applications"
              style={{ alignSelf: 'flex-start', color: 'var(--ink-secondary)' }}
            >
              <svg
                className="kn-svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M11.5 5.5L5 12l6.5 6.5" />
              </svg>{' '}
              Мои заявки
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 className="title-1">
                Кредитная линия на <span className="amt">3 000 000 ₽</span>
              </h1>
              <Badge tone="info">Рассматривает специалист</Badge>
            </div>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              № 2026-10-0142 · подана 24 октября, 10:51
            </p>
          </div>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Где заявка</h2>
                  <span
                    className="body-sm"
                    style={{ color: 'var(--ink-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span className="kn-dot" style={{ background: 'var(--success)' }}></span>Обновляется сама
                  </span>
                </div>
                <StatusTracker stages={v.stages} />
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '8px' }}>
                <h2 className="title-3">История событий</h2>
                <ul className="kn-feed">
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="clock" />
                    </span>
                    <span className="body">Заявка передана специалисту банка</span>
                    <time>24 окт., 11:05</time>
                  </li>
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="check" />
                    </span>
                    <span className="body">Оценка завершена</span>
                    <time>24 окт., 11:05</time>
                  </li>
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="check" />
                    </span>
                    <span className="body">Получены сведения из ЕГРЮЛ, ФНС и бюро кредитных историй</span>
                    <time>24 окт., 10:58</time>
                  </li>
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="check" />
                    </span>
                    <span className="body">Данные и документы проверены</span>
                    <time>24 окт., 10:52</time>
                  </li>
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="arrow-up" />
                    </span>
                    <span className="body">Заявка отправлена</span>
                    <time>24 окт., 10:51</time>
                  </li>
                </ul>
              </section>
            </div>
            <aside className="kn-cols__side">
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Параметры заявки</h2>
                <dl className="kn-rows">
                  <div>
                    <dt>Сумма</dt>
                    <dd>3 000 000 ₽</dd>
                  </div>
                  <div>
                    <dt>Срок</dt>
                    <dd>18 мес.</dd>
                  </div>
                  <div>
                    <dt>Ставка</dt>
                    <dd>от 21,5%</dd>
                  </div>
                  <div>
                    <dt>Платёж</dt>
                    <dd>≈ 196 500 ₽</dd>
                  </div>
                  <div>
                    <dt>Цель</dt>
                    <dd>Закупка к распродаже</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Документы</h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <span className="body">Отчётность 2025</span>
                    <Badge tone="success">Принят</Badge>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <span className="body">Выписка второго счёта</span>
                    <Badge tone="success">Принят</Badge>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <span className="body">Согласия</span>
                    <Badge tone="success">Подписано</Badge>
                  </li>
                </ul>
              </section>
              <Button variant="ghost" onClick={v.askWithdraw}>
                Отозвать заявку
              </Button>
            </aside>
          </div>
        </div>
        {v.withdraw ? (
          <>
            <div className="kn-scrim">
              <div className="kn-modal" role="dialog" aria-modal="true" aria-labelledby="wd-title">
                <h2 className="title-3" id="wd-title">
                  Отозвать заявку?
                </h2>
                <p className="body">
                  Банк перестанет её рассматривать. Чтобы получить деньги, понадобится новая заявка — данные компании
                  подставим снова.
                </p>
                <div className="kn-modal__actions">
                  <Button variant="secondary" onClick={v.cancelWithdraw}>
                    Оставить
                  </Button>{' '}
                  <Button variant="primary" onClick={v.cancelWithdraw}>
                    Отозвать
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
