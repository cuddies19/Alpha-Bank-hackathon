import { Icon } from '@/shared/ui';
import styles from './AssistantFab.module.css';

export function AssistantFab({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.fab} aria-label="Открыть ассистента" onClick={onClick}>
      <Icon name="sparkle" size={24} />
    </button>
  );
}
