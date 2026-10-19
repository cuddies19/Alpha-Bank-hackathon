// B3 · Рекомендация и калькулятор — перенесено из макета «Кредитный кабинет — макет» (B3-Offers.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Button, Icon, PaymentLoadMeter, ProductCard } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const n = ' ';
  const money = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, n);
  const amount = s.amount ?? 3000000;
  const term = s.term ?? 18;
  const r = 21.5 / 1200;
  const pay = Math.round((amount * r) / (1 - Math.pow(1 + r, -term)) / 100) * 100;
  const over = pay * term - amount;
  const flow = 610000;
  const termWord = 'мес.';
  return {
    amount,
    term,
    flow,
    pay,
    payAlt: 157000,
    amountFull: money(amount) + n + '₽',
    payFull: money(pay) + n + '₽',
    overFull: money(over) + n + '₽',
    termText: term + n + termWord,
    share: Math.round((pay / flow) * 100),
    amountPct: (((amount - 500000) / 4500000) * 100).toFixed(1) + '%',
    termPct: (((term - 6) / 30) * 100).toFixed(1) + '%',
    recParams: [
      { label: 'Срок', value: term + n + termWord },
      { label: 'Ставка', value: '21,5%' },
      { label: 'Платёж', value: '≈' + n + money(pay) + n + '₽' },
    ],
    altParams: [
      { label: 'Срок', value: '24' + n + termWord },
      { label: 'Ставка', value: '22,9%' },
      { label: 'Платёж', value: '≈' + n + '157' + n + '000' + n + '₽' },
    ],
    showTip: amount !== 2400000,
    showBack: amount === 2400000,
    recalc: () => setState({ amount: 2400000 }),
    reset: () => setState({ amount: 3000000 }),
    onAmount: (e) => setState({ amount: Number(e.target.value) }),
    onTerm: (e) => setState({ term: Number(e.target.value) }),
  };
}

export default function B3Offers() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="financing" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link
              className="kk-btn kk-btn--link"
              to="/b2-dialog"
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
              Изменить задачу
            </Link>
            <h1 className="title-1">Варианты под закупку к распродаже</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              Закупка партии к 11.11 · около <span className="amt">3 000 000 ₽</span> · деньги нужны до 1 ноября ·
              возврат из выручки маркетплейсов
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(440px, 100%), 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ProductCard
                recommended={true}
                name="Кредитная линия"
                purpose="Закупки партиями, деньги нужны многократно"
                amountLabel="Лимит"
                amount={v.amountFull}
                params={v.recParams}
                preliminary={false}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <PaymentLoadMeter payment={v.pay} cashFlow={v.flow} />
                  <div className="kk-product__reasons">
                    <p className="body-strong">Почему подходит</p>
                    <ul>
                      <li className="body">
                        <Icon name="check" />
                        Выручка приходит волнами раз в 2 недели
                      </li>
                      <li className="body">
                        <Icon name="check" />
                        За год 5 закупок партиями
                      </li>
                      <li className="body">
                        <Icon name="check" />
                        Берёте только нужную часть лимита — проценты только на неё
                      </li>
                    </ul>
                  </div>
                  <p className="kk-product__note body-sm">
                    <Icon name="info" size={16} />
                    Предварительная оценка по данным вашего счёта. Решение принимает банк.
                  </p>
                  <div className="kk-product__actions">
                    <Link className="kk-btn kk-btn--primary" to="/b5-step1">
                      Оформить заявку
                    </Link>{' '}
                    <a className="kk-btn kk-btn--ghost" href="#compare">
                      Сравнить продукты
                    </a>
                  </div>
                </div>
              </ProductCard>
              {v.showTip ? (
                <>
                  <Alert tone="assistant" title="Можно взять меньше и платить комфортно">
                    <p>
                      При 2 400 000 ₽ платёж будет 157 200 ₽ — 26% потока, комфортная нагрузка. Разницу можно добрать из
                      лимита позже.
                    </p>
                    <div style={{ marginTop: '12px' }}>
                      <Button variant="secondary" size="sm" onClick={v.recalc}>
                        Пересчитать на 2 400 000 ₽
                      </Button>
                    </div>
                  </Alert>
                </>
              ) : null}
              {v.showBack ? (
                <>
                  <Alert tone="assistant" title="Сумма пересчитана">
                    <p>
                      Платёж {v.payFull} — {v.share}% потока. Если партия всё же дороже, верните исходную сумму.
                    </p>
                    <div style={{ marginTop: '12px' }}>
                      <Button variant="ghost" size="sm" onClick={v.reset}>
                        Вернуть 3 000 000 ₽
                      </Button>
                    </div>
                  </Alert>
                </>
              ) : null}
            </div>
            <ProductCard
              name="Кредит на любые цели"
              purpose="Вся сумма сразу, равные платежи"
              amountLabel="Сумма"
              amount="3 000 000 ₽"
              params={v.altParams}
              preliminary={false}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <PaymentLoadMeter payment={v.payAlt} cashFlow={v.flow} />
                <div className="kk-product__reasons">
                  <p className="body-strong">Когда выбрать</p>
                  <ul>
                    <li className="body">
                      <Icon name="check" />
                      Закупка разовая, повторять не планируете
                    </li>
                    <li className="body">
                      <Icon name="check" />
                      Платёж ниже за счёт срока 24 месяца
                    </li>
                  </ul>
                </div>
                <p className="kk-product__note body-sm">
                  <Icon name="info" size={16} />
                  Предварительная оценка по данным вашего счёта. Решение принимает банк.
                </p>
                <div className="kk-product__actions">
                  <Link className="kk-btn kk-btn--ghost" to="/b5-step1">
                    Выбрать этот вариант
                  </Link>
                </div>
              </div>
            </ProductCard>
          </div>
          <section className="kk-card kk-card--md">
            <details className="kn-disc" open>
              <summary>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="title-3">Калькулятор кредитной линии</span>{' '}
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    Двигайте сумму и срок — платёж и нагрузка пересчитаются сразу
                  </span>
                </span>{' '}
                <span className="kn-disc__chev">
                  <Icon name="chevron-right" />
                </span>
              </summary>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                  gap: '32px',
                  paddingTop: '24px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="kn-slider">
                    <div className="kn-slider__head">
                      <label className="label" htmlFor="calc-amount">
                        Сумма
                      </label>
                      <span className="amount-md amt">{v.amountFull}</span>
                    </div>
                    <div className="kn-slider__track">
                      <div className="kn-slider__fill" style={{ width: v.amountPct }}></div>
                      <input
                        className="kn-slider__input"
                        id="calc-amount"
                        type="range"
                        min="500000"
                        max="5000000"
                        step="100000"
                        value={v.amount}
                        onChange={v.onAmount}
                        aria-valuetext={v.amountFull}
                      />
                      <div className="kn-slider__thumb" style={{ left: v.amountPct }}></div>
                    </div>
                    <div className="kn-slider__scale">
                      <span>500 000 ₽</span>
                      <span>5 000 000 ₽</span>
                    </div>
                  </div>
                  <div className="kn-slider">
                    <div className="kn-slider__head">
                      <label className="label" htmlFor="calc-term">
                        Срок
                      </label>
                      <span className="amount-md amt">{v.termText}</span>
                    </div>
                    <div className="kn-slider__track">
                      <div className="kn-slider__fill" style={{ width: v.termPct }}></div>
                      <input
                        className="kn-slider__input"
                        id="calc-term"
                        type="range"
                        min="6"
                        max="36"
                        step="1"
                        value={v.term}
                        onChange={v.onTerm}
                        aria-valuetext={v.termText}
                      />
                      <div className="kn-slider__thumb" style={{ left: v.termPct }}></div>
                    </div>
                    <div className="kn-slider__scale">
                      <span>6 мес.</span>
                      <span>36 мес.</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <dl className="kn-kv">
                    <div>
                      <dt>Платёж в месяц</dt>
                      <dd className="amount-lg amt">{v.payFull}</dd>
                    </div>
                    <div>
                      <dt>Переплата за срок</dt>
                      <dd className="amount-lg amt">{v.overFull}</dd>
                    </div>
                    <div>
                      <dt>Ставка</dt>
                      <dd className="amount-lg amt">21,5%</dd>
                    </div>
                  </dl>
                  <PaymentLoadMeter payment={v.pay} cashFlow={v.flow} />
                </div>
              </div>
            </details>
          </section>
          <section className="kk-card kk-card--md">
            <details className="kn-disc">
              <summary>
                <span className="title-3">Почему не другой продукт?</span>{' '}
                <span className="kn-disc__chev">
                  <Icon name="chevron-right" />
                </span>
              </summary>
              <dl className="kn-rows" style={{ paddingTop: '12px' }}>
                <div>
                  <dt>Овердрафт</dt>
                  <dd style={{ fontWeight: '400', textAlign: 'right' }}>
                    Лимит для вас до 1 200 000 ₽ — меньше нужной суммы
                  </dd>
                </div>
                <div>
                  <dt>Кредит на любые цели</dt>
                  <dd style={{ fontWeight: '400', textAlign: 'right' }}>Разовая выдача, а закупки у вас регулярные</dd>
                </div>
              </dl>
            </details>
          </section>
          <section id="compare" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="title-2">Сравнить продукты</h2>
            <div className="kn-tablewrap">
              <table className="kn-table kn-table--plain">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="kk-sr">Параметр</span>
                    </th>
                    <th scope="col">Кредитная линия</th>
                    <th scope="col">Кредит на любые цели</th>
                    <th scope="col">Овердрафт</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th
                      scope="row"
                      className="body"
                      style={{ color: 'var(--ink-secondary)', borderBottom: '1px solid var(--line)' }}
                    >
                      Лимит для вас
                    </th>
                    <td className="nw">3 000 000 ₽</td>
                    <td className="nw">3 000 000 ₽</td>
                    <td className="nw">до 1 200 000 ₽</td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="body"
                      style={{ color: 'var(--ink-secondary)', borderBottom: '1px solid var(--line)' }}
                    >
                      Срок
                    </th>
                    <td>18 мес.</td>
                    <td>24 мес.</td>
                    <td>12 мес.</td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="body"
                      style={{ color: 'var(--ink-secondary)', borderBottom: '1px solid var(--line)' }}
                    >
                      Ставка
                    </th>
                    <td>21,5%</td>
                    <td>22,9%</td>
                    <td>23%</td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="body"
                      style={{ color: 'var(--ink-secondary)', borderBottom: '1px solid var(--line)' }}
                    >
                      Платёж
                    </th>
                    <td className="nw">≈ 196 500 ₽</td>
                    <td className="nw">≈ 157 000 ₽</td>
                    <td>гасится из поступлений</td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="body"
                      style={{ color: 'var(--ink-secondary)', borderBottom: '1px solid var(--line)' }}
                    >
                      Деньги частями
                    </th>
                    <td>Да, в пределах лимита</td>
                    <td>Нет, вся сумма сразу</td>
                    <td>Да, в пределах лимита</td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="body"
                      style={{ color: 'var(--ink-secondary)', borderBottom: '1px solid var(--line)' }}
                    >
                      Скорость решения
                    </th>
                    <td>обычно до 2 часов</td>
                    <td>обычно до 2 часов</td>
                    <td>обычно до 30 минут</td>
                  </tr>
                  <tr>
                    <th scope="row" className="body" style={{ color: 'var(--ink-secondary)' }}>
                      Залог
                    </th>
                    <td>Не нужен</td>
                    <td>Не нужен</td>
                    <td>Не нужен</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Условия — предварительная оценка по данным вашего счёта. Решение принимает банк.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
