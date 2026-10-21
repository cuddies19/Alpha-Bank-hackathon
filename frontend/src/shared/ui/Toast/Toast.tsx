import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './Toast.module.css';

export type ToastTone = 'success' | 'info' | 'warning';

export interface ToastData {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  action?: { label: string; to: string };
}

const TONE_ICON: Record<ToastTone, IconName> = { success: 'check-circle', info: 'info', warning: 'alert' };

export interface ToastProps extends ToastData {
  onClose?: () => void;
}

export function Toast({ title, description, tone = 'success', action, onClose }: ToastProps) {
  return (
    <div className={cx(styles.toast, tone !== 'success' && styles[tone])} role="status">
      <span className={styles.icon}>
        <Icon name={TONE_ICON[tone]} />
      </span>
      <div className={styles.body}>
        <span className={styles.title}>{title}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
        {action ? (
          <Link className={styles.link} to={action.to} onClick={onClose}>
            {action.label}
          </Link>
        ) : null}
      </div>
      {onClose ? (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть уведомление">
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}

export function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <div className={styles.viewport} aria-live="polite">
      {children}
    </div>
  );
}
