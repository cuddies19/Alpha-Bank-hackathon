// B9a · Одобрено — перенесено из макета «Кредитный кабинет — макет» (B9a-Approved.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon, PaymentLoadMeter } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const n = ' ';
  const money = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, n) + n + '₽';
  const months = [
    '15 ноября 2026',
    '15 декабря 2026',
    '15 января 2027',
    '15 февраля 2027',
    '15 марта 2027',
    '15 апреля 2027',
    '15 мая 2027',
    '15 июня 2027',
    '15 июля 2027',
    '15 августа 2027',
    '15 сентября 2027',
    '15 октября 2027',
  ];
  const P = 500000,
    r = 23 / 1200,
    N = 12;
  const pay = (P * r) / (1 - Math.pow(1 + r, -N));
  let rest = P;
  const all = months.map((d, i) => {
    const interest = rest * r;
    const principal = i === N - 1 ? rest : pay - interest;
    rest = Math.max(0, rest - principal);
    return {
      i: String(i + 1),
      date: d,
      pay: money(principal + interest),
      principal: money(principal),
      interest: money(interest),
      rest: money(rest),
    };
  });
  const full = !!s.full;
  return {
    pay: 47000,
    flow: 420000,
    rows: full ? all : all.slice(0, 3),
    toggleText: full ? 'Свернуть график' : 'Показать весь график, 12 платежей',
    toggle: () => setState({ full: !full }),
  };
}

export default function B9aApproved() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main">
        <HeaderClient company="ИП Белова А. С." person="Анна Белова" initials="АБ" unread="1" />
        <div className="kn-page kn-page--narrow" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Badge tone="success">Одобрено</Badge>{' '}
              <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                Заявка № 2026-10-0139 · решение принято автоматически 24 октября, 10:31
              </span>
            </div>
            <h1 className="display">Банк одобрил овердрафт</h1>
          </div>
          <section className="kk-card kk-card--lg" style={{ gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                Лимит
              </span>{' '}
              <span className="amount-xl amt">500 000 ₽</span>
            </div>
            <dl
              className="kn-kv"
              style={{ padding: '16px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
            >
              <div>
                <dt>Срок</dt>
                <dd className="amount-md">12 мес.</dd>
              </div>
              <div>
                <dt>Ставка</dt>
                <dd className="amount-md">23%</dd>
              </div>
              <div>
                <dt>Платёж</dt>
                <dd className="amount-md amt">≈ 47 000 ₽</dd>
              </div>
              <div>
                <dt>Первый платёж</dt>
                <dd className="amount-md">15 ноября</dd>
              </div>
            </dl>
            <PaymentLoadMeter payment={v.pay} cashFlow={v.flow} />
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <Link className="kk-btn kk-btn--primary kk-btn--lg" to="/b10-sign">
                Принять условия
              </Link>{' '}
              <span
                className="body-sm"
                style={{ color: 'var(--ink-secondary)', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
              >
                <Icon name="calendar" size={16} />
                Условия действуют до 31 октября
              </span>
            </div>
          </section>
          <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
            <h2 className="title-3">График платежей</h2>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="ghost" iconRight="chevron-right" onClick={v.toggle} style={{ alignSelf: 'flex-start' }}>
              {v.toggleText}
            </Button>
          </section>
          <section className="kk-card kk-card--md">
            <details className="kn-disc">
              <summary>
                <span className="title-3">Почему такое решение</span>
                <span className="kn-disc__chev">
                  <Icon name="chevron-right" />
                </span>
              </summary>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--success)' }}>
                    <Icon name="check-circle" />
                  </span>
                  Поступления по счёту стабильны 4 года, обе кофейни приносят выручку каждый день
                </li>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--success)' }}>
                    <Icon name="check-circle" />
                  </span>
                  В кредитной истории нет просрочек
                </li>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--success)' }}>
                    <Icon name="check-circle" />
                  </span>
                  Платёж займёт 11% денежного потока — это комфортная нагрузка
                </li>
              </ul>
            </details>
          </section>
        </div>
      </main>
    </div>
  );
}
