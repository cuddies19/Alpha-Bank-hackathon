import type { CSSProperties } from 'react';
import styles from './Charts.module.css';

export interface HBarItem {
  label: string;
  value: number;
  share: number;
}

export interface HBarListProps {
  items: HBarItem[];
  labelWidth?: number;
}

export function HBarList({ items, labelWidth = 180 }: HBarListProps) {
  return (
    <div className={styles.hbars} style={{ '--hbar-label': `${labelWidth}px` } as CSSProperties}>
      {items.map((item) => (
        <div key={item.label} className={styles.hbar}>
          <span>{item.label}</span>
          <span className={styles.hbarTrack} aria-hidden="true">
            <span style={{ width: `${item.share}%` }} />
          </span>
          <b className={styles.hbarValue}>{item.value}</b>
        </div>
      ))}
    </div>
  );
}
