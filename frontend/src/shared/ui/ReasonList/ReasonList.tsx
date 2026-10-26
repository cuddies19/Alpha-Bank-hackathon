import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './ReasonList.module.css';

export type ReasonTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface Reason {
  text: ReactNode;
  tone?: ReasonTone;
}

const TONE_ICON: Record<ReasonTone, IconName> = {
  success: 'check-circle',
  warning: 'alert',
  danger: 'x-circle',
  info: 'clock',
  neutral: 'chevron-right',
};

export interface ReasonListProps {
  items: Array<Reason | string>;
  marker?: 'check' | 'status';
  roomy?: boolean;
  className?: string;
}

export function ReasonList({ items, marker = 'status', roomy, className }: ReasonListProps) {
  return (
    <ul className={cx(styles.list, roomy && styles.roomy, className)}>
      {items.map((item, i) => {
        const reason = typeof item === 'string' ? { text: item } : item;
        const tone = reason.tone ?? 'success';
        const icon = marker === 'check' && tone === 'success' ? 'check' : TONE_ICON[tone];
        return (
          <li key={i} className={cx('body', styles.item)}>
            <span className={cx(styles.mark, tone !== 'neutral' && styles[tone])}>
              <Icon name={icon} />
            </span>
            <span>{reason.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
