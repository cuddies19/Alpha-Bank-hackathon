// B3 · Рекомендация · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Offers.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Button, Icon, PaymentLoadMeter, ProductCard } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const n = ' ';
  const low = !!s.low;
  const pay = low ? 157200 : 196500;
  const money = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, n) + n + '₽';
  return {
    flow: 610000,
    pay,
    payAlt: 157000,
    amountFull: money(low ? 2400000 : 3000000),
    params: [
      { label: 'Срок', value: '18' + n + 'мес.' },
      { label: 'Ставка', value: '21,5%' },
      { label: 'Платёж', value: '≈' + n + money(pay) },
    ],
    altParams: [
      { label: 'Срок', value: '24' + n + 'мес.' },
      { label: 'Ставка', value: '22,9%' },
      { label: 'Платёж', value: '≈' + n + money(157000) },
    ],
    reasons: [
      'Выручка приходит волнами раз в 2 недели',
      'За год 5 закупок партиями',
      'Берёте только нужную часть лимита',
    ],
    showTip: !low,
    showBack: low,
    recalc: () => setState({ low: true }),
    reset: () => setState({ low: false }),
  };
}

export default function MOffers() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop mode="flow" title="Варианты" sub="Закупка к распродаже" back="/m-assistant" />
      <div className="kn-mobile__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h1 className="title-1">Варианты под закупку к распродаже</h1>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Около 3 000 000 ₽ · до 1 ноября · возврат из выручки маркетплейсов
          </p>
        </div>
        <ProductCard
          recommended={true}
          name="Кредитная линия"
          purpose="Закупки партиями, деньги нужны многократно"
          amountLabel="Лимит"
          amount={v.amountFull}
          params={v.params}
          reasons={v.reasons}
        >
          <PaymentLoadMeter payment={v.pay} cashFlow={v.flow} />
        </ProductCard>
        {v.showTip ? (
          <>
            <Alert tone="assistant" title="Можно взять меньше и платить комфортно">
              <p>При 2 400 000 ₽ платёж будет 157 200 ₽ — 26% потока.</p>
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
              <p>Платёж 157 200 ₽ — 26% потока, комфортная нагрузка.</p>
              <div style={{ marginTop: '12px' }}>
                <Button variant="ghost" size="sm" onClick={v.reset}>
                  Вернуть 3 000 000 ₽
                </Button>
              </div>
            </Alert>
          </>
        ) : null}
        <ProductCard
          name="Кредит на любые цели"
          purpose="Вся сумма сразу, равные платежи"
          amountLabel="Сумма"
          amount="3 000 000 ₽"
          params={v.altParams}
        >
          <PaymentLoadMeter payment={v.payAlt} cashFlow={v.flow} />
        </ProductCard>
        <section className="kk-card kk-card--sm" style={{ padding: '16px' }}>
          <details className="kn-disc">
            <summary>
              <span className="body-strong">Почему не другой продукт?</span>
              <span className="kn-disc__chev">
                <Icon name="chevron-right" />
              </span>
            </summary>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' }}>
              <li className="body">
                <b>Овердрафт</b> — лимит для вас до 1 200 000 ₽, меньше нужной суммы
              </li>
              <li className="body">
                <b>Кредит на любые цели</b> — разовая выдача, а закупки у вас регулярные
              </li>
            </ul>
          </details>
        </section>
        <section className="kk-card kk-card--sm" style={{ padding: '16px' }}>
          <details className="kn-disc">
            <summary>
              <span className="body-strong">Сравнить продукты</span>
              <span className="kn-disc__chev">
                <Icon name="chevron-right" />
              </span>
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px' }}>
              <div>
                <p className="label" style={{ color: 'var(--ink-secondary)' }}>
                  Кредитная линия
                </p>
                <dl className="kn-rows">
                  <div>
                    <dt>Срок · ставка</dt>
                    <dd>18 мес. · 21,5%</dd>
                  </div>
                  <div>
                    <dt>Деньги частями</dt>
                    <dd>Да</dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="label" style={{ color: 'var(--ink-secondary)' }}>
                  Кредит на любые цели
                </p>
                <dl className="kn-rows">
                  <div>
                    <dt>Срок · ставка</dt>
                    <dd>24 мес. · 22,9%</dd>
                  </div>
                  <div>
                    <dt>Деньги частями</dt>
                    <dd>Нет</dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="label" style={{ color: 'var(--ink-secondary)' }}>
                  Овердрафт
                </p>
                <dl className="kn-rows">
                  <div>
                    <dt>Лимит для вас</dt>
                    <dd>до 1 200 000 ₽</dd>
                  </div>
                  <div>
                    <dt>Срок · ставка</dt>
                    <dd>12 мес. · 23%</dd>
                  </div>
                </dl>
              </div>
            </div>
          </details>
        </section>
        <div style={{ height: '40px' }} aria-hidden="true"></div>
      </div>
      <Link className="kn-demo kn-demo--m" to="/a2-demo" style={{ bottom: '108px' }}>
        <Icon name="shield" size={16} />
        Режим проверки
      </Link>
      <div className="kn-mbar">
        <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/m-step1">
          Оформить заявку
        </Link>
        <p className="caption" style={{ textAlign: 'center', color: 'var(--ink-secondary)', fontWeight: '400' }}>
          Предварительная оценка. Решение принимает банк
        </p>
      </div>
    </div>
  );
}
