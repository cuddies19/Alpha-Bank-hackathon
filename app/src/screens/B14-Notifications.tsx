// B14 · Уведомления — перенесено из макета «Кредитный кабинет — макет» (B14-Notifications.dc.html)
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import { parseStyle } from '../lib/parseStyle';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const allRead = !!s.allRead;
  const mk = (title, text, time, href, unread) => {
    const u = unread && !allRead;
    return {
      title,
      text,
      time,
      href,
      titleCls: u ? 'body-strong' : 'body',
      style: u ? 'background: var(--surface-muted);' : '',
      dot: u ? '' : 'visibility: hidden;',
    };
  };
  const groups = [
    {
      day: 'Сегодня, 24 октября',
      items: [
        mk(
          'Решение по заявке № 2026-10-0142 готово',
          'Банк предлагает 2 400 000 ₽ на 18 месяцев',
          '11:32',
          '/b9b-counter',
          true,
        ),
        mk(
          'Условия действуют до 31 октября',
          'Примите предложение или откажитесь до этой даты',
          '11:32',
          '/b9b-counter',
          true,
        ),
        mk('Заявка перешла к специалисту', 'Обычно это занимает до часа', '11:05', '/b8-status', false),
        mk('Заявка № 2026-10-0142 отправлена', 'Решение придёт сюда, в кабинет', '10:51', '/b8-status', false),
        mk(
          'Договор поставки нужно заменить',
          'Фото обрезано: не видно страницы с подписью',
          '10:49',
          '/b13-documents',
          false,
        ),
      ],
    },
    {
      day: 'Вчера, 23 октября',
      items: [
        mk(
          'Ассистент заметил возможный кассовый разрыв',
          'Выплата от маркетплейса придёт 6 ноября, а закупка нужна до 1 ноября',
          '18:20',
          '/b1-home',
          false,
        ),
      ],
    },
    {
      day: 'Напоминания',
      items: [mk('Платёж 15 ноября', 'Появится после выдачи кредита — напомним за 3 дня', '—', '/b12-loans', false)],
    },
  ];
  return { groups, unread: allRead ? '0' : '2', readAll: () => setState({ allRead: true }) };
}

export default function B14Notifications() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="none" />
      </div>
      <main className="kn-app__main">
        <HeaderClient unread={v.unread} />
        <div className="kn-page kn-page--narrow" style={{ gap: '24px' }}>
          <div className="kn-sechead" style={{ alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="title-1">Уведомления</h1>
              <p className="body" style={{ color: 'var(--ink-secondary)' }}>
                Все сообщения банка приходят сюда — без писем и SMS.
              </p>
            </div>
            <Button variant="ghost" iconLeft="check" onClick={v.readAll}>
              Отметить все прочитанными
            </Button>
          </div>
          {v.groups.map((g, i) => (
            <section key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 className="label" style={{ color: 'var(--ink-secondary)' }}>
                {g.day}
              </h2>
              <div className="kk-card kk-card--sm" style={{ gap: '4px', padding: '8px' }}>
                {g.items.map((it, j) => (
                  <Link
                    key={j}
                    className="kn-menu__item"
                    to={it.href}
                    style={{ borderRadius: '12px', ...parseStyle(it.style) }}
                  >
                    <span className="kn-dot" style={{ flex: 'none', ...parseStyle(it.dot) }}></span>{' '}
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '0' }}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                        <span className={it.titleCls}>{it.title}</span>{' '}
                        <time className="body-sm" style={{ color: 'var(--ink-secondary)', whiteSpace: 'nowrap' }}>
                          {it.time}
                        </time>
                      </span>{' '}
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        {it.text}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
          <Link className="kk-btn kk-btn--link" to="/b15-profile" style={{ alignSelf: 'flex-start' }}>
            Настроить уведомления в профиле
          </Link>
        </div>
      </main>
    </div>
  );
}
