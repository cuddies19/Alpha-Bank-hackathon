// Шапка карточки заявки с вкладками — перенесено из макета «Кредитный кабинет — макет» (C2Head.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon } from '../ui';
import type { ScreenValues } from '../lib/screen';

export interface C2HeadProps {
  tab?: 'summary' | 'client' | 'checks' | 'risk' | 'docs' | 'history';
  decided?: boolean;
}

function useScreen(props: C2HeadProps): ScreenValues {
  const t = props.tab ?? 'summary';
  const keys = ['summary', 'client', 'checks', 'risk', 'docs', 'history'];
  const out: ScreenValues = { i16: 16 };
  keys.forEach((k, i) => {
    out['t' + (i + 1)] = 'kn-tab' + (t === k ? ' is-active' : '');
    out['c' + (i + 1)] = t === k ? 'page' : undefined;
  });
  const decided = props.decided ?? false;
  out.stage = decided ? 'Встречное предложение' : 'Ручное рассмотрение';
  out.stageTone = decided ? 'warning' : 'info';
  return out;
}

export default function C2Head(props: C2HeadProps) {
  const v = useScreen(props);
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px 32px 0',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Link
        className="kk-btn kk-btn--link"
        to="/c1-queue"
        style={{ alignSelf: 'flex-start', color: 'var(--ink-secondary)' }}
      >
        <svg
          className="kn-svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M11.5 5.5L5 12l6.5 6.5" />
        </svg>{' '}
        Очередь заявок
      </Link>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <h1 className="title-2">ООО «Дом и уют»</h1>
            <Badge tone={v.stageTone}>{v.stage}</Badge>
          </div>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            ИНН 7701234567 · заявка № 2026-10-0142 · кредитная линия{' '}
            <span className="amt" style={{ color: 'var(--ink)', fontWeight: '600' }}>
              3 000 000 ₽
            </span>{' '}
            на 18 мес. · подана 24 октября, 10:51
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="kn-sla" title="Время до нарушения SLA">
            <Icon name="clock" size={v.i16} /> осталось 1 ч 20 мин
          </span>{' '}
          <Button variant="secondary">Взять в работу</Button>
        </div>
      </div>
      <nav className="kn-tabs" aria-label="Разделы заявки" style={{ borderBottom: '0' }}>
        <Link className={v.t1} to="/c2-summary" aria-current={v.c1}>
          Сводка
        </Link>{' '}
        <Link className={v.t2} to="/c2-client" aria-current={v.c2}>
          Клиент
        </Link>{' '}
        <Link className={v.t3} to="/c2-checks" aria-current={v.c3}>
          Внешние проверки
        </Link>{' '}
        <Link className={v.t4} to="/c2-risk" aria-current={v.c4}>
          Оценка риска
        </Link>{' '}
        <Link className={v.t5} to="/c2-docs" aria-current={v.c5}>
          Документы
        </Link>{' '}
        <Link className={v.t6} to="/c2-history" aria-current={v.c6}>
          История
        </Link>
      </nav>
    </div>
  );
}
