import { useId, useState, type ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './ExpandableCard.module.css';

export interface ExpandableCardProps {
  title: ReactNode;
  aside?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  tone?: 'default' | 'highlighted' | 'muted';
  children: ReactNode;
}

export function ExpandableCard({ title, aside, meta, footer, tone = 'default', children }: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const chevron = <Icon name="chevron-down" size={18} className={styles.chevron} />;
  return (
    <article className={cx(styles.card, tone !== 'default' && styles[tone], expanded && styles.expanded)}>
      <button
        type="button"
        className={styles.summary}
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={styles.row}>
          <span className={cx('body-strong', styles.title)}>{title}</span>
          {aside ? <span className={styles.aside}>{aside}</span> : null}
          {!meta && !footer ? chevron : null}
        </span>
        {meta ? (
          <span className={styles.row}>
            <span className={cx('body-sm', styles.meta)}>{meta}</span>
            {!footer ? chevron : null}
          </span>
        ) : null}
        {footer ? (
          <span className={styles.row}>
            <span className={styles.footer}>{footer}</span>
            {chevron}
          </span>
        ) : null}
      </button>
      {expanded ? (
        <div id={detailsId} className={styles.details}>
          <span className={styles.divider} />
          {children}
        </div>
      ) : null}
    </article>
  );
}

export function CardList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.list, className)}>{children}</div>;
}
