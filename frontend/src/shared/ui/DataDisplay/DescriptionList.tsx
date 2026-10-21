import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import styles from './DataDisplay.module.css';

export type ValueTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

export interface DescriptionItem {
  term: ReactNode;
  details: ReactNode;
  full?: boolean;
  regular?: boolean;
  tone?: ValueTone;
  valueClassName?: string;
  termIcon?: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  variant?: 'grid' | 'rows';
  divided?: boolean;
  className?: string;
}

export function DescriptionList({ items, variant = 'grid', divided, className }: DescriptionListProps) {
  if (variant === 'rows') {
    return (
      <dl className={cx(styles.rows, className)}>
        {items.map((item, i) => (
          <div key={i} className={styles.row}>
            <dt className={item.termIcon ? styles.termWithIcon : undefined}>
              {item.termIcon}
              {item.term}
            </dt>
            <dd
              className={cx(
                item.regular && styles.regular,
                item.tone && item.tone !== 'default' && styles[item.tone],
                item.valueClassName,
              )}
            >
              {item.details}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className={cx(styles.grid, divided && styles.divided, className)}>
      {items.map((item, i) => (
        <div key={i} className={item.full ? styles.full : undefined}>
          <dt>{item.term}</dt>
          <dd className={cx(item.tone && item.tone !== 'default' && styles[item.tone], item.valueClassName)}>
            {item.details}
          </dd>
        </div>
      ))}
    </dl>
  );
}
