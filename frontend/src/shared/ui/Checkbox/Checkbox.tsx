import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  compact?: boolean;
}

export function Checkbox({ checked, onChange, children, compact, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx(styles.row, compact && styles.compact, className)}>
      <input
        type="checkbox"
        className={styles.box}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...rest}
      />
      <span>{children}</span>
    </label>
  );
}

export interface ConsentItemProps {
  title: string;
  text: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  missing?: boolean;
}

export function ConsentItem({ title, text, checked, onChange, missing }: ConsentItemProps) {
  return (
    <div className={cx(styles.consent, missing && styles.missing)}>
      <Checkbox checked={checked} onChange={onChange}>
        {title}
      </Checkbox>
      <details className={styles.details}>
        <summary className={styles.summary}>
          Текст согласия <Icon name="chevron-right" size={16} />
        </summary>
        <p className={styles.text}>{text}</p>
      </details>
    </div>
  );
}
