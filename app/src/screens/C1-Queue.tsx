// C1 · Очередь заявок — перенесено из макета «Кредитный кабинет — макет» (C1-Queue.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Chip, Icon } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import { parseStyle } from '../lib/parseStyle';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const f = s.f || 'all';
  const mine = !!s.mine;
  const n = ' ';
  const m = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, n) + n + '₽';
  const all = [
    {
      num: '2026-10-0144',
      company: 'ООО «Велес Логистик»',
      inn: '7705512340',
      product: 'Кредитная линия',
      amount: m(8000000),
      cls: '—',
      classTone: 'neutral',
      rec: 'Нет кредитной истории',
      stage: 'Ручное рассмотрение',
      g: 'manual',
      sla: '1 ч 50 мин',
      slaCls: 'kn-sla',
      tag: 'Источник недоступен',
      tagTone: 'warning',
      tagIcon: 'alert',
      rowCls: 'is-new',
      href: '/c2-checks',
      mine: false,
    },
    {
      num: '2026-10-0142',
      company: 'ООО «Дом и уют»',
      inn: '7701234567',
      product: 'Кредитная линия',
      amount: m(3000000),
      cls: 'B',
      classTone: 'info',
      rec: 'Встречное предложение',
      stage: 'Ручное рассмотрение',
      g: 'manual',
      sla: '1 ч 20 мин',
      slaCls: 'kn-sla',
      tag: '',
      rowCls: '',
      href: '/c2-summary',
      mine: true,
    },
    {
      num: '2026-10-0137',
      company: 'ООО «Пекарня на углу»',
      inn: '7718845120',
      product: 'Кредит на любые цели',
      amount: m(2000000),
      cls: 'C',
      classTone: 'warning',
      rec: 'Встречное предложение',
      stage: 'Ручное рассмотрение',
      g: 'manual',
      sla: '45 мин',
      slaCls: 'kn-sla is-warn',
      tag: 'Повторная подача',
      tagTone: 'neutral',
      tagIcon: false,
      rowCls: '',
      href: '/c2-summary',
      mine: true,
    },
    {
      num: '2026-10-0138',
      company: 'ИП Гарипова Л. Р.',
      inn: '772634509871',
      product: 'Овердрафт',
      amount: m(1200000),
      cls: 'B',
      classTone: 'info',
      rec: 'Одобрить',
      stage: 'Ручное рассмотрение',
      g: 'manual',
      sla: 'просрочено на 12 мин',
      slaCls: 'kn-sla is-late',
      tag: '',
      rowCls: '',
      href: '/c2-summary',
      mine: false,
    },
    {
      num: '2026-10-0141',
      company: 'ООО «Лён и Дуб»',
      inn: '7703345678',
      product: 'Кредит на любые цели',
      amount: m(4500000),
      cls: 'C',
      classTone: 'warning',
      rec: 'Запросить данные',
      stage: 'Ждёт клиента',
      g: 'client',
      sla: 'пауза до 30 окт.',
      slaCls: 'kn-sla',
      tag: '',
      rowCls: '',
      href: '/c2-docs',
      mine: true,
    },
    {
      num: '2026-10-0140',
      company: 'ИП Фомин С. В.',
      inn: '770498765432',
      product: 'Кредит на любые цели',
      amount: m(1500000),
      cls: 'E',
      classTone: 'danger',
      rec: 'Отказать',
      stage: 'Решение принято',
      g: 'decided',
      sla: '—',
      slaCls: 'kn-sla',
      tag: 'Авторешение',
      tagTone: 'neutral',
      tagIcon: false,
      rowCls: 'is-muted',
      href: '/c6-audit',
      mine: false,
    },
    {
      num: '2026-10-0139',
      company: 'ИП Белова А. С.',
      inn: '770212345678',
      product: 'Овердрафт',
      amount: m(500000),
      cls: 'A',
      classTone: 'success',
      rec: 'Одобрить',
      stage: 'Решение принято',
      g: 'decided',
      sla: '—',
      slaCls: 'kn-sla',
      tag: 'Авторешение',
      tagTone: 'neutral',
      tagIcon: false,
      rowCls: 'is-muted',
      href: '/c6-audit',
      mine: false,
    },
  ];
  const groups = [
    ['new', 'Новые', 0],
    ['pipeline', 'В конвейере', 2],
    ['manual', 'Ручное рассмотрение', 4],
    ['client', 'Ждут клиента', 9],
    ['decided', 'Решение принято сегодня', 14],
  ];
  const rows = all
    .filter((r) => (f === 'all' || r.g === f) && (!mine || r.mine))
    .map((r) => ({ ...r, hasTag: !!r.tag }));
  return {
    mine,
    counters: groups.map(([k, label, cnt]) => ({
      label,
      n: String(cnt),
      cls: '',
      pressed: f === k ? 'true' : 'false',
      ring: f === k ? 'box-shadow: inset 0 0 0 2px var(--ink);' : '',
      pick: () => setState({ f: f === k ? 'all' : k }),
    })),
    rows,
    hasRows: rows.length > 0,
    noRows: rows.length === 0,
    shown: String(rows.length),
    toggleMine: () => setState({ mine: !mine }),
    showAll: () => setState({ f: 'all', mine: false }),
  };
}

export default function C1Queue() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="queue" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <div className="kn-page" style={{ gap: '24px' }}>
          <div className="kn-sechead" style={{ alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 className="title-1">Очередь заявок</h1>
              <p className="body" style={{ color: 'var(--ink-secondary)' }}>
                24 октября, 11:20 · обновляется автоматически
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {v.counters.map((c, i) => (
              <button
                key={i}
                type="button"
                className={c.cls}
                aria-pressed={c.pressed}
                onClick={c.pick}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  padding: '16px',
                  border: '0',
                  borderRadius: '16px',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  ...parseStyle(c.ring),
                }}
              >
                <span className="amount-lg amt">{c.n}</span>{' '}
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
          <div className="kn-toolbar">
            <button type="button" className="kn-select">
              Продукт: <span>все</span>
              <Icon name="chevron-right" size={16} style={{ transform: 'rotate(90deg)' }} />
            </button>{' '}
            <button type="button" className="kn-select">
              Сумма: <span>любая</span>
              <Icon name="chevron-right" size={16} style={{ transform: 'rotate(90deg)' }} />
            </button>{' '}
            <button type="button" className="kn-select">
              Класс риска: <span>A–E</span>
              <Icon name="chevron-right" size={16} style={{ transform: 'rotate(90deg)' }} />
            </button>{' '}
            <Chip selected={v.mine} onClick={v.toggleMine}>
              Мои заявки
            </Chip>{' '}
            <span style={{ flex: '1' }}></span>{' '}
            <label className="kn-search" style={{ flex: '0 1 300px', height: '36px', borderRadius: '8px' }}>
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
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L21 21" />
              </svg>{' '}
              <span className="kk-sr">Поиск в очереди</span>{' '}
              <input type="search" placeholder="ИНН или номер заявки" style={{ fontSize: '13px' }} />
            </label>
          </div>
          {v.hasRows ? (
            <>
              <div className="kn-tablewrap">
                <table className="kn-table kn-table--dense">
                  <thead>
                    <tr>
                      <th scope="col">
                        <button type="button" className="kn-sort">
                          Заявка
                        </button>
                      </th>
                      <th scope="col">Компания</th>
                      <th scope="col">Продукт</th>
                      <th scope="col" className="num">
                        <button type="button" className="kn-sort">
                          Сумма
                        </button>
                      </th>
                      <th scope="col">Класс</th>
                      <th scope="col">Рекомендация системы</th>
                      <th scope="col">Этап</th>
                      <th scope="col">
                        <button type="button" className="kn-sort is-on" aria-label="SLA, по возрастанию">
                          SLA
                          <Icon name="arrow-up" size={14} />
                        </button>
                      </th>
                      <th scope="col">Метки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.rows.map((r, i) => (
                      <tr key={i} className={r.rowCls}>
                        <td className="nw">
                          <Link className="kn-rowlink" to={r.href}>
                            {r.num}
                          </Link>
                        </td>
                        <td>
                          <span className="body-strong" style={{ display: 'block' }}>
                            {r.company}
                          </span>
                          <span className="kn-sub">ИНН {r.inn}</span>
                        </td>
                        <td>{r.product}</td>
                        <td className="num">{r.amount}</td>
                        <td>
                          <Badge tone={r.classTone} icon={false}>
                            {r.cls}
                          </Badge>
                        </td>
                        <td>{r.rec}</td>
                        <td className="nw">{r.stage}</td>
                        <td>
                          <span className={r.slaCls}>
                            <Icon name="clock" size={14} />
                            {r.sla}
                          </span>
                        </td>
                        <td>
                          {r.hasTag ? (
                            <>
                              <Badge tone={r.tagTone} icon={r.tagIcon}>
                                {r.tag}
                              </Badge>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="kn-pager">
                  <span>Показаны 1–{v.shown} из 30</span>
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
                    <button type="button" className="kn-pager__btn">
                      3
                    </button>{' '}
                    <button type="button" className="kn-pager__btn">
                      4
                    </button>{' '}
                    <button type="button" className="kn-pager__btn" aria-label="Следующая страница">
                      ›
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {v.noRows ? (
            <>
              <section className="kk-card kk-card--md">
                <div className="kn-empty">
                  <span className="kn-empty__ic">
                    <Icon name="check-circle" size={24} />
                  </span>
                  <h2 className="title-3">Очередь разобрана</h2>
                  <p className="body">На этом этапе заявок нет. Новые появятся здесь автоматически.</p>
                  <Button variant="secondary" onClick={v.showAll}>
                    Показать все заявки
                  </Button>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
