// B9c · Нужны документы · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Docs.dc.html)
import { Alert, Badge, Button, DocumentUpload } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const sent = !!s.sent;
  return {
    open: !sent,
    sent,
    badge: sent ? 'Повторное рассмотрение' : 'Нужны документы',
    badgeTone: sent ? 'info' : 'warning',
    send: () => setState({ sent: true }),
    files: [
      { name: 'Отчётность_2025.pdf', size: '2,4 МБ', status: 'ok' },
      { name: 'Выписка_другой_банк.pdf', status: 'uploading', progress: 72 },
    ],
  };
}

export default function MDocs() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop
        mode="flow"
        title="Решение по заявке"
        sub="ООО «Лён и Дуб» · № 2026-10-0141"
        back="/m-login"
        unread="1"
      />
      <div className="kn-mobile__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Badge tone={v.badgeTone}>{v.badge}</Badge>
          <h1 className="title-1">Банку нужны ещё два документа</h1>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            Чтобы принять решение, специалисту не хватает полной картины по выручке.
          </p>
        </div>
        <section className="kk-card kk-card--sm" style={{ gap: '12px', padding: '20px 16px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <span className="body-strong">Бухгалтерская отчётность за 2025 год</span>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Чтобы увидеть выручку и долги компании целиком
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span className="body-strong">Выписка из другого банка за 6 месяцев</span>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Без неё банк не увидит часть выручки
            </span>
          </div>
          {v.open ? (
            <>
              <DocumentUpload label="Выбрать файл или сфотографировать" files={v.files} />
            </>
          ) : null}
        </section>
        {v.open ? (
          <>
            <label className="kn-field">
              <span className="label">Комментарий для специалиста</span>
              <textarea className="kn-textarea" rows={3} placeholder="Необязательно"></textarea>
            </label>
          </>
        ) : null}
        {v.sent ? (
          <>
            <Alert tone="success" title="Документы отправлены">
              Заявка вернулась на рассмотрение — обычно до 2 часов. Сообщим о решении здесь.
            </Alert>
          </>
        ) : null}
      </div>
      {v.open ? (
        <>
          <div className="kn-mbar">
            <Button variant="primary" size="lg" fullWidth={true} onClick={v.send}>
              Отправить на повторное рассмотрение
            </Button>
            <p className="caption" style={{ textAlign: 'center', color: 'var(--warning)' }}>
              Ответьте до 30 октября, иначе заявка закроется
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
