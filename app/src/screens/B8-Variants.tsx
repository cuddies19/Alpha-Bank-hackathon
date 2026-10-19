// B8 · Варианты статуса — перенесено из макета «Кредитный кабинет — макет» (B8-Variants.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Badge, Icon, StatusTracker } from '../ui';
import type { ScreenValues } from '../lib/screen';

function useScreen(): ScreenValues {
  return {
    checking: [
      { title: 'Заявка отправлена', status: 'done', time: '10:51' },
      { title: 'Проверяем данные', status: 'done', time: '10:52' },
      {
        title: 'Запрашиваем сведения',
        status: 'current',
        time: 'обычно до 10 минут',
        description: 'ЕГРЮЛ — получено, ФНС — получено, кредитная история — ждём ответа',
      },
      { title: 'Оцениваем заявку', status: 'pending' },
      { title: 'Решение', status: 'pending' },
    ],
    docs: [
      { title: 'Заявка отправлена', status: 'done', time: '23 окт., 15:10' },
      { title: 'Рассматривает специалист', status: 'done', time: '24 окт., 09:40' },
      {
        title: 'Нужны документы',
        status: 'attention',
        time: 'до 30 октября',
        description: 'Без отчётности и выписки банк не увидит всю выручку и долги компании.',
      },
      { title: 'Решение', status: 'pending' },
    ],
    fail: [
      { title: 'Заявка отправлена', status: 'done', time: '11:12' },
      { title: 'Проверяем данные', status: 'done', time: '11:13' },
      {
        title: 'Запрашиваем сведения',
        status: 'done',
        time: '11:18',
        description: 'ЕГРЮЛ и ФНС ответили. Бюро кредитных историй не ответило — передали специалисту',
      },
      {
        title: 'Рассматривает специалист',
        status: 'current',
        time: 'обычно до 2 часов',
        description: 'Специалист запросит кредитную историю повторно или проверит вручную.',
      },
      { title: 'Решение', status: 'pending' },
    ],
  };
}

export default function B8Variants() {
  const v = useScreen();
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1440px',
        minHeight: '1000px',
        padding: '40px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Идёт проверка
        </p>
        <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Badge tone="info">Запрашиваем сведения</Badge>
            <h2 className="title-3">
              Кредитная линия на <span className="amt">3 000 000 ₽</span>
            </h2>
            <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              № 2026-10-0142 · подана 24 октября, 10:51
            </p>
          </div>
          <StatusTracker stages={v.checking} />
        </section>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Нужны документы
        </p>
        <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Badge tone="warning">Нужны документы</Badge>
            <h2 className="title-3">
              Кредит на любые цели на <span className="amt">4 500 000 ₽</span>
            </h2>
            <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              ООО «Лён и Дуб» · № 2026-10-0141
            </p>
          </div>
          <Alert tone="warning" title="Банку нужны ещё два документа">
            <p>Бухгалтерская отчётность за 2025 год и выписка из другого банка за 6 месяцев. Ответьте до 30 октября.</p>
            <div style={{ marginTop: '12px' }}>
              <Link className="kk-btn kk-btn--primary kk-btn--sm" to="/b9c-docs">
                <Icon name="upload" size={16} />
                Загрузить
              </Link>
            </div>
          </Alert>{' '}
          <StatusTracker stages={v.docs} />
        </section>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Источник не ответил
        </p>
        <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Badge tone="info">Рассматривает специалист</Badge>
            <h2 className="title-3">
              Кредитная линия на <span className="amt">8 000 000 ₽</span>
            </h2>
            <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              ООО «Велес Логистик» · № 2026-10-0144
            </p>
          </div>
          <Alert tone="info" title="Кредитная история пришла не сразу">
            Бюро кредитных историй не ответило — заявку проверит специалист, это добавит до часа. Делать ничего не
            нужно.
          </Alert>{' '}
          <StatusTracker stages={v.fail} />
        </section>
      </div>
    </div>
  );
}
