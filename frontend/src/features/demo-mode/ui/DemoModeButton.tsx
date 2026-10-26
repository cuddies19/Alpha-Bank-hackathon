import { features } from '@/shared/config';
import { cx } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import { useDemoMode } from '../model/context';
import styles from './DemoModeButton.module.css';

interface DemoModeButtonProps {
  floating?: boolean;
  label?: string;
}

export function DemoModeButton(props: DemoModeButtonProps) {
  return features.demo ? <DemoModeTrigger {...props} /> : null;
}

function DemoModeTrigger({ floating, label = 'Режим проверки' }: DemoModeButtonProps) {
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
