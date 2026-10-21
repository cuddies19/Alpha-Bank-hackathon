import { cx } from '@/shared/lib';
import type { RiskClass, ScoringFactor } from '../model/types';
import styles from './scoring.module.css';

const CLASSES: RiskClass[] = ['E', 'D', 'C', 'B', 'A'];
const BOUNDS = [0, 400, 550, 630, 750, 1000];

export function ScoreScale({ score, riskClass }: { score: number; riskClass: RiskClass }) {
  return (
    <div className={styles.score} role="img" aria-label={`Балл ${score} из 1000, класс риска ${riskClass}`}>
      <div className={styles.track}>
        {CLASSES.map((c) => (
          <span key={c} className={cx(styles.segment, c === riskClass && styles.segmentOn)} />
        ))}
        <span className={styles.marker} style={{ left: `${score / 10}%` }} />
      </div>
      <div className={cx('caption', styles.labels)} aria-hidden="true">
        {CLASSES.map((c) => (
          <span key={c} className={c === riskClass ? styles.labelOn : undefined}>
            {c}
          </span>
        ))}
      </div>
      <div className={cx('caption', styles.ends)} aria-hidden="true">
        {BOUNDS.map((b) => (
          <span key={b} style={{ left: `${b / 10}%` }}>
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ScoreFactors({ factors, scale = 50 }: { factors: ScoringFactor[]; scale?: number }) {
  const width = (v: number) => `${Math.min(100, (Math.abs(v) / scale) * 100)}%`;
  return (
    <div className={styles.factors}>
      {factors.map((f) => (
        <div key={f.label} className={styles.factor}>
          <span>{f.label}</span>
          <span className={styles.bar} aria-hidden="true">
            <span className={styles.neg}>{f.value < 0 ? <span style={{ width: width(f.value) }} /> : null}</span>
            <span className={styles.pos}>{f.value > 0 ? <span style={{ width: width(f.value) }} /> : null}</span>
          </span>
          <span className={cx(styles.value, f.value > 0 ? styles.valuePos : styles.valueNeg)}>
            {f.value > 0 ? `+${f.value}` : `−${Math.abs(f.value)}`}
          </span>
        </div>
      ))}
      <div className={cx('caption', styles.axis)} aria-hidden="true">
        <span />
        <span className={styles.axisScale}>
          <span>−{scale}</span>
          <span>0</span>
          <span>+{scale}</span>
        </span>
        <span />
      </div>
    </div>
  );
}
