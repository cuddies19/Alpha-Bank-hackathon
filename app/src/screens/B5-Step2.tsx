// B5 · Шаг 2. Компания — перенесено из макета «Кредитный кабинет — макет» (B5-Step2.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Icon, Stepper, TextField } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const on = s.on || { bki: false, pd: true, ops: true };
  const list = [
    {
      k: 'bki',
      title: 'Согласие на запрос в бюро кредитных историй',
      text: 'Разрешаю банку запросить мою кредитную историю и кредитную историю компании в бюро кредитных историй для оценки заявки. Согласие действует 6 месяцев.',
    },
    {
      k: 'pd',
      title: 'Согласие на обработку персональных данных',
      text: 'Разрешаю банку обрабатывать персональные данные руководителя и контактного лица, чтобы рассмотреть заявку и выдать кредит.',
    },
    {
      k: 'ops',
      title: 'Согласие на анализ операций по счёту',
      text: 'Разрешаю банку анализировать поступления и списания по счёту за 12 месяцев, чтобы посчитать денежный поток бизнеса.',
    },
  ];
  return {
    c1: 1,
    steps: [
      { label: 'Параметры', description: 'Заполнено ассистентом' },
      { label: 'Компания', description: 'Из ЕГРЮЛ' },
      { label: 'Финансы и документы', description: 'Из выписки по счёту' },
      { label: 'Проверка и отправка' },
    ],
    consents: list.map((c) => ({ ...c, on: !!on[c.k], toggle: () => setState({ on: { ...on, [c.k]: !on[c.k] } }) })),
  };
}

export default function B5Step2() {
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
            <Stepper steps={v.steps} current={v.c1} />
          </section>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Компания</h2>
                  <Badge tone="neutral" icon="document">
                    Из ЕГРЮЛ
                  </Badge>
                </div>
                <dl className="kn-kv">
                  <div>
                    <dt>ИНН</dt>
                    <dd className="amt">7701234567</dd>
                  </div>
                  <div>
                    <dt>ОГРН</dt>
                    <dd className="amt">1247700412345</dd>
                  </div>
                  <div>
                    <dt>Дата регистрации</dt>
                    <dd>12 июня 2024</dd>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <dt>Полное название</dt>
                    <dd>Общество с ограниченной ответственностью «Дом и уют»</dd>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <dt>ОКВЭД</dt>
                    <dd>47.91 — Торговля розничная по почте или через интернет</dd>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <dt>Юридический адрес</dt>
                    <dd>г. Москва, ул. Образцовая, д. 7, офис 12</dd>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <dt>Руководитель</dt>
                    <dd>Соколов Игорь Андреевич, генеральный директор</dd>
                  </div>
                </dl>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                    paddingTop: '4px',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  <p className="body-sm" style={{ flex: '1', color: 'var(--ink-secondary)', paddingTop: '12px' }}>
                    Данные только для чтения: их обновляет ЕГРЮЛ, проверено сегодня в 10:43.
                  </p>
                  <Button variant="link" style={{ paddingTop: '12px' }}>
                    Данные неверны
                  </Button>
                </div>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
                <h2 className="title-3">Контактное лицо</h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
                    gap: '20px',
                  }}
                >
                  <TextField label="Имя и фамилия" defaultValue="Игорь Соколов" prefilled={true} />{' '}
                  <TextField
                    label="Телефон"
                    defaultValue="+7 900 000-00-00"
                    type="tel"
                    hint="Сообщения по заявке банк присылает только в кабинет"
                  />
                </div>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 className="title-3">Согласия</h2>
                  <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    Без них банк не сможет проверить заявку. Отозвать согласие можно в профиле.
                  </p>
                </div>
                {v.consents.map((c, i) => (
                  <div key={i} className="kn-consent">
                    <label className="kn-consent__row">
                      <input type="checkbox" className="kn-check" checked={c.on} onChange={c.toggle} />{' '}
                      <span>{c.title}</span>
                    </label>
                    <details>
                      <summary>
                        Текст согласия <Icon name="chevron-right" size={16} />
                      </summary>
                      <p>{c.text}</p>
                    </details>
                  </div>
                ))}
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
                    <dt>Платёж</dt>
                    <dd>≈ 196 500 ₽</dd>
                  </div>
                </dl>
              </section>
              <Alert tone="assistant" title="Реквизиты вводить не нужно">
                Взяли их из ЕГРЮЛ по ИНН компании. Если что-то устарело — нажмите «Данные неверны».
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
              Черновик сохранён в 10:44
            </span>{' '}
            <Link className="kk-btn kk-btn--secondary" to="/b5-step1">
              Назад
            </Link>{' '}
            <Link className="kk-btn kk-btn--primary" to="/b5-step3">
              Продолжить
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
