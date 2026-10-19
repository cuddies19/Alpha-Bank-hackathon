// Нижняя навигация — перенесено из макета «Кредитный кабинет — макет» (NavMobile.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import type { ScreenValues } from '../lib/screen';

export interface NavMobileProps {
  active?: 'home' | 'financing' | 'applications' | 'loans' | 'profile' | 'none';
}

function useScreen(props: NavMobileProps): ScreenValues {
  const a = props.active ?? 'home';
  const c = (k) => 'kn-mnav__item' + (a === k ? ' is-active' : '');
  const cur = (k) => (a === k ? 'page' : undefined);
  return {
    homeCls: c('home'),
    homeCur: cur('home'),
    finCls: c('financing'),
    finCur: cur('financing'),
    appsCls: c('applications'),
    appsCur: cur('applications'),
    loansCls: c('loans'),
    loansCur: cur('loans'),
    profCls: c('profile'),
    profCur: cur('profile'),
  };
}

export default function NavMobile(props: NavMobileProps) {
  const v = useScreen(props);
  return (
    <nav className="kn-mnav" aria-label="Разделы кабинета" style={{ fontFamily: 'var(--font-sans)' }}>
      <Link className={v.homeCls} to="/m-home" aria-current={v.homeCur}>
        <span className="kn-mnav__ic">
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
            <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
          </svg>
        </span>{' '}
        Главная
      </Link>{' '}
      <Link className={v.finCls} to="/m-need" aria-current={v.finCur}>
        <span className="kn-mnav__ic">
          <Icon name="trend-up" size={22} />
        </span>{' '}
        Подбор
      </Link>{' '}
      <Link className={v.appsCls} to="/m-status" aria-current={v.appsCur}>
        <span className="kn-mnav__ic">
          <Icon name="document" size={22} />
        </span>{' '}
        Заявки
      </Link>{' '}
      <Link className={v.loansCls} to="/b12-loans" aria-current={v.loansCur}>
        <span className="kn-mnav__ic">
          <Icon name="wallet" size={22} />
        </span>{' '}
        Кредиты
      </Link>{' '}
      <Link className={v.profCls} to="/b15-profile" aria-current={v.profCur}>
        <span className="kn-mnav__ic">
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
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
          </svg>
        </span>{' '}
        Профиль
      </Link>
    </nav>
  );
}
