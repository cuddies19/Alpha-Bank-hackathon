import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Avatar } from '../Avatar';
import styles from './DataDisplay.module.css';

export interface ProgressProps {
  value: number;
  max: number;
  label: string;
}

export function Progress({ value, max, label }: ProgressProps) {
  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <span style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}

export interface StepListProps {
  items: ReactNode[];
  size?: 'xs' | 'sm';
  centered?: boolean;
}

export function StepList({ items, size = 'xs', centered }: StepListProps) {
  return (
    <ol className={styles.steps}>
      {items.map((item, i) => (
        <li key={i} className={cx('body', styles.step, centered && styles.stepCentered)}>
          <Avatar size={size}>{i + 1}</Avatar>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export interface LegendItem {
  label: string;
  color: string;
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className={styles.legend}>
      {items.map((item) => (
        <span key={item.label}>
          <i className={styles.swatch} style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
