import { Link } from 'react-router';
import type { AppNotification } from '../model/types';
import { cx } from '@/shared/lib';
import { Dot } from '@/shared/ui';
import styles from './NotificationItem.module.css';

export interface NotificationItemProps {
  notification: AppNotification;
  compact?: boolean;
  onOpen?: (notification: AppNotification) => void;
}

export function NotificationItem({ notification: n, compact, onOpen }: NotificationItemProps) {
  return (
    <Link className={cx(styles.item, n.unread && styles.unread)} to={n.to} onClick={() => onOpen?.(n)}>
      <span className={styles.dot}>
        <Dot hidden={!n.unread} />
      </span>
      <span className={styles.text}>
        {compact ? (
          <>
            <span className={n.unread ? 'body-strong' : 'body'}>{n.title}</span>
            <span className={cx('body-sm', styles.secondary)}>{n.time}</span>
          </>
        ) : (
          <>
            <span className={styles.row}>
              <span className={n.unread ? 'body-strong' : 'body'}>{n.title}</span>
              <time className={cx('body-sm', styles.time)}>{n.time}</time>
            </span>
            <span className={cx('body-sm', styles.secondary)}>{n.text}</span>
          </>
        )}
        {n.unread ? <span className="sr-only">Не прочитано</span> : null}
      </span>
    </Link>
  );
}
