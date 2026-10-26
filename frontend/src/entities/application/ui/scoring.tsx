import { cx } from '@/shared/lib';
import { RISK_BANDS, SCORE_MIN, SCORE_RANGE_LABEL, scorePosition } from '../model/scoreScale';
import type { RiskClass, ScoringFactor } from '../model/types';
import styles from './scoring.module.css';

const COLUMNS = RISK_BANDS.map((band) => `${band.to - band.from}fr`).join(' ');
const BOUNDS = [SCORE_MIN, ...RISK_BANDS.map((band) => band.to)];

export function ScoreScale({ score, riskClass }: { score: number; riskClass: RiskClass }) {
  return (
    <div
      className={styles.score}
      role="img"
      aria-label={`Балл ${score} по шкале ${SCORE_RANGE_LABEL}, класс риска ${riskClass}`}
    >
      <div className={styles.track} style={{ gridTemplateColumns: COLUMNS }}>
        {RISK_BANDS.map((band) => (
          <span key={band.riskClass} className={cx(styles.segment, band.riskClass === riskClass && styles.segmentOn)} />
        ))}
        <span className={styles.marker} style={{ left: `${scorePosition(score)}%` }} />
      </div>
      <div className={cx('caption', styles.labels)} style={{ gridTemplateColumns: COLUMNS }} aria-hidden="true">
        {RISK_BANDS.map((band) => (
          <span key={band.riskClass} className={band.riskClass === riskClass ? styles.labelOn : undefined}>
            {band.riskClass}
          </span>
        ))}
      </div>
      <div className={cx('caption', styles.ends)} aria-hidden="true">
        {BOUNDS.map((bound) => (
          <span key={bound} style={{ left: `${scorePosition(bound)}%` }}>
            {bound}
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
