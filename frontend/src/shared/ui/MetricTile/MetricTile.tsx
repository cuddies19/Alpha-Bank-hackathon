import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './MetricTile.module.css';

export interface MetricDelta {
  value: string;
  direction: 'up' | 'down';
  tone?: 'success' | 'danger' | 'neutral';
  label?: string;
}

export interface MetricTileProps {
  label: string;
  value: ReactNode;
  icon?: IconName;
  delta?: MetricDelta;
  hint?: ReactNode;
  outlined?: boolean;
  className?: string;
}

export function MetricTile({ label, value, icon, delta, hint, outlined, className }: MetricTileProps) {
  return (
    <div className={cx(styles.metric, outlined && styles.outlined, className)}>
      <div className={styles.top}>
        <span className={cx('body-sm', styles.label)}>{label}</span>
        {icon ? (
          <span className={styles.icon}>
            <Icon name={icon} size={20} />
          </span>
        ) : null}
      </div>
      <div className={cx('amount-lg', styles.value)}>{value}</div>
      {delta ? (
        <div
          className={cx(
            'body-sm',
            styles.delta,
            delta.tone === 'success' && styles.success,
            delta.tone === 'danger' && styles.danger,
          )}
        >
          <Icon name={delta.direction === 'up' ? 'trend-up' : 'trend-down'} size={16} />
          <span className={styles.numeric}>{delta.value}</span>
          {delta.label ? <span className={styles.deltaLabel}>{delta.label}</span> : null}
        </div>
      ) : null}
      {hint ? <div className={cx('body-sm', styles.hint)}>{hint}</div> : null}
    </div>
  );
}
