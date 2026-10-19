// C6 · Журнал аудита — перенесено из макета «Кредитный кабинет — макет» (C6-Audit.dc.html)
import { Button, Chip } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const f = s.f || 'all';
  const all = [
    {
      t: '11:32:08',
      who: 'О. Кравцова',
      role: 'Сотрудник',
      k: 'staff',
      app: '2026-10-0142',
      action: 'Решение принято',
      change: 'Ручное рассмотрение → Встречное предложение',
    },
    {
      t: '11:31:40',
      who: 'О. Кравцова',
      role: 'Сотрудник',
      k: 'staff',
      app: '2026-10-0142',
      action: 'Изменены условия',
      change: '3 000 000 ₽ → 2 400 000 ₽, 18 мес.',
    },
    {
      t: '11:24:51',
      who: 'О. Кравцова',
      role: 'Сотрудник',
      k: 'staff',
      app: '2026-10-0142',
      action: 'Просмотр паспортных данных',
      change: '45 •• ••••12 · причина: проверка руководителя',
    },
    {
      t: '11:20:12',
      who: 'О. Кравцова',
      role: 'Сотрудник',
      k: 'staff',
      app: '2026-10-0142',
      action: 'Взята в работу',
      change: '— → О. Кравцова',
    },
    {
      t: '11:18:55',
      who: 'Система',
      role: 'Конвейер',
      k: 'system',
      app: '2026-10-0144',
      action: 'Источник не ответил',
      change: 'БКИ: 3 попытки по 10 с → ручная проверка',
    },
    {
      t: '11:05:31',
      who: 'Система',
      role: 'Конвейер',
      k: 'system',
      app: '2026-10-0142',
      action: 'Передана на ручное рассмотрение',
      change: 'Оценка → Ручное рассмотрение',
    },
    {
      t: '11:05:29',
      who: 'Система',
      role: 'Скоринг',
      k: 'system',
      app: '2026-10-0142',
      action: 'Расчёт балла',
      change: '— → 640, класс B',
    },
    {
      t: '11:02:17',
      who: 'Система',
      role: 'Мониторинг',
      k: 'system',
      app: '—',
      action: 'Сбой источника',
      change: 'БКИ: работает → не отвечает',
    },
    {
      t: '10:58:04',
      who: 'Система',
      role: 'Интеграции',
      k: 'system',
      app: '2026-10-0142',
      action: 'Запрос в БКИ',
      change: 'Ответ за 1,4 с',
    },
    {
      t: '10:51:14',
      who: 'И. Соколов',
      role: 'Клиент',
      k: 'client',
      app: '2026-10-0142',
      action: 'Заявка отправлена',
      change: 'Черновик → Подана',
    },
    {
      t: '10:50:02',
      who: 'И. Соколов',
      role: 'Клиент',
      k: 'client',
      app: '2026-10-0142',
      action: 'Дано согласие на запрос в БКИ',
      change: '— → действует до 24 апреля 2027',
    },
    {
      t: '10:31:22',
      who: 'Система',
      role: 'Конвейер',
      k: 'system',
      app: '2026-10-0139',
      action: 'Авторешение',
      change: 'Оценка → Одобрено',
    },
    {
      t: '10:12:45',
      who: 'Система',
      role: 'Правила',
      k: 'system',
      app: '2026-10-0140',
      action: 'Стоп-правило',
      change: 'Оценка → Отказ: просрочка больше 60 дней',
    },
  ];
  const rows = all.filter((r) => f === 'all' || r.k === f);
  const opts = [
    ['all', 'Все'],
    ['system', 'Система'],
    ['staff', 'Сотрудник'],
    ['client', 'Клиент'],
  ];
  return {
    rows,
    count: String(rows.length),
    actors: opts.map(([k, label]) => ({ label, sel: f === k, pick: () => setState({ f: k }) })),
  };
}

export default function C6Audit() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="audit" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <div className="kn-page" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="title-1">Журнал аудита</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              Каждое действие системы, сотрудника и клиента. Персональные данные скрыты.
            </p>
          </div>
          <div className="kn-toolbar">
            <button type="button" className="kn-select">
              Заявка: <span>все</span>
            </button>{' '}
            <button type="button" className="kn-select">
              Тип события: <span>все</span>
            </button>{' '}
            <span style={{ width: '8px' }}></span>{' '}
            <span className="label" style={{ color: 'var(--ink-secondary)' }}>
              Участник
            </span>
            {v.actors.map((a, i) => (
              <Chip key={i} selected={a.sel} onClick={a.pick}>
                {a.label}
              </Chip>
            ))}
            <span style={{ flex: '1' }}></span>{' '}
            <Button variant="secondary" size="sm" iconLeft="arrow-down">
              Выгрузить CSV
            </Button>
          </div>
          <div className="kn-tablewrap">
            <table className="kn-table kn-table--dense">
              <thead>
                <tr>
                  <th scope="col">Время</th>
                  <th scope="col">Кто</th>
                  <th scope="col">Заявка</th>
                  <th scope="col">Действие</th>
                  <th scope="col">Было → стало</th>
                </tr>
              </thead>
              <tbody>
                {v.rows.map((r, i) => (
                  <tr key={i}>
                    <td className="nw" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {r.t}
                    </td>
                    <td className="nw">
                      <span style={{ display: 'block' }}>{r.who}</span>
                      <span className="kn-sub">{r.role}</span>
                    </td>
                    <td className="nw">{r.app}</td>
                    <td>{r.action}</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>{r.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="kn-pager">
              <span>{v.count} событий за 24 октября</span>
              <div className="kn-pager__btns">
                <button type="button" className="kn-pager__btn" disabled aria-label="Предыдущая страница">
                  ‹
                </button>{' '}
                <button type="button" className="kn-pager__btn is-on" aria-current="page">
                  1
                </button>{' '}
                <button type="button" className="kn-pager__btn">
                  2
                </button>{' '}
                <button type="button" className="kn-pager__btn" aria-label="Следующая страница">
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
