import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/shared/lib';
import styles from './Layout.module.css';

export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
type Align = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
type Justify = 'start' | 'center' | 'end' | 'between';

const ALIGN: Record<Align, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  baseline: styles.alignBaseline,
  stretch: styles.alignStretch,
};
const JUSTIFY: Record<Justify, string> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
};

interface BoxProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  gap?: Space;
  align?: Align;
  justify?: Justify;
  selfStart?: boolean;
  grow?: boolean;
  children?: ReactNode;
}

function boxClass(base: string, { gap, align, justify, selfStart, grow }: BoxProps, className?: string) {
  return cx(
    base,
    gap !== undefined && styles[`gap${gap}`],
    align && ALIGN[align],
    justify && JUSTIFY[justify],
    selfStart && styles.selfStart,
    grow && styles.grow,
    className,
  );
}

export function Stack({ as: As = 'div', gap = 4, align, justify, selfStart, grow, className, ...rest }: BoxProps) {
  return <As className={boxClass(styles.stack, { gap, align, justify, selfStart, grow }, className)} {...rest} />;
}

export function Cluster({
  as: As = 'div',
  gap = 2,
  align,
  justify,
  selfStart,
  grow,
  nowrap,
  className,
  ...rest
}: BoxProps & { nowrap?: boolean }) {
  return (
    <As
      className={boxClass(
        cx(styles.cluster, nowrap && styles.nowrap),
        { gap, align, justify, selfStart, grow },
        className,
      )}
      {...rest}
    />
  );
}

export interface GridProps extends BoxProps {
  min?: number;
}

export function Grid({ as: As = 'div', gap = 4, min = 240, align, className, style, ...rest }: GridProps) {
  return (
    <As
      className={boxClass(styles.grid, { gap, align }, className)}
      style={{ '--grid-min': `${min}px`, ...style } as CSSProperties}
      {...rest}
    />
  );
}

export function Spacer() {
  return <span className={styles.spacer} aria-hidden="true" />;
}
