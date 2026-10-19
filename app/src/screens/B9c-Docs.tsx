// B9c · Нужны документы — перенесено из макета «Кредитный кабинет — макет» (B9c-Docs.dc.html)
import { Alert, Badge, Button, DocumentUpload, Icon, StatusTracker } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const sent = !!s.sent;
  return {
    open: !sent,
    sent,
    badge: sent ? 'Повторное рассмотрение' : 'Нужны документы',
    badgeTone: sent ? 'info' : 'warning',
    stmtTone: sent ? 'success' : 'neutral',
    stmtWord: sent ? 'Принят' : 'Загружается',
    send: () => setState({ sent: true }),
    files: [
      { name: 'Отчётность_2025_Лён_и_Дуб.pdf', size: '2,4 МБ', status: 'ok' },
      { name: 'Выписка_другой_банк_апрель-сентябрь.pdf', status: 'uploading', progress: 72 },
    ],
    stages: [
      { title: 'Документы получены', status: 'done', time: 'Сегодня, 14:20' },
      { title: 'Проверяем документы', status: 'current', time: 'обычно до 30 минут' },
      { title: 'Рассматривает специалист', status: 'pending' },
      { title: 'Решение', status: 'pending' },
    ],
  };
}

export default function B9cDocs() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main">
        <HeaderClient company="ООО «Лён и Дуб»" person="Марина Орлова, генеральный директор" initials="ЛД" unread="1" />
        <div className="kn-page kn-page--narrow" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Badge tone={v.badgeTone}>{v.badge}</Badge>{' '}
              <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                Заявка № 2026-10-0141 · кредит на любые цели <span className="amt">4 500 000 ₽</span> на 36 мес.
              </span>
            </div>
            <h1 className="display">Банку нужны ещё два документа</h1>
            <p className="body-lg" style={{ color: 'var(--ink-secondary)', maxWidth: '680px' }}>
              Специалист посмотрел заявку. Чтобы принять решение, ему не хватает полной картины по выручке.
            </p>
          </div>
          <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
            <h2 className="title-3">Что загрузить</h2>
            <ul style={{ display: 'flex', flexDirection: 'column' }}>
              <li
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span style={{ color: 'var(--ink-secondary)' }}>
                  <Icon name="document" />
                </span>{' '}
                <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="body-strong">Бухгалтерская отчётность за 2025 год</span>
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    Чтобы увидеть выручку и долги компании целиком
                  </span>
                </span>{' '}
                <Badge tone="success">Принят</Badge>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 0' }}>
                <span style={{ color: 'var(--ink-secondary)' }}>
                  <Icon name="document" />
                </span>{' '}
                <span style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="body-strong">Выписка из другого банка за 6 месяцев</span>
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    Без неё банк не увидит часть выручки
                  </span>
                </span>{' '}
                <Badge tone={v.stmtTone}>{v.stmtWord}</Badge>
              </li>
            </ul>
            {v.open ? (
              <>
                <DocumentUpload files={v.files} />
              </>
            ) : null}
          </section>
          {v.open ? (
            <>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <label className="kn-field">
                  <span className="label">Комментарий для специалиста</span>
                  <textarea
                    className="kn-textarea"
                    rows={3}
                    placeholder="Например: второй счёт открыт в марте, выписка за весь период"
                  ></textarea>
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    Необязательно
                  </span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                  <Button variant="primary" size="lg" onClick={v.send}>
                    Отправить на повторное рассмотрение
                  </Button>{' '}
                  <span
                    className="body-sm"
                    style={{ color: 'var(--warning)', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                  >
                    <Icon name="calendar" size={16} />
                    Ответьте до 30 октября, иначе заявка закроется
                  </span>
                </div>
              </section>
            </>
          ) : null}
          {v.sent ? (
            <>
              <Alert tone="success" title="Документы отправлены">
                Заявка вернулась на рассмотрение — обычно до 2 часов. Сообщим о решении здесь, в кабинете.
              </Alert>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <h2 className="title-3">Где заявка</h2>
                <StatusTracker stages={v.stages} />
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
