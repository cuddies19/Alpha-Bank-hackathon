import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './IconButton.module.css';

interface OwnProps {
  icon: IconName;
  label: string;
  count?: number;
  size?: 'sm' | 'md';
  tone?: 'default' | 'secondary' | 'inverse';
  active?: boolean;
}

function classes({ size = 'md', tone = 'default', active }: Partial<OwnProps>, className?: string) {
  return cx(
    styles.button,
    size === 'sm' && styles.sm,
    tone === 'secondary' && styles.secondaryTone,
    tone === 'inverse' && styles.inverse,
    active && styles.active,
    className,
  );
}

function Inner({ icon, count, size = 'md' }: Pick<OwnProps, 'icon' | 'count' | 'size'>) {
  return (
    <>
      <Icon name={icon} size={size === 'sm' ? 16 : 22} />
      {count ? (
        <span className={styles.count} aria-hidden="true">
          {count}
        </span>
      ) : null}
    </>
  );
}

export interface IconButtonProps extends OwnProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {}

export function IconButton({
  icon,
  label,
  count,
  size,
  tone,
  active,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button type={type} aria-label={label} className={classes({ size, tone, active }, className)} {...rest}>
      <Inner icon={icon} count={count} size={size} />
    </button>
  );
}

export interface IconButtonLinkProps extends OwnProps, Omit<LinkProps, 'children'> {}

export function IconButtonLink({ icon, label, count, size, tone, active, className, ...rest }: IconButtonLinkProps) {
  return (
    <Link aria-label={label} className={classes({ size, tone, active }, className)} {...rest}>
      <Inner icon={icon} count={count} size={size} />
    </Link>
  );
}
