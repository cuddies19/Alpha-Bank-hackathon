import { NavLink } from 'react-router';
import { cx } from '@/shared/lib';
import { Avatar, Icon, IconButton, IconButtonLink, type IconName } from '@/shared/ui';
import styles from './MobileNav.module.css';

export interface MobileTopBarProps {
  initials: string;
  title: string;
  subtitle: string;
  notificationsTo?: string;
  unread?: number;
  onLogout: () => void;
}

export function MobileTopBar({ initials, title, subtitle, notificationsTo, unread = 0, onLogout }: MobileTopBarProps) {
  return (
    <header className={styles.top}>
      <Avatar size="md" className={styles.avatar}>
        {initials}
      </Avatar>
      <div className={styles.title}>
        <b>{title}</b>
        <span>{subtitle}</span>
      </div>
      {notificationsTo ? (
        <IconButtonLink
          to={notificationsTo}
          icon="bell"
          label={unread ? `Уведомления: ${unread} новых` : 'Уведомления'}
          count={unread}
        />
      ) : null}
      <IconButton icon="logout" label="Выйти" tone="secondary" onClick={onLogout} />
    </header>
  );
}

export interface MobileNavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

export function MobileNav({ items, label }: { items: MobileNavItem[]; label: string }) {
  return (
    <nav className={styles.nav} aria-label={label}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => cx(styles.item, isActive && styles.active)}
        >
          <span className={styles.icon}>
            <Icon name={item.icon} size={22} />
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
