// B8 · Статус: решение готово — перенесено из макета «Кредитный кабинет — макет» (B8-Ready.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Icon, StatusTracker } from '../ui';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  return {
    stages: [
      { title: 'Заявка отправлена', status: 'done', time: '10:51' },
      { title: 'Проверяем данные', status: 'done', time: '10:52' },
      { title: 'Запрашиваем сведения', status: 'done', time: '10:58' },
      { title: 'Оцениваем заявку', status: 'done', time: '11:05' },
      { title: 'Рассматривает специалист', status: 'done', time: '11:32' },
      {
        title: 'Решение',
        status: 'current',
        time: 'до 31 октября',
        description: 'Банк предлагает 2 400 000 ₽ на 18 месяцев. Примите предложение или откажитесь.',
      },
      { title: 'Подписание', status: 'pending', time: 'в кабинете' },
      { title: 'Деньги на счёте', status: 'pending' },
    ],
  };
}

export default function B8Ready() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main" style={{ position: 'relative' }}>
        <HeaderClient unread="3" />
        <div className="kn-toast kn-toast--float" role="status">
          <span className="kn-toast__ic">
            <Icon name="check-circle" />
          </span>
          <div className="kn-toast__body">
            <b>Решение готово</b>
            <span>Заявка № 2026-10-0142 · 11:32</span>
            <Link to="/b9b-counter">Посмотреть решение</Link>
          </div>
        </div>
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
              <Badge tone="warning">Предложение банка</Badge>
            </div>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              № 2026-10-0142 · подана 24 октября, 10:51
            </p>
          </div>
          <section className="kk-card kk-card--lg" style={{ gap: '16px', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                Решение готово · 24 октября, 11:32
              </span>
              <h2 className="title-2">
                Банк готов выдать <span className="amt">2 400 000 ₽</span> на 18 месяцев
              </h2>
            </div>
            <p className="body" style={{ color: 'var(--ink-secondary)', maxWidth: '640px' }}>
              С этой суммой платёж займёт 26% денежного потока — комфортная нагрузка. Условия действуют до 31 октября.
            </p>
            <Link className="kk-btn kk-btn--primary kk-btn--lg" to="/b9b-counter" style={{ alignSelf: 'flex-start' }}>
              Посмотреть решение
            </Link>
          </section>
          <div className="kn-cols">
            <section className="kk-card kk-card--md kn-cols__main" style={{ gap: '20px' }}>
              <h2 className="title-3">Где заявка</h2>
              <StatusTracker stages={v.stages} />
            </section>
            <aside className="kn-cols__side">
              <section className="kk-card kk-card--md" style={{ gap: '8px' }}>
                <h2 className="title-3">История событий</h2>
                <ul className="kn-feed">
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="check-circle" />
                    </span>
                    <span className="body">Банк принял решение: предложение 2 400 000 ₽</span>
                    <time>11:32</time>
                  </li>
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="clock" />
                    </span>
                    <span className="body">Заявка передана специалисту</span>
                    <time>11:05</time>
                  </li>
                  <li className="kn-feed__item">
                    <span className="kn-feed__ic">
                      <Icon name="arrow-up" />
                    </span>
                    <span className="body">Заявка отправлена</span>
                    <time>10:51</time>
                  </li>
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
