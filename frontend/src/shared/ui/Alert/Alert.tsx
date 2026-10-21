import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './Alert.module.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'assistant';

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

const ALERT_ICON: Record<AlertTone, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert',
  danger: 'x-circle',
  assistant: 'sparkle',
};

export function Alert({ tone = 'info', title, children, action, onClose, className }: AlertProps) {
  return (
    <div
      className={cx(styles.alert, tone !== 'info' && styles[tone], className)}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <span className={styles.icon}>
        <Icon name={ALERT_ICON[tone]} size={20} />
      </span>
      <div className={styles.body}>
        {title ? <p className="body-strong">{title}</p> : null}
        {children ? <div className="body-sm">{children}</div> : null}
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
      {onClose ? (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}
