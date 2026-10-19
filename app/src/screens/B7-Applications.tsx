// B7 · Мои заявки — перенесено из макета «Кредитный кабинет — макет» (B7-Applications.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Icon } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const f = s.f || 'active';
  const n = ' ';
  const data = {
    active: [
      {
        num: '№' + n + '2026-10-0142',
        product: 'Кредитная линия',
        amount: '3' + n + '000' + n + '000' + n + '₽',
        date: '24 октября',
        status: 'Рассматривает специалист',
        tone: 'info',
        todo: 'Ничего — ждём решение банка',
        href: '/b8-status',
      },
    ],
    drafts: [
      {
        num: '№' + n + '2026-10-0097',
        product: 'Кредит на любые цели',
        amount: '1' + n + '000' + n + '000' + n + '₽',
        date: '—',
        status: 'Черновик',
        tone: 'neutral',
        todo: 'Заполнить шаг 3 и отправить',
        href: '/b5-step3',
      },
    ],
    done: [],
  };
  const labels = [
    ['active', 'Активные'],
    ['drafts', 'Черновики'],
    ['done', 'Завершённые'],
  ];
  const rows = data[f];
  return {
    tabs: labels.map(([k, label]) => ({
      label,
      count: String(data[k].length),
      cls: 'kn-tab' + (f === k ? ' is-active' : ''),
      pressed: f === k ? 'true' : 'false',
      pick: () => setState({ f: k }),
    })),
    rows,
    hasRows: rows.length > 0,
    noRows: rows.length === 0,
  };
}

export default function B7Applications() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page" style={{ gap: '24px' }}>
          <div className="kn-sechead" style={{ alignItems: 'flex-end' }}>
            <h1 className="title-1">Мои заявки</h1>
            <Link className="kk-btn kk-btn--primary" to="/b2-need">
              Подобрать финансирование
            </Link>
          </div>
          <div className="kn-tabs" role="group" aria-label="Фильтр заявок">
            {v.tabs.map((t, i) => (
              <button key={i} type="button" className={t.cls} aria-pressed={t.pressed} onClick={t.pick}>
                {t.label}
                <span className="kn-nav__count">{t.count}</span>
              </button>
            ))}
          </div>
          {v.hasRows ? (
            <>
              <div className="kn-tablewrap">
                <table className="kn-table">
                  <thead>
                    <tr>
                      <th scope="col">Номер</th>
                      <th scope="col">Продукт</th>
                      <th scope="col" className="num">
                        Сумма
                      </th>
                      <th scope="col">Подана</th>
                      <th scope="col">Статус</th>
                      <th scope="col">Что от вас нужно</th>
                      <th scope="col">
                        <span className="kk-sr">Открыть</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.rows.map((r, i) => (
                      <tr key={i}>
                        <td className="nw">
                          <Link className="kn-rowlink" to={r.href}>
                            {r.num}
                          </Link>
                        </td>
                        <td>{r.product}</td>
                        <td className="num">{r.amount}</td>
                        <td className="nw">{r.date}</td>
                        <td>
                          <Badge tone={r.tone}>{r.status}</Badge>
                        </td>
                        <td style={{ color: 'var(--ink-secondary)' }}>{r.todo}</td>
                        <td style={{ width: '44px' }}>
                          <Link className="kn-ibtn" to={r.href} aria-label={`Открыть заявку ${r.num}`}>
                            <Icon name="chevron-right" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
          {v.noRows ? (
            <>
              <section className="kk-card kk-card--md">
                <div className="kn-empty">
                  <span className="kn-empty__ic">
                    <Icon name="document" size={24} />
                  </span>
                  <h2 className="title-3">Завершённых заявок пока нет</h2>
                  <p className="body">Здесь появятся заявки, по которым выданы деньги или работа закончена.</p>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
