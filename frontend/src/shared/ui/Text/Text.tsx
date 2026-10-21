import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './Text.module.css';

export type TextVariant =
  | 'display'
  | 'title-1'
  | 'title-2'
  | 'title-3'
  | 'body-lg'
  | 'body'
  | 'body-strong'
  | 'body-sm'
  | 'label'
  | 'caption'
  | 'amount-xl'
  | 'amount-lg'
  | 'amount-md';

export type TextTone = 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'inherit';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TextVariant;
  tone?: TextTone;
  numeric?: boolean;
  icon?: IconName;
  iconSize?: number;
  regular?: boolean;
  htmlFor?: string;
  dateTime?: string;
  children?: ReactNode;
}

export function Text({
  as: As = 'p',
  variant = 'body',
  tone = 'default',
  numeric,
  icon,
  iconSize = 16,
  regular,
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <As
      className={cx(
        variant,
        tone !== 'default' && styles[tone],
        numeric && styles.numeric,
        icon && styles.withIcon,
        regular && styles.regular,
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
    </As>
  );
}

export interface HeadingProps extends Omit<TextProps, 'as'> {
  level?: 1 | 2 | 3 | 4;
}

const LEVEL_VARIANT: Record<NonNullable<HeadingProps['level']>, TextVariant> = {
  1: 'title-1',
  2: 'title-3',
  3: 'title-3',
  4: 'body-strong',
};

export function Heading({ level = 2, variant, ...rest }: HeadingProps) {
  return <Text as={`h${level}`} variant={variant ?? LEVEL_VARIANT[level]} {...rest} />;
}

export function Amount({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(styles.numeric, className)}>{children}</span>;
}
