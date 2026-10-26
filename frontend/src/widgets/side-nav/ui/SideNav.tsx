import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { cx } from '@/shared/lib';
import { Avatar, Icon, IconButton, type IconName } from '@/shared/ui';
import styles from './SideNav.module.css';

export interface SideNavLink {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  alsoActiveOn?: string[];
  count?: number;
  alert?: number;
}

export interface SideNavAction {
  label: string;
  icon: IconName;
  onClick: () => void;
  accent?: boolean;
  pressed?: boolean;
}

export type SideNavItem = SideNavLink | SideNavAction;

export interface SideNavUser {
  initials: string;
  name: string;
  subtitle?: string;
  to?: string;
}

export interface SideNavProps {
  label: string;
  home: string;
  subtitle: string;
  groups: SideNavItem[][];
  pathname: string;
  footer?: ReactNode;
  user: SideNavUser;
  onLogout: () => void;
}

function Badge({ item }: { item: SideNavLink }) {
  if (item.alert) {
    return (
      <span className={cx(styles.count, styles.danger)} aria-label={`проблем: ${item.alert}`}>
        <Icon name="alert" size={14} />
        {item.alert}
      </span>
    );
  }
  return item.count ? <span className={styles.count}>{item.count}</span> : null;
}

export function SideNav({ label, home, subtitle, groups, pathname, footer, user, onLogout }: SideNavProps) {
  const userBody = (
    <>
      <Avatar size="sm">{user.initials}</Avatar>
      <span className={styles.userText}>
        <span className={styles.userName}>{user.name}</span>
        {user.subtitle ? <span className={styles.userSub}>{user.subtitle}</span> : null}
      </span>
    </>
  );

  return (
    <nav className={styles.side} aria-label={label}>
      <Link className={styles.brand} to={home}>
        <span className={styles.brandName}>Кредитный кабинет</span>
        <span className={styles.brandSub}>{subtitle}</span>
      </Link>
      <div className={styles.nav}>
        {groups.map((group, i) => (
          <div key={i} className={styles.nav}>
            {i > 0 ? <span className={styles.divider} aria-hidden="true" /> : null}
            {group.map((item) =>
              'to' in item ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cx(
                      styles.link,
                      (isActive || item.alsoActiveOn?.some((p) => pathname.startsWith(p))) && styles.active,
                    )
                  }
                >
                  <Icon name={item.icon} size={22} className={styles.icon} />
                  {item.label}
                  <Badge item={item} />
                </NavLink>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className={cx(styles.link, item.pressed && styles.active)}
                  aria-pressed={item.pressed}
                  onClick={item.onClick}
                >
                  <Icon name={item.icon} size={22} className={cx(styles.icon, item.accent && styles.accentIcon)} />
                  {item.label}
                </button>
              ),
            )}
          </div>
        ))}
      </div>
      <div className={styles.foot}>
        {footer}
        <div className={styles.userRow}>
          {user.to ? (
            <Link className={styles.user} to={user.to}>
              {userBody}
            </Link>
          ) : (
            <div className={styles.user}>{userBody}</div>
          )}
          <IconButton icon="logout" label="Выйти" size="sm" tone="secondary" onClick={onLogout} />
        </div>
      </div>
    </nav>
  );
}
