// B5 · Шаг 3 · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Step3.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Badge, DocumentUpload, Icon, Stepper } from '../ui';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';

function useScreen(): ScreenValues {
  return {
    c2: 2,
    steps: [
      { label: 'Параметры' },
      { label: 'Компания' },
      { label: 'Финансы и документы', description: 'Из выписки по счёту' },
      { label: 'Проверка и отправка' },
    ],
    files: [
      { name: 'Отчётность_2025.pdf', size: '1,8 МБ', status: 'ok' },
      { name: 'Выписка_второй_счёт.pdf', status: 'checking', size: '640 КБ' },
      {
        name: 'Договор_поставки.jpg',
        status: 'error',
        message: 'Фото обрезано: не видно страницы с подписью. Загрузите разворот целиком.',
      },
    ],
  };
}

export default function MStep3() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop mode="flow" title="Заявка · шаг 3 из 4" sub="Финансы и документы" back="/m-step1" />
      <div className="kn-mobile__body">
        <section className="kk-card kk-card--sm">
          <Stepper steps={v.steps} current={v.c2} />
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '12px', padding: '20px 16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Обороты за 12 месяцев</h2>
          </div>
          <Badge tone="neutral" icon="document">
            Из выписки по счёту
          </Badge>{' '}
          <span className="amount-lg amt">33 210 000 ₽</span>
          <div
            role="img"
            aria-label="Поступления по месяцам: пик в ноябре и декабре, спад летом"
            style={{ height: '64px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}
          >
            <span style={{ flex: '1', height: '86.7%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '91.1%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '48.9%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '44.4%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '51.1%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '55.6%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '53.3%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '46.7%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '42.2%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '55.6%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '76.7%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
            <span style={{ flex: '1', height: '85.8%', background: 'var(--ink)', borderRadius: '2px 2px 0 0' }}></span>
          </div>
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '8px', padding: '20px 16px' }}>
          <h2 className="title-3">Действующие кредиты</h2>
          <p className="body">Кредит в другом банке</p>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Остаток 450 000 ₽ · 38 000 ₽ в месяц
          </p>
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '16px', padding: '20px 16px' }}>
          <h2 className="title-3">Документы</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--success)' }}>
                <Icon name="check-circle" />
              </span>
              <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <span className="body-strong">Отчётность за 2025 год</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Обязательно для ООО · принят
                </span>
              </span>
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--info)' }}>
                <Icon name="clock" />
              </span>
              <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <span className="body-strong">Выписка из другого банка</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Желательно · проверяем
                </span>
              </span>
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--danger)' }}>
                <Icon name="alert" />
              </span>
              <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <span className="body-strong">Договор поставки</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Желательно · нужно заменить
                </span>
              </span>
            </li>
          </ul>
          <DocumentUpload label="Выбрать файл или сфотографировать" files={v.files} />
        </section>
        <Alert tone="assistant" title="Часть выручки идёт на другой счёт">
          Выписка из другого банка поможет банку увидеть всю выручку.
        </Alert>
        <p
          className="body-sm"
          style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--ink-secondary)' }}
        >
          <span style={{ color: 'var(--success)' }}>
            <Icon name="check-circle" size={16} />
          </span>
          Черновик сохранён в 10:48
        </p>
        <div style={{ height: '40px' }} aria-hidden="true"></div>
      </div>
      <Link className="kn-demo kn-demo--m" to="/a2-demo" style={{ bottom: '156px' }}>
        <Icon name="shield" size={16} />
        Режим проверки
      </Link>
      <div className="kn-mbar">
        <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/m-sent">
          Проверить и отправить
        </Link>{' '}
        <Link className="kk-btn kk-btn--ghost kk-btn--full" to="/m-step1">
          Назад
        </Link>
      </div>
    </div>
  );
}
