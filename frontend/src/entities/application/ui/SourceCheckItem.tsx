import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Badge, DescriptionList, Icon, type IconName, type Tone } from '@/shared/ui';
import type { CheckStatus, SourceCheck } from '../model/types';
import styles from './SourceCheckItem.module.css';

const VIEW: Record<CheckStatus, { icon: IconName; tone: Tone; word: string }> = {
  ok: { icon: 'check-circle', tone: 'success', word: 'Ок' },
  warn: { icon: 'alert', tone: 'warning', word: 'Внимание' },
  fail: { icon: 'x-circle', tone: 'danger', word: 'Не ответило' },
};

export interface SourceCheckItemProps {
  check: SourceCheck;
  defaultOpen?: boolean;
  children?: ReactNode;
}

export function SourceCheckItem({ check, defaultOpen = true, children }: SourceCheckItemProps) {
  const view = VIEW[check.status];
  return (
    <details className={cx(styles.check, check.status !== 'ok' && styles[check.status])} open={defaultOpen}>
      <summary className={styles.summary}>
        <span className={cx(styles.icon, styles[check.status])}>
          <Icon name={view.icon} size={24} />
        </span>
        <span className={styles.name}>
          <span className="body-strong">{check.name}</span>
          <span className={cx('body-sm', styles.secondary)}>{check.summary}</span>
        </span>
        <span className={styles.time}>{check.time}</span>
        <Badge tone={view.tone}>{view.word}</Badge>
        <span className={styles.chevron}>
          <Icon name="chevron-right" />
        </span>
      </summary>
      <div className={styles.body}>
        <DescriptionList items={check.details} />
        {children}
      </div>
    </details>
  );
}

export function CheckStatusIcon({ status, size = 20 }: { status: CheckStatus; size?: number }) {
  return (
    <span className={cx(styles.icon, styles[status])}>
      <Icon name={VIEW[status].icon} size={size} />
    </span>
  );
}
