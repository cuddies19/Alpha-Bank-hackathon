import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE: Record<AvatarSize, string | undefined> = { xs: styles.xs, sm: styles.sm, md: styles.md36, lg: undefined };

export function Avatar({
  children,
  size = 'lg',
  className,
}: {
  children: ReactNode;
  size?: AvatarSize;
  className?: string;
}) {
  return (
    <span className={cx(styles.avatar, SIZE[size], className)} aria-hidden="true">
      {children}
    </span>
  );
}

const MARK_SIZE = { sm: styles.markSm, base: undefined, md: styles.markMd, lg: styles.markLg } as const;
const MARK_ICON = { sm: 14, base: 16, md: 18, lg: 20 } as const;

export function AssistantMark({ size = 'base', className }: { size?: keyof typeof MARK_SIZE; className?: string }) {
  return (
    <span className={cx(styles.mark, MARK_SIZE[size], className)} aria-hidden="true">
      <Icon name="sparkle" size={MARK_ICON[size]} />
    </span>
  );
}
