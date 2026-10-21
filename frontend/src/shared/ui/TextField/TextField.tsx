import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx, formatMoney } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  suffix?: ReactNode;
  format?: 'text' | 'money';
}

export function TextField({
  label,
  hint,
  error,
  suffix,
  format = 'text',
  id,
  className,
  onChange,
  inputMode,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = fieldId + '-msg';
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (format === 'money') {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
      e.target.value = digits ? formatMoney(Number(digits), { currency: false }) : '';
    }
    onChange?.(e);
  };
  const tail = suffix ?? (format === 'money' ? '₽' : null);
  return (
    <div className={cx(styles.field, error ? styles.invalid : null, className)}>
      <div className={styles.top}>
        <label htmlFor={fieldId} className={cx('label', styles.label)}>
          {label}
        </label>
      </div>
      <div className={styles.control}>
        <input
          id={fieldId}
          {...rest}
          onChange={handleChange}
          inputMode={format === 'money' ? 'numeric' : inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cx(styles.input, format === 'money' && styles.numeric)}
        />
        {tail != null ? (
          <span className={styles.suffix} aria-hidden="true">
            {tail}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={messageId} className={cx('body-sm', styles.message, styles.error)}>
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={cx('body-sm', styles.message)}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FieldLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div className={styles.top}>
      <span className={cx('label', styles.label)} id={id}>
        {children}
      </span>
    </div>
  );
}
