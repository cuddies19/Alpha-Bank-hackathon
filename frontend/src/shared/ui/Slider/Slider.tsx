import { useId } from 'react';
import { cx } from '@/shared/lib';
import styles from './Slider.module.css';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  valueSize?: 'md' | 'lg';
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = String,
  valueSize = 'md',
  className,
}: SliderProps) {
  const id = useId();
  const clamped = Math.min(max, Math.max(min, value));
  const pct = (((clamped - min) / (max - min)) * 100).toFixed(1) + '%';
  return (
    <div className={cx(styles.slider, className)}>
      <div className={styles.head}>
        <label className="label" htmlFor={id}>
          {label}
        </label>
        <span className={cx(valueSize === 'lg' ? 'amount-lg' : 'amount-md', styles.value)}>{format(value)}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: pct }} />
        <input
          id={id}
          className={styles.input}
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={format(value)}
        />
        <div className={styles.thumb} style={{ left: pct }} />
      </div>
      <div className={cx('caption', styles.scale)} aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
