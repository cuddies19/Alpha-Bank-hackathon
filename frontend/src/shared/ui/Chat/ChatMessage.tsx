import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Chat.module.css';

export interface ChatMessageProps {
  role: 'assistant' | 'user';
  children?: ReactNode;
  time?: string;
  typing?: boolean;
  footer?: ReactNode;
  className?: string;
}

export function ChatMessage({ role, children, time, typing = false, footer, className }: ChatMessageProps) {
  const isAssistant = role === 'assistant';
  return (
    <div className={cx(styles.message, styles[role], className)}>
      {isAssistant ? (
        <span className={styles.avatar} aria-hidden="true">
          <Icon name="sparkle" size={18} />
        </span>
      ) : null}
      <div className={styles.col}>
        <span className="sr-only">{isAssistant ? 'Ассистент:' : 'Вы:'}</span>
        <div className={cx(styles.bubble, isAssistant ? 'body-lg' : 'body')}>
          {typing ? (
            <span className={styles.typing} role="status" aria-label="Ассистент печатает">
              <i />
              <i />
              <i />
            </span>
          ) : (
            children
          )}
        </div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
        {time ? <span className={cx('caption', styles.time)}>{time}</span> : null}
      </div>
    </div>
  );
}

export function QuickReplies({ children }: { children: ReactNode }) {
  return <div className={styles.replies}>{children}</div>;
}
