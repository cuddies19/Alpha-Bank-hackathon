import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Form.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  large?: boolean;
}

export function Textarea({ label, hideLabel, hint, large, className, id, rows = 3, ...rest }: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={fieldId} className={hideLabel ? 'sr-only' : 'label'}>
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        className={cx(styles.textarea, large && styles.large)}
        aria-describedby={hint ? fieldId + '-hint' : undefined}
        {...rest}
      />
      {hint ? (
        <span id={fieldId + '-hint'} className={cx('body-sm', styles.hint)}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label: string;
  size?: 'sm' | 'md';
}

export function SearchField({ label, size = 'md', className, ...rest }: SearchFieldProps) {
  return (
    <label className={cx(styles.search, size === 'sm' && styles.searchSm, className)}>
      <Icon name="search" size={size === 'sm' ? 16 : 20} />
      <span className="sr-only">{label}</span>
      <input type="search" className={styles.searchInput} {...rest} />
    </label>
  );
}
