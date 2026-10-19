// Мобильная шапка — перенесено из макета «Кредитный кабинет — макет» (MobileTop.dc.html)
import { Link } from 'react-router-dom';
import type { ScreenValues } from '../lib/screen';

export interface MobileTopProps {
  mode?: 'root' | 'flow';
  title?: string;
  sub?: string;
  initials?: string;
  back?: string;
  unread?: string;
}

function useScreen(props: MobileTopProps): ScreenValues {
  const flow = (props.mode ?? 'root') === 'flow';
  return {
    isFlow: flow,
    isRoot: !flow,
    cls: 'kn-mtop' + (flow ? ' kn-mtop--flow' : ''),
    title: props.title ?? 'ООО «Дом и уют»',
    sub: props.sub ?? 'Игорь Соколов',
    initials: props.initials ?? 'ДУ',
    back: props.back ?? '/m-home',
    unread: props.unread ?? '2',
  };
}

export default function MobileTop(props: MobileTopProps) {
  const v = useScreen(props);
  return (
    <header className={v.cls} style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>
      {v.isFlow ? (
        <>
          <Link className="kn-ibtn" to={v.back} aria-label="Назад">
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
              <path d="M19 12H5M11.5 5.5L5 12l6.5 6.5" />
            </svg>
          </Link>
        </>
      ) : null}
      {v.isRoot ? (
        <>
          <span className="kn-avatar" style={{ width: '36px', height: '36px', marginRight: '8px' }}>
            {v.initials}
          </span>
        </>
      ) : null}
      <div className="kn-mtop__title">
        <b>{v.title}</b> <span>{v.sub}</span>
      </div>
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
      </Link>
    </header>
  );
}
