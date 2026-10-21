import { cx } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import { useDemoMode } from '../model/context';
import styles from './DemoModeButton.module.css';

export function DemoModeButton({ floating, label = 'Режим проверки' }: { floating?: boolean; label?: string }) {
  const { show } = useDemoMode();
  return (
    <button type="button" className={cx(styles.button, floating && styles.floating)} onClick={show}>
      <Icon name="shield" size={floating ? 16 : 20} />
      {label}
    </button>
  );
}

export function DemoTag({ children }: { children: string }) {
  return <div className={styles.tag}>{children}</div>;
}
