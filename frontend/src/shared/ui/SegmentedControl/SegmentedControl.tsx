import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  tag?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
  labelledBy?: string;
  layout?: 'row' | 'grid';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  labelledBy,
  layout = 'row',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cx(styles.seg, layout === 'grid' && styles.grid, className)}
      role="group"
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cx(styles.option, option.value === value && styles.on)}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.tag ? <span className={styles.tag}>{option.tag}</span> : null}
        </button>
      ))}
    </div>
  );
}
