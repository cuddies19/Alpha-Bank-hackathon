import { useId, type ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Badge } from '../Badge';
import { Icon } from '../Icon';
import { ReasonList } from '../ReasonList';
import styles from './ProductCard.module.css';

export interface ProductParam {
  label: string;
  value: ReactNode;
}

const DEFAULT_NOTE = 'Предварительная оценка по данным вашего счёта. Решение принимает банк.';

export interface ProductCardProps {
  name: string;
  purpose?: string;
  amount: ReactNode;
  amountLabel?: string;
  params?: ProductParam[];
  reasons?: string[];
  reasonsTitle?: string;
  recommended?: boolean;
  note?: ReactNode | boolean;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ProductCard({
  name,
  purpose,
  amount,
  amountLabel = 'Лимит',
  params = [],
  reasons = [],
  reasonsTitle = 'Почему подходит',
  recommended = false,
  note = true,
  actions,
  children,
  className,
}: ProductCardProps) {
  const headingId = useId();
  const noteText = note === true ? DEFAULT_NOTE : note || null;
  return (
    <article className={cx(styles.product, recommended && styles.recommended, className)} aria-labelledby={headingId}>
      {recommended ? (
        <div className={styles.flag}>
          <Badge tone="accent">Рекомендуем</Badge>
        </div>
      ) : null}
      <h3 id={headingId} className="title-3">
        {name}
      </h3>
      {purpose ? <p className={cx('body', styles.purpose)}>{purpose}</p> : null}
      <div className={styles.amount}>
        <span className={cx('label', styles.amountLabel)}>{amountLabel}</span>
        <span className={cx('amount-xl', styles.numeric)}>{amount}</span>
      </div>
      {params.length ? (
        <dl className={styles.params}>
          {params.map((p) => (
            <div key={p.label}>
              <dt className={cx('label', styles.paramLabel)}>{p.label}</dt>
              <dd className={cx('amount-md', styles.numeric)}>{p.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children}
      {reasons.length ? (
        <div>
          <p className={cx('body-strong', styles.reasonsTitle)}>{reasonsTitle}</p>
          <ReasonList items={reasons} marker="check" />
        </div>
      ) : null}
      {noteText ? (
        <p className={cx('body-sm', styles.note)}>
          <Icon name="info" size={16} />
          {noteText}
        </p>
      ) : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </article>
  );
}
