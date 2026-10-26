import { Icon, type IconName } from '../Icon';
import styles from './FileIcon.module.css';

export function FileIcon({ icon = 'document' }: { icon?: IconName }) {
  return (
    <span className={styles.file} aria-hidden="true">
      <Icon name={icon} size={20} />
    </span>
  );
}
