import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './Badge.module.css';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

const TONE_ICON: Record<Tone, IconName | null> = {
  neutral: null,
  success: 'check-circle',
  warning: 'alert',
  danger: 'x-circle',
  info: 'clock',
  accent: 'sparkle',
};

export interface BadgeProps {
  tone?: Tone;
  icon?: IconName | false;
  children?: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  const name = icon === false ? null : (icon ?? TONE_ICON[tone]);
  return (
    <span className={cx(styles.badge, styles[tone], 'caption', className)}>
      {name ? <Icon name={name} size={14} /> : null}
      {children}
    </span>
  );
}
