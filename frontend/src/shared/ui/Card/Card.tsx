import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/shared/lib';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  tone?: 'default' | 'accent' | 'muted' | 'outlined' | 'highlighted';
  gap?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: ElementType;
  children?: ReactNode;
}

export function Card({
  padding = 'md',
  interactive,
  tone = 'default',
  gap,
  as: As = 'div',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <As
      {...rest}
      className={cx(
        styles.card,
        styles[padding],
        tone !== 'default' && styles[tone],
        interactive && styles.interactive,
        gap && styles[`gap${gap}`],
        className,
      )}
    >
      {children}
    </As>
  );
}
