import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './DataDisplay.module.css';

export interface FeedEntry {
  id: string;
  text: ReactNode;
  detail?: ReactNode;
  time: string;
  icon?: IconName;
  accent?: boolean;
  aside?: ReactNode;
}

export interface FeedProps {
  items: FeedEntry[];
  timeFirst?: boolean;
}

export function Feed({ items, timeFirst }: FeedProps) {
  return (
    <ul className={styles.feed}>
      {items.map((item) => (
        <li key={item.id} className={cx(styles.feedItem, timeFirst && styles.timeFirst)}>
          {timeFirst ? (
            <time className={styles.feedTime}>{item.time}</time>
          ) : (
            <span className={cx(styles.feedIcon, item.accent && styles.accent)}>
              <Icon name={item.icon ?? 'check'} />
            </span>
          )}
          <span className={styles.feedText}>
            <span className="body">{item.text}</span>
            {item.detail ? <span className={cx('body-sm', styles.secondary)}>{item.detail}</span> : null}
          </span>
          {timeFirst ? item.aside : <time className={styles.feedTime}>{item.time}</time>}
        </li>
      ))}
    </ul>
  );
}
