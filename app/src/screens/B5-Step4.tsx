// B5 · Шаг 4. Проверка и отправка — перенесено из макета «Кредитный кабинет — макет» (B5-Step4.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Button, Icon, Stepper } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const bki = !!s.bki;
  return {
    c3: 3,
    steps: [
      { label: 'Параметры', description: 'Заполнено ассистентом' },
      { label: 'Компания', description: 'Из ЕГРЮЛ' },
      { label: 'Финансы и документы', description: 'Из выписки по счёту' },
      { label: 'Проверка и отправка' },
    ],
    bki,
    missing: !bki,
    ready: bki,
    bkiCls: 'kn-consent' + (bki ? '' : ' is-missing'),
    toggle: () => setState({ bki: !bki }),
  };
}

export default function B5Step4() {
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
            <Stepper steps={v.steps} current={v.c3} />
          </section>
          <div className="kn-cols">
            <div className="kn-cols__main">
              {v.missing ? (
                <>
                  <Alert tone="assistant" title="Не хватает одного согласия">
                    Не отмечено согласие на запрос в БКИ — без него банк не сможет оценить заявку. Отметьте его ниже,
                    остальное готово.
                  </Alert>
                </>
              ) : null}
              {v.ready ? (
                <>
                  <Alert tone="success" title="Всё готово к отправке">
                    Банк проверит данные и сообщит о решении здесь, в кабинете.
                  </Alert>
                </>
              ) : null}
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Параметры</h2>
                  <Link className="kk-btn kk-btn--link" to="/b5-step1">
                    Изменить
                  </Link>
                </div>
                <dl className="kn-rows">
                  <div>
                    <dt>Продукт</dt>
                    <dd>Кредитная линия</dd>
                  </div>
                  <div>
                    <dt>Сумма и срок</dt>
                    <dd>3 000 000 ₽ · 18 мес.</dd>
                  </div>
                  <div>
                    <dt>Цель</dt>
                    <dd>Закупка партии к распродаже 11.11</dd>
                  </div>
                  <div>
                    <dt>Деньги нужны</dt>
                    <dd>до 1 ноября</dd>
                  </div>
                  <div>
                    <dt>Источник возврата</dt>
                    <dd>Выручка с маркетплейсов</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Компания</h2>
                  <Link className="kk-btn kk-btn--link" to="/b5-step2">
                    Изменить
                  </Link>
                </div>
                <dl className="kn-rows">
                  <div>
                    <dt>Название</dt>
                    <dd>ООО «Дом и уют»</dd>
                  </div>
                  <div>
                    <dt>ИНН</dt>
                    <dd>7701234567</dd>
                  </div>
                  <div>
                    <dt>Руководитель</dt>
                    <dd>Соколов И. А.</dd>
                  </div>
                  <div>
                    <dt>Контактное лицо</dt>
                    <dd>Игорь Соколов</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Финансы и документы</h2>
                  <Link className="kk-btn kk-btn--link" to="/b5-step3">
                    Изменить
                  </Link>
                </div>
                <dl className="kn-rows">
                  <div>
                    <dt>Поступления за 12 месяцев</dt>
                    <dd>33 210 000 ₽</dd>
                  </div>
                  <div>
                    <dt>Действующие кредиты</dt>
                    <dd>1, платёж 38 000 ₽ в месяц</dd>
                  </div>
                  <div>
                    <dt>Бухгалтерская отчётность 2025</dt>
                    <dd style={{ color: 'var(--success)' }}>Принят</dd>
                  </div>
                  <div>
                    <dt>Выписка второго счёта</dt>
                    <dd style={{ color: 'var(--info)' }}>Проверяем</dd>
                  </div>
                  <div>
                    <dt>Договор поставки</dt>
                    <dd style={{ color: 'var(--ink-secondary)', fontWeight: '400' }}>Необязательно, можно позже</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Согласия</h2>
                  <Link className="kk-btn kk-btn--link" to="/b5-step2">
                    Изменить
                  </Link>
                </div>
                <div className={v.bkiCls}>
                  <label className="kn-consent__row">
                    <input type="checkbox" className="kn-check" checked={v.bki} onChange={v.toggle} />{' '}
                    <span>Согласие на запрос в бюро кредитных историй</span>
                  </label>
                  <details>
                    <summary>
                      Текст согласия <Icon name="chevron-right" size={16} />
                    </summary>
                    <p>
                      Разрешаю банку запросить мою кредитную историю и кредитную историю компании в бюро кредитных
                      историй для оценки заявки. Согласие действует 6 месяцев.
                    </p>
                  </details>
                </div>
                <dl className="kn-rows">
                  <div>
                    <dt>Обработка персональных данных</dt>
                    <dd style={{ color: 'var(--success)' }}>Дано в 10:44</dd>
                  </div>
                  <div>
                    <dt>Анализ операций по счёту</dt>
                    <dd style={{ color: 'var(--success)' }}>Дано в 10:44</dd>
                  </div>
                </dl>
              </section>
            </div>
            <aside className="kn-cols__side">
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <h2 className="title-3">Что будет дальше</h2>
                <ol style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li className="body" style={{ display: 'flex', gap: '12px' }}>
                    <span className="kn-avatar" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                      1
                    </span>
                    Проверим данные и документы
                  </li>
                  <li className="body" style={{ display: 'flex', gap: '12px' }}>
                    <span className="kn-avatar" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                      2
                    </span>
                    Запросим сведения в ЕГРЮЛ, ФНС и бюро кредитных историй
                  </li>
                  <li className="body" style={{ display: 'flex', gap: '12px' }}>
                    <span className="kn-avatar" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                      3
                    </span>
                    Примем решение — обычно до 2 часов
                  </li>
                </ol>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Решение принимает банк. Сообщим о нём здесь, в кабинете.
                </p>
              </section>
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
              Черновик сохранён в 10:50
            </span>{' '}
            <Link className="kk-btn kk-btn--secondary" to="/b5-step3">
              Назад
            </Link>
            {v.ready ? (
              <>
                <Link className="kk-btn kk-btn--primary" to="/b6-sent">
                  Отправить заявку
                </Link>
              </>
            ) : null}
            {v.missing ? (
              <>
                <span className="body-sm" style={{ color: 'var(--warning)' }}>
                  Отметьте согласие на запрос в БКИ
                </span>{' '}
                <Button variant="primary" disabled={true}>
                  Отправить заявку
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
