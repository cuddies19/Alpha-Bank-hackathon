import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Disclosure.module.css';

export interface DisclosureProps {
  summary: ReactNode;
  defaultOpen?: boolean;
  divided?: boolean;
  children: ReactNode;
  className?: string;
}

export function Disclosure({ summary, defaultOpen, divided, children, className }: DisclosureProps) {
  return (
    <details className={cx(styles.details, divided && styles.divided, className)} open={defaultOpen}>
      <summary className={styles.summary}>
        {summary}
        <span className={styles.chevron}>
          <Icon name="chevron-right" />
        </span>
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
