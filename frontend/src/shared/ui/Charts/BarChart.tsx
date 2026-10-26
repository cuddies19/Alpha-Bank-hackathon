import type { CSSProperties } from 'react';
import { cx } from '@/shared/lib';
import styles from './Charts.module.css';

export interface ChartSeries {
  label: string;
  color: string;
}

export interface ChartGroup {
  label: string;
  values: number[];
}

export interface BarChartProps {
  series: ChartSeries[];
  groups: ChartGroup[];
  max: number;
  ariaLabel: string;
  variant?: 'grid' | 'compact';
  yLabels?: string[];
  xLabels?: string[];
  height?: number;
  className?: string;
}

const pct = (value: number, max: number) => `${Math.min(100, (value / max) * 100).toFixed(2)}%`;

export function BarChart({
  series,
  groups,
  max,
  ariaLabel,
  variant = 'grid',
  yLabels = [],
  xLabels,
  height,
  className,
}: BarChartProps) {
  const style = height ? ({ '--chart-height': `${height}px` } as CSSProperties) : undefined;
  const axis = xLabels ?? groups.map((g) => g.label);

  if (variant === 'compact') {
    return (
      <div role="img" aria-label={ariaLabel} className={className}>
        <div className={cx(styles.compact, series.length === 1 && styles.tight)} style={style}>
          {groups.map((group) => (
            <div key={group.label} className={styles.compactGroup}>
              {group.values.map((value, i) => (
                <span
                  key={series[i]?.label ?? i}
                  className={styles.compactBar}
                  style={{ height: pct(value, max), background: series[i]?.color }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className={cx('caption', styles.compactAxis, xLabels && styles.spread)} aria-hidden="true">
          {axis.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div role="img" aria-label={ariaLabel} className={className}>
      <div className={styles.chart} style={style}>
        {yLabels.map((label, i) => (
          <div
            key={label}
            className={styles.gridLine}
            style={{ top: `${(i / Math.max(1, yLabels.length - 1)) * 100}%` }}
          >
            <span className={cx('caption', styles.gridLabel)}>{label}</span>
          </div>
        ))}
        <div className={styles.bars}>
          {groups.map((group) => (
            <div key={group.label} className={styles.group}>
              {group.values.map((value, i) => (
                <div
                  key={series[i]?.label ?? i}
                  className={styles.bar}
                  style={{ height: pct(value, max), background: series[i]?.color }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={cx('caption', styles.xAxis, axis.length > 8 && styles.denseAxis)} aria-hidden="true">
        {axis.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
