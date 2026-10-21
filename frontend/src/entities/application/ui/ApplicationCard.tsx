import { Link } from 'react-router';
import { cx, formatMoney, formatMonths } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import { clientTodo } from '../lib/status';
import type { Application } from '../model/types';
import { ApplicationStatusBadge } from './badges';
import styles from './ApplicationCard.module.css';

export function ApplicationCard({ application: app, to }: { application: Application; to: string }) {
  const todo = clientTodo(app);
  return (
    <Link className={styles.card} to={to} aria-label={`Заявка № ${app.id}, ${app.productName}`}>
      <div className={styles.top}>
        <span className={cx('label', styles.number)}>№ {app.id}</span>
        <ApplicationStatusBadge application={app} />
      </div>
      <div className={styles.main}>
        <div className={styles.titles}>
          <span className="body-strong">{app.productName}</span>
          <span className={cx('body-sm', styles.meta)}>
            {app.submittedAt ? `Подана ${app.submittedAt.split(',')[0]}` : 'Не отправлена'} · {formatMonths(app.term)}
          </span>
        </div>
        <span className={cx('amount-md', styles.amount)}>{formatMoney(app.amount)}</span>
      </div>
      <div className={styles.todo}>
        <span className={cx('body-sm', styles.todoText)}>{todo === '—' ? 'Действий не требуется' : todo}</span>
        <Icon name="chevron-right" className={styles.chevron} />
      </div>
    </Link>
  );
}
