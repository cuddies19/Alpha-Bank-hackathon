// B5 · Шаг 1. Параметры — перенесено из макета «Кредитный кабинет — макет» (B5-Step1.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Chip, Icon, PaymentLoadMeter, Stepper, TextField } from '../ui';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  return {
    c0: 0,
    pay: 196500,
    flow: 610000,
    steps: [
      { label: 'Параметры', description: 'Заполнено ассистентом' },
      { label: 'Компания', description: 'Из ЕГРЮЛ' },
      { label: 'Финансы и документы', description: 'Из выписки по счёту' },
      { label: 'Проверка и отправка' },
    ],
  };
}

export default function B5Step1() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="title-1">Заявка на кредитную линию</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              № 2026-10-0142 · черновик
            </p>
          </div>
          <section className="kk-card kk-card--md">
            <Stepper steps={v.steps} current={v.c0} />
          </section>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Параметры</h2>
                  <span className="kn-tag kn-tag--ai">
                    <Icon name="sparkle" size={14} />
                    Перенесено из подбора
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                    gap: '20px',
                  }}
                >
                  <TextField
                    label="Продукт"
                    defaultValue="Кредитная линия"
                    prefilled={true}
                    readOnly={true}
                    hint="Сменить продукт можно на экране вариантов"
                  />{' '}
                  <TextField
                    label="Сумма"
                    format="money"
                    defaultValue="3 000 000"
                    prefilled={true}
                    hint="Лимит кредитной линии — от 500 000 до 30 000 000 ₽"
                  />{' '}
                  <TextField label="Срок" suffix="мес." defaultValue="18" prefilled={true} hint="До 36 месяцев" />{' '}
                  <TextField label="К какой дате нужны деньги" defaultValue="1 ноября 2026" prefilled={true} />
                </div>
                <TextField
                  label="Цель"
                  defaultValue="Закупка партии товаров для дома к распродаже 11.11"
                  prefilled={true}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="kk-field__top">
                    <span className="label">Источник возврата</span>{' '}
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
            </div>
            <aside className="kn-cols__side">
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <h2 className="title-3">Ваша заявка</h2>
                <dl className="kn-rows">
                  <div>
                    <dt>Продукт</dt>
                    <dd>Кредитная линия</dd>
                  </div>
                  <div>
                    <dt>Сумма</dt>
                    <dd>3 000 000 ₽</dd>
                  </div>
                  <div>
                    <dt>Срок</dt>
                    <dd>18 мес.</dd>
                  </div>
                  <div>
                    <dt>Ставка</dt>
                    <dd>от 21,5%</dd>
                  </div>
                  <div>
                    <dt>Платёж</dt>
                    <dd>≈ 196 500 ₽</dd>
                  </div>
                </dl>
                <PaymentLoadMeter payment={v.pay} cashFlow={v.flow} />
              </section>
              <Alert tone="assistant" title="Поля заполнены из нашего разговора">
                Проверьте дату: деньги нужны до 1 ноября, а решение обычно готово за 2 часа.
              </Alert>
            </aside>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '16px 24px',
              background: 'var(--surface)',
              borderRadius: '16px',
            }}
          >
            <span style={{ color: 'var(--success)' }}>
              <Icon name="check-circle" />
            </span>{' '}
            <span className="body-sm" style={{ flex: '1', color: 'var(--ink-secondary)' }}>
              Черновик сохранён в 10:42
            </span>{' '}
            <Link className="kk-btn kk-btn--secondary" to="/b3-offers">
              Назад
            </Link>{' '}
            <Link className="kk-btn kk-btn--primary" to="/b5-step2">
              Продолжить
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
