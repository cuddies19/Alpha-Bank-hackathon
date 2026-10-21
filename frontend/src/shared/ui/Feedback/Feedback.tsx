import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './Feedback.module.css';

export interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: CSSProperties['borderRadius'];
  onBackground?: boolean;
  still?: boolean;
}

export function Skeleton({ width = '100%', height = 14, radius, onBackground, still }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, onBackground && styles.onBg, still && styles.static)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export interface EmptyStateProps {
  icon?: IconName;
  code?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  headingLevel?: 1 | 2;
}

export function EmptyState({
  icon = 'document',
  code,
  title,
  description,
  action,
  children,
  compact,
  headingLevel = 2,
}: EmptyStateProps) {
  const H = `h${headingLevel}` as const;
  return (
    <div className={cx(styles.empty, compact && styles.compact)}>
      {code ? (
        <span className={cx('amount-xl', styles.code)}>{code}</span>
      ) : (
        <span className={styles.emptyIcon}>
          <Icon name={icon} size={24} />
        </span>
      )}
      <H className="title-3">{title}</H>
      {description ? <p className={cx('body', styles.emptyText)}>{description}</p> : null}
      {children}
      {action}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return <span className={styles.spinner} role={label ? 'status' : undefined} aria-label={label} />;
}

export function IconCircle({
  icon = 'check-circle',
  tone = 'success',
}: {
  icon?: IconName;
  tone?: 'success' | 'info';
}) {
  return (
    <span className={cx(styles.circle, styles[tone])} aria-hidden="true">
      <Icon name={icon} size={32} />
    </span>
  );
}

export interface NoteProps {
  icon?: IconName;
  tone?: 'secondary' | 'warning';
  center?: boolean;
  children: ReactNode;
  className?: string;
}

export function Note({ icon = 'info', tone = 'secondary', center, children, className }: NoteProps) {
  return (
    <p className={cx('body-sm', styles.note, tone === 'warning' && styles.warning, center && styles.center, className)}>
      <Icon name={icon} size={16} />
      <span>{children}</span>
    </p>
  );
}

export interface CalloutProps {
  icon?: IconName;
  variant?: 'muted' | 'dashed';
  children: ReactNode;
  action?: ReactNode;
}

export function Callout({ icon = 'clock', variant = 'muted', children, action }: CalloutProps) {
  return (
    <div className={cx(styles.callout, variant === 'dashed' && styles.dashed)}>
      <Icon name={icon} />
      <div className={cx('body', styles.calloutBody)}>{children}</div>
      {action}
    </div>
  );
}

export function Dot({ tone = 'info', hidden }: { tone?: 'info' | 'success'; hidden?: boolean }) {
  return (
    <span
      className={cx(styles.dot, tone === 'success' && styles.success, hidden && styles.hidden)}
      aria-hidden="true"
    />
  );
}
