import type { ReactNode } from 'react';
import { NavLink, type NavLinkProps } from 'react-router';
import { cx } from '@/shared/lib';
import styles from './Tabs.module.css';

interface TabBarProps {
  label: string;
  as?: 'nav' | 'group';
  flush?: boolean;
  children: ReactNode;
  className?: string;
}

export function TabBar({ label, as = 'group', flush, children, className }: TabBarProps) {
  const cls = cx(styles.bar, flush && styles.flush, className);
  return as === 'nav' ? (
    <nav className={cls} aria-label={label}>
      {children}
    </nav>
  ) : (
    <div className={cls} role="group" aria-label={label}>
      {children}
    </div>
  );
}

function TabExtras({ count, attention }: { count?: number; attention?: boolean }) {
  return (
    <>
      {count !== undefined ? <span className={styles.count}>{count}</span> : null}
      {attention ? <span className={styles.dot} aria-label="Требует внимания" /> : null}
    </>
  );
}

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  count?: number;
  attention?: boolean;
  children: ReactNode;
}

export function TabButton({ active, onClick, count, attention, children }: TabButtonProps) {
  return (
    <button type="button" className={cx(styles.tab, active && styles.active)} aria-pressed={active} onClick={onClick}>
      {children}
      <TabExtras count={count} attention={attention} />
    </button>
  );
}

export interface TabLinkProps extends Omit<NavLinkProps, 'className' | 'children'> {
  count?: number;
  attention?: boolean;
  children: ReactNode;
}

export function TabLink({ count, attention, children, ...rest }: TabLinkProps) {
  return (
    <NavLink {...rest} className={({ isActive }) => cx(styles.tab, isActive && styles.active)}>
      {children}
      <TabExtras count={count} attention={attention} />
    </NavLink>
  );
}
