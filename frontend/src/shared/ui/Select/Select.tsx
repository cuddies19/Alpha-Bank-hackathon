import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  inline?: boolean;
  className?: string;
}

export function Select({ label, options, value, onChange, size = 'md', inline, className }: SelectProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const [active, setActive] = useState(selectedIndex);
  const current = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, listId]);

  const show = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cx(styles.field, inline && styles.inline, size === 'sm' && styles.sm, open && styles.open, className)}
    >
      <span id={labelId} className={cx('label', inline && styles.labelSecondary)}>
        {label}
      </span>
      <div className={styles.anchor}>
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          className={styles.trigger}
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${listId}-${active}` : undefined}
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={onKeyDown}
        >
          <span className={styles.value}>{current?.label}</span>
          <Icon name="chevron-down" size={size === 'sm' ? 16 : 20} className={styles.chevron} />
        </button>
        {open ? (
          <ul id={listId} role="listbox" aria-labelledby={labelId} className={styles.list}>
            {options.map((option, i) => (
              <li
                key={option.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={option.value === value}
                className={cx(styles.option, i === active && styles.active, option.value === value && styles.selected)}
                onPointerEnter={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
              >
                {option.label}
                {option.value === value ? <Icon name="check" size={16} className={styles.check} /> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
