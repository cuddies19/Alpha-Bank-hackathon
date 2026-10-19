// B5 · Шаг 3. Финансы и документы — перенесено из макета «Кредитный кабинет — макет» (B5-Step3.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Badge, DocumentUpload, Icon, Stepper } from '../ui';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  return {
    c2: 2,
    steps: [
      { label: 'Параметры', description: 'Заполнено ассистентом' },
      { label: 'Компания', description: 'Из ЕГРЮЛ' },
      { label: 'Финансы и документы', description: 'Из выписки по счёту' },
      { label: 'Проверка и отправка' },
    ],
    files: [
      { name: 'Бухгалтерская_отчётность_2025.pdf', size: '1,8 МБ', status: 'ok' },
      { name: 'Выписка_второй_счёт_апрель-сентябрь.pdf', size: '640 КБ', status: 'checking' },
      {
        name: 'Договор_поставки.jpg',
        status: 'error',
        message: 'Фото обрезано: не видно страницы с подписью. Загрузите разворот целиком.',
      },
      { name: 'Счёт_поставщика.pdf', status: 'uploading', progress: 64 },
    ],
  };
}

export default function B5Step3() {
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
            <Stepper steps={v.steps} current={v.c2} />
          </section>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Обороты за 12 месяцев</h2>
                  <Badge tone="neutral" icon="document">
                    Из выписки по счёту
                  </Badge>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '24px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                      Поступления, ноябрь 2025 — октябрь 2026
                    </span>{' '}
                    <span className="amount-lg amt">33 210 000 ₽</span>
                  </div>
                  <div
                    role="img"
                    aria-label="Поступления по месяцам: пик в ноябре и декабре, спад летом, рост к октябрю"
                    style={{
                      flex: '1 1 320px',
                      maxWidth: '460px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                      <span
                        style={{ flex: '1', height: '86.7%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '91.1%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '48.9%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '44.4%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '51.1%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '55.6%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '53.3%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '46.7%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '42.2%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '55.6%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '76.7%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>{' '}
                      <span
                        style={{ flex: '1', height: '85.8%', background: 'var(--ink)', borderRadius: '3px 3px 0 0' }}
                      ></span>
                    </div>
                    <div
                      className="caption"
                      style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-secondary)' }}
                    >
                      <span>ноя</span>
                      <span>фев</span>
                      <span>май</span>
                      <span>авг</span>
                      <span>окт</span>
                    </div>
                  </div>
                </div>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Действующие кредиты</h2>
                  <Badge tone="neutral" icon="document">
                    Из выписки по счёту
                  </Badge>
                </div>
                <dl className="kn-rows">
                  <div>
                    <dt>Кредит в другом банке</dt>
                    <dd>остаток 450 000 ₽ · 38 000 ₽ в месяц</dd>
                  </div>
                </dl>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Банк сверит данные с кредитной историей — вводить вручную не нужно.
                </p>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
                <h2 className="title-3">Документы</h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--success)' }}>
                      <Icon name="check-circle" />
                    </span>{' '}
                    <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                      <span className="body-strong">Бухгалтерская отчётность за 2025 год</span>
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        Обязательно для ООО
                      </span>
                    </span>{' '}
                    <Badge tone="success">Принят</Badge>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--info)' }}>
                      <Icon name="clock" />
                    </span>{' '}
                    <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                      <span className="body-strong">Выписка из другого банка за 6 месяцев</span>
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        Желательно, если есть второй счёт
                      </span>
                    </span>{' '}
                    <Badge tone="info">Проверяем</Badge>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--danger)' }}>
                      <Icon name="alert" />
                    </span>{' '}
                    <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                      <span className="body-strong">Договор поставки партии</span>
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        Желательно: подтверждает цель закупки
                      </span>
                    </span>{' '}
                    <Badge tone="danger">Нужно заменить</Badge>
                  </li>
                </ul>
                <DocumentUpload files={v.files} hint="PDF, JPG или PNG до 20 МБ. Проверим файл сразу после загрузки" />
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
                    <dt>Документы</dt>
                    <dd>1 из 1 обязательных</dd>
                  </div>
                </dl>
              </section>
              <Alert tone="assistant" title="Часть выручки, похоже, идёт на другой счёт">
                Выписка из другого банка поможет банку увидеть всю выручку — тогда сумма может быть выше.
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
              Черновик сохранён в 10:48
            </span>{' '}
            <Link className="kk-btn kk-btn--secondary" to="/b5-step2">
              Назад
            </Link>{' '}
            <Link className="kk-btn kk-btn--primary" to="/b5-step4">
              Продолжить
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
