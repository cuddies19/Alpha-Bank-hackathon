import { useEffect, type ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { AppFooter } from './AppFooter';
import styles from './AppShell.module.css';

export interface AppShellProps {
  sidebar: ReactNode;
  mobileHeader?: ReactNode;
  mobileNav?: ReactNode;
  assistant?: ReactNode;
  onAssistantClose?: () => void;
  floating?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  sidebar,
  mobileHeader,
  mobileNav,
  assistant,
  onAssistantClose,
  floating,
  children,
}: AppShellProps) {
  useEffect(() => {
    if (!assistant || !onAssistantClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onAssistantClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [assistant, onAssistantClose]);

  return (
    <div className={styles.shell}>
      <div className={styles.side}>{sidebar}</div>
      <div className={styles.main}>
        {mobileHeader ? <div className={cx(styles.mobileOnly, styles.mobileHeader)}>{mobileHeader}</div> : null}
        <main className={styles.content} id="main">
          {children}
        </main>
        {mobileNav ? <div className={cx(styles.mobileOnly, styles.mobileNav)}>{mobileNav}</div> : null}
      </div>
      {assistant ? <div className={styles.assistant}>{assistant}</div> : null}
      {floating}
    </div>
  );
}
