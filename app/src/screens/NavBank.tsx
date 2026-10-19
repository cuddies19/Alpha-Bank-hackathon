// Навигация банка — перенесено из макета «Кредитный кабинет — макет» (NavBank.dc.html)
import { Link } from 'react-router-dom';
import { Icon } from '../ui';
import type { ScreenValues } from '../lib/screen';

export interface NavBankProps {
  active?: 'queue' | 'pipeline' | 'integrations' | 'audit' | 'rules' | 'none';
  sourceDown?: boolean;
}

function useScreen(props: NavBankProps): ScreenValues {
  const a = props.active ?? 'queue';
  const c = (k) => 'kn-nav__link' + (a === k ? ' is-active' : '');
  const cur = (k) => (a === k ? 'page' : undefined);
  return {
    showFail: props.sourceDown ?? true,
    queueCls: c('queue'),
    queueCur: cur('queue'),
    pipeCls: c('pipeline'),
    pipeCur: cur('pipeline'),
    intCls: c('integrations'),
    intCur: cur('integrations'),
    auditCls: c('audit'),
    auditCur: cur('audit'),
    rulesCls: c('rules'),
    rulesCur: cur('rules'),
  };
}

export default function NavBank(props: NavBankProps) {
  const v = useScreen(props);
  return (
    <nav
      className="kn-side"
      aria-label="Разделы консоли"
      style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}
    >
      <Link className="kn-brand" to="/c1-queue">
        <b>Кредитный кабинет</b>
        <span>Консоль кредитного аналитика</span>
      </Link>
      <div className="kn-nav">
        <Link className={v.queueCls} to="/c1-queue" aria-current={v.queueCur}>
          Очередь заявок<span className="kn-nav__count">7</span>
        </Link>{' '}
        <Link className={v.pipeCls} to="/c4-pipeline" aria-current={v.pipeCur}>
          Конвейер
        </Link>{' '}
        <Link className={v.intCls} to="/c5-integrations" aria-current={v.intCur}>
          Внешние источники
          {v.showFail ? (
            <>
              <span className="kn-nav__count is-danger">
                <Icon name="alert" size={14} />1
              </span>
            </>
          ) : null}
        </Link>{' '}
        <Link className={v.auditCls} to="/c6-audit" aria-current={v.auditCur}>
          Журнал аудита
        </Link>{' '}
        <Link className={v.rulesCls} to="/c7-rules" aria-current={v.rulesCur}>
          Продукты и правила
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
