import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/shared/lib';
import { Icon, type IconName } from '../Icon';
import styles from './Chip.module.css';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: IconName;
}

export function Chip({ selected = false, icon, className, children, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      {...rest}
      className={cx(styles.chip, selected && styles.selected, className)}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      <span>{children}</span>
    </button>
  );
}
