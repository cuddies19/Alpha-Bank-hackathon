import { cx, formatMoney } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './PaymentLoadMeter.module.css';

export interface PaymentLoadMeterProps {
  payment: number;
  cashFlow: number;
  warnAt?: number;
  riskAt?: number;
  title?: string;
  className?: string;
}

const WORDS = { safe: 'Комфортно', warn: 'На грани', risk: 'Высокая нагрузка' } as const;
const ICONS = { safe: 'check-circle', warn: 'alert', risk: 'x-circle' } as const;

export function PaymentLoadMeter({
  payment,
  cashFlow,
  warnAt = 0.3,
  riskAt = 0.5,
  title = 'Нагрузка на бизнес',
  className,
}: PaymentLoadMeterProps) {
  const share = cashFlow > 0 ? payment / cashFlow : 1;
  const zone = share < warnAt ? 'safe' : share < riskAt ? 'warn' : 'risk';
  const max = Math.min(1, Math.max(riskAt + 0.2, share + 0.05));
  const pos = (x: number) => Math.min(100, (x / max) * 100) + '%';
  const pct = Math.round(share * 100);
  return (
    <div className={cx(styles.meter, zone !== 'safe' && styles[zone], className)}>
      <div className={styles.top}>
        <span className={cx('label', styles.title)}>{title}</span>
        <span className={cx('body-strong', styles.zone)}>
          <Icon name={ICONS[zone]} size={16} />
          {WORDS[zone]}
        </span>
      </div>
      <div
        className={styles.track}
        role="meter"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}% от чистого потока, ${WORDS[zone].toLowerCase()}`}
      >
        <span className={styles.fill} style={{ width: pos(share) }} />
        <span className={styles.tick} style={{ left: pos(warnAt) }} />
        <span className={styles.tick} style={{ left: pos(riskAt) }} />
      </div>
      <div className={cx('caption', styles.scale)} aria-hidden="true">
        <span style={{ left: pos(warnAt) }}>{Math.round(warnAt * 100)}%</span>
        <span style={{ left: pos(riskAt) }}>{Math.round(riskAt * 100)}%</span>
      </div>
      <p className={cx('body-sm', styles.text)}>
        Платёж <b className={styles.numeric}>{formatMoney(payment)}</b> в месяц —{' '}
        <b className={styles.numeric}>{pct}%</b> от среднемесячного чистого потока{' '}
        <span className={styles.numeric}>{formatMoney(cashFlow)}</span>
      </p>
    </div>
  );
}
