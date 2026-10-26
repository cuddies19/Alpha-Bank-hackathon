import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './StatusTracker.module.css';

export type StageStatus = 'done' | 'current' | 'pending' | 'attention' | 'failed';

export interface TrackerStage {
  title: string;
  status: StageStatus;
  time?: string;
  description?: ReactNode;
  action?: ReactNode;
}

export interface StatusTrackerProps {
  stages: TrackerStage[];
  className?: string;
}

const STAGE_ICON: Record<StageStatus, IconName> = {
  done: 'check-circle',
  current: 'clock',
  pending: 'circle',
  attention: 'alert',
  failed: 'x-circle',
};

const STAGE_WORD: Record<StageStatus, string> = {
  done: 'готово',
  current: 'сейчас',
  pending: 'впереди',
  attention: 'нужно ваше действие',
  failed: 'не пройдено',
};

export function StatusTracker({ stages, className }: StatusTrackerProps) {
  return (
    <ol className={className}>
      {stages.map((stage) => (
        <li
          key={stage.title}
          className={cx(styles.stage, styles[stage.status])}
          aria-current={stage.status === 'current' ? 'step' : undefined}
        >
          <span className={styles.rail} aria-hidden="true">
            <span className={styles.icon}>
              <Icon name={STAGE_ICON[stage.status]} size={24} />
            </span>
          </span>
          <div className={styles.body}>
            <div className={styles.head}>
              <span className={cx('body-strong', styles.title)}>
                {stage.title}
                <span className="sr-only"> — {STAGE_WORD[stage.status]}</span>
              </span>
              {stage.time ? <span className={cx('body-sm', styles.time)}>{stage.time}</span> : null}
            </div>
            {stage.description ? <div className={cx('body-sm', styles.description)}>{stage.description}</div> : null}
            {stage.action ? <div className={styles.action}>{stage.action}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
