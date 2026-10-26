import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
}

export interface ButtonProps extends ButtonOwnProps, ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export interface ButtonLinkProps extends ButtonOwnProps, LinkProps {}

function buttonClassName(
  { variant = 'secondary', size = 'md', fullWidth }: ButtonOwnProps,
  extra?: string | false,
  className?: string,
) {
  return cx(styles.button, styles[variant], size !== 'md' && styles[size], fullWidth && styles.full, extra, className);
}

function Content({
  size = 'md',
  iconLeft,
  iconRight,
  loading,
  children,
}: Pick<ButtonProps, 'size' | 'iconLeft' | 'iconRight' | 'loading'> & { children?: ReactNode }) {
  const iconSize = size === 'sm' ? 16 : 20;
  return (
    <>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : iconLeft ? (
        <Icon name={iconLeft} size={iconSize} />
      ) : null}
      {children != null ? <span>{children}</span> : null}
      {!loading && iconRight ? <Icon name={iconRight} size={iconSize} /> : null}
    </>
  );
}

export function Button({
  variant,
  size,
  loading = false,
  iconLeft,
  iconRight,
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName({ variant, size, fullWidth }, loading && styles.loading, className)}
    >
      <Content size={size} iconLeft={iconLeft} iconRight={iconRight} loading={loading}>
        {children}
      </Content>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  iconLeft,
  iconRight,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClassName({ variant, size, fullWidth }, false, className)}>
      <Content size={size} iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Content>
    </Link>
  );
}
