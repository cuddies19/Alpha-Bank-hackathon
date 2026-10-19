// Навигация клиента — перенесено из макета «Кредитный кабинет — макет» (NavClient.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import type { ScreenValues } from '../lib/screen';

export interface NavClientProps {
  active?: 'home' | 'financing' | 'applications' | 'loans' | 'documents' | 'none';
  appsCount?: string;
}

function useScreen(props: NavClientProps): ScreenValues {
  const a = props.active ?? 'home';
  const c = (k) => 'kn-nav__link' + (a === k ? ' is-active' : '');
  const cur = (k) => (a === k ? 'page' : undefined);
  return {
    appsCount: props.appsCount ?? '1',
    homeCls: c('home'),
    homeCur: cur('home'),
    finCls: c('financing'),
    finCur: cur('financing'),
    appsCls: c('applications'),
    appsCur: cur('applications'),
    loansCls: c('loans'),
    loansCur: cur('loans'),
    docsCls: c('documents'),
    docsCur: cur('documents'),
  };
}

export default function NavClient(props: NavClientProps) {
  const v = useScreen(props);
  return (
    <nav
      className="kn-side"
      aria-label="Разделы кабинета"
      style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}
    >
      <Link className="kn-brand" to="/b1-home">
        <b>Кредитный кабинет</b>
      </Link>
      <div className="kn-nav">
        <Link className={v.homeCls} to="/b1-home" aria-current={v.homeCur}>
          Главная
        </Link>{' '}
        <Link className={v.finCls} to="/b2-need" aria-current={v.finCur}>
          Финансирование
        </Link>{' '}
        <Link className={v.appsCls} to="/b7-applications" aria-current={v.appsCur}>
          Мои заявки<span className="kn-nav__count">{v.appsCount}</span>
        </Link>{' '}
        <Link className={v.loansCls} to="/b12-loans" aria-current={v.loansCur}>
          Мои кредиты
        </Link>{' '}
        <Link className={v.docsCls} to="/b13-documents" aria-current={v.docsCur}>
          Документы
        </Link>
      </div>
      <div className="kn-side__foot">
        <Link className="kn-demo" to="/a2-demo">
          <Icon name="shield" size={20} /> Режим проверки
        </Link>
      </div>
    </nav>
  );
}
