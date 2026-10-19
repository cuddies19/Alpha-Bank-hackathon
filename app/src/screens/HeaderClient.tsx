// Шапка клиента — перенесено из макета «Кредитный кабинет — макет» (HeaderClient.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import type { ScreenValues } from '../lib/screen';

export interface HeaderClientProps {
  company?: string;
  person?: string;
  initials?: string;
  unread?: string;
}

function useScreen(props: HeaderClientProps): ScreenValues {
  return {
    company: props.company ?? 'ООО «Дом и уют»',
    person: props.person ?? 'Игорь Соколов, генеральный директор',
    initials: props.initials ?? 'ДУ',
    unread: props.unread ?? '2',
  };
}

export default function HeaderClient(props: HeaderClientProps) {
  const v = useScreen(props);
  return (
    <header className="kn-top" style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>
      <Link
        className="kn-company"
        to="/b15-profile"
        aria-label={`Компания: ${v.company}. Сменить компанию или открыть профиль`}
      >
        <span className="kn-avatar">{v.initials}</span>{' '}
        <span className="kn-company__text">
          <span className="kn-company__name">{v.company}</span> <span className="kn-company__sub">{v.person}</span>
        </span>{' '}
        <svg
          className="kn-svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: 'var(--ink-secondary)' }}
        >
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      </Link>{' '}
      <span className="kn-top__spacer"></span>{' '}
      <Link className="kn-ibtn" to="/b14-notifications" aria-label={`Уведомления: ${v.unread} новых`}>
        <svg
          className="kn-svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 10a6 6 0 0 1 12 0c0 4.5 1.5 6.5 2 7H4c.5-.5 2-2.5 2-7z" />
          <path d="M10 20.2a2.2 2.2 0 0 0 4 0" />
        </svg>{' '}
        <span className="kn-ibtn__count">{v.unread}</span>
      </Link>{' '}
      <Link className="kk-btn kk-btn--secondary" to="/b2-dialog">
        <span className="kn-mark" style={{ width: '24px', height: '24px' }}>
          <Icon name="sparkle" size={14} />
        </span>{' '}
        Ассистент
      </Link>
    </header>
  );
}
