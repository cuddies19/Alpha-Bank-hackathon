// B5 · Шаг 1 · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Step1.dc.html)
import { Link } from 'react-router-dom';
import { Chip, Icon, PaymentLoadMeter, Stepper, TextField } from '../ui';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';

function useScreen(): ScreenValues {
  return {
    c0: 0,
    pay: 196500,
    flow: 610000,
    steps: [
      { label: 'Параметры', description: 'Заполнено ассистентом' },
      { label: 'Компания' },
      { label: 'Финансы и документы' },
      { label: 'Проверка и отправка' },
    ],
  };
}

export default function MStep1() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop mode="flow" title="Заявка · шаг 1 из 4" sub="№ 2026-10-0142 · черновик" back="/m-offers" />
      <div className="kn-mobile__body">
        <section className="kk-card kk-card--sm">
          <Stepper steps={v.steps} current={v.c0} />
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '16px', padding: '20px 16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Параметры</h2>
            <span className="kn-tag kn-tag--ai">
              <Icon name="sparkle" size={14} />
              Из подбора
            </span>
          </div>
          <TextField label="Продукт" defaultValue="Кредитная линия" prefilled={true} readOnly={true} />{' '}
          <TextField label="Сумма" format="money" defaultValue="3 000 000" prefilled={true} />{' '}
          <TextField label="Срок" suffix="мес." defaultValue="18" prefilled={true} />{' '}
          <TextField label="Цель" defaultValue="Закупка партии к распродаже 11.11" prefilled={true} />{' '}
          <TextField label="К какой дате нужны деньги" defaultValue="1 ноября 2026" prefilled={true} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="kk-field__top">
              <span className="label">Источник возврата</span>
              <span className="kk-field__tag caption">
                <Icon name="sparkle" size={14} />
                Заполнено ассистентом
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Chip selected={true}>Выручка с маркетплейсов</Chip> <Chip>Оплата по контракту</Chip>{' '}
              <Chip>Текущая выручка</Chip>
            </div>
          </div>
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '12px', padding: '20px 16px' }}>
          <dl className="kn-rows">
            <div>
              <dt>Платёж</dt>
              <dd>≈ 196 500 ₽ в месяц</dd>
            </div>
          </dl>
          <PaymentLoadMeter payment={v.pay} cashFlow={v.flow} />
        </section>
        <p
          className="body-sm"
          style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--ink-secondary)' }}
        >
          <span style={{ color: 'var(--success)' }}>
            <Icon name="check-circle" size={16} />
          </span>
          Черновик сохранён в 10:42
        </p>
        <div style={{ height: '40px' }} aria-hidden="true"></div>
      </div>
      <Link className="kn-demo kn-demo--m" to="/a2-demo" style={{ bottom: '156px' }}>
        <Icon name="shield" size={16} />
        Режим проверки
      </Link>
      <div className="kn-mbar">
        <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/m-step3">
          Продолжить
        </Link>{' '}
        <Link className="kk-btn kk-btn--ghost kk-btn--full" to="/m-offers">
          Назад
        </Link>
      </div>
    </div>
  );
}
