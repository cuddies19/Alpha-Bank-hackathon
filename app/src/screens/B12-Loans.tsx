// B12 · Мои кредиты — перенесено из макета «Кредитный кабинет — макет» (B12-Loans.dc.html)
import { Alert, Badge, Button } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const n = ' ';
  const money = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, n) + n + '₽';
  const names = [
    'ноября',
    'декабря',
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
  ];
  const P = 2400000,
    r = 21.5 / 1200,
    N = 18;
  const pay = Math.round((P * r) / (1 - Math.pow(1 + r, -N)) / 100) * 100;
  let rest = P;
  const all: ScreenValues[] = [];
  for (let i = 0; i < N; i++) {
    const interest = rest * r;
    const principal = i === N - 1 ? rest : pay - interest;
    rest = Math.max(0, rest - principal);
    const year = 2026 + Math.floor((i + 10) / 12);
    all.push({
      i: String(i + 1),
      date: '15 ' + names[i % 12] + ' ' + year,
      pay: money(principal + interest),
      principal: money(principal),
      interest: money(interest),
      rest: money(rest),
      status: i === 0 ? 'Ближайший' : 'По графику',
      tone: i === 0 ? 'info' : 'neutral',
      icon: i === 0 ? 'calendar' : false,
    });
  }
  const full = !!s.full;
  return {
    rows: full ? all : all.slice(0, 6),
    toggleText: full ? 'Свернуть график' : 'Показать все 18 платежей',
    toggle: () => setState({ full: !full }),
  };
}

export default function B12Loans() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="loans" appsCount="0" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page" style={{ gap: '24px' }}>
          <h1 className="title-1">Мои кредиты</h1>
          <Alert tone="assistant" title="Платёж 15 декабря выпадает на кассовый разрыв">
            <p>
              Выплата от маркетплейса ожидается 18 декабря. Можно внести часть платежа заранее — после распродажи 11.11.
            </p>
            <div style={{ marginTop: '12px' }}>
              <Button variant="secondary" size="sm">
                Внести досрочно
              </Button>
            </div>
          </Alert>
          <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
            <div className="kn-sechead">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h2 className="title-3">Кредитная линия</h2>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Договор № 2026-10-0142-Д от 24 октября · 21,5% · до 15 апреля 2028
                </span>
              </div>
              <Badge tone="success">Действует</Badge>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                  Остаток долга
                </span>{' '}
                <span className="amount-xl amt">2 400 000 ₽</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                  Ближайший платёж
                </span>{' '}
                <span className="amount-lg amt">157 200 ₽</span>{' '}
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  15 ноября, через 22 дня
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                  Погашено
                </span>
                <div
                  className="kn-progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={18}
                  aria-valuenow={0}
                  aria-label="Погашено 0 из 18 платежей"
                >
                  <span style={{ width: '0%' }}></span>
                </div>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  0 из 18 платежей
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--line)',
              }}
            >
              <h3 className="body-strong">График платежей</h3>
              <div className="kn-tablewrap" style={{ borderRadius: '0' }}>
                <table className="kn-table kn-table--dense">
                  <thead>
                    <tr>
                      <th scope="col">№</th>
                      <th scope="col">Дата</th>
                      <th scope="col" className="num">
                        Платёж
                      </th>
                      <th scope="col" className="num">
                        Основной долг
                      </th>
                      <th scope="col" className="num">
                        Проценты
                      </th>
                      <th scope="col" className="num">
                        Остаток
                      </th>
                      <th scope="col">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.rows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.i}</td>
                        <td className="nw">{r.date}</td>
                        <td className="num">{r.pay}</td>
                        <td className="num">{r.principal}</td>
                        <td className="num">{r.interest}</td>
                        <td className="num">{r.rest}</td>
                        <td>
                          <Badge tone={r.tone} icon={r.icon}>
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="ghost" iconRight="chevron-right" onClick={v.toggle} style={{ alignSelf: 'flex-start' }}>
                {v.toggleText}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
