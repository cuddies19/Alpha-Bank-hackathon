import { useNavigation } from 'react-router';
import styles from './NavigationProgress.module.css';

export function NavigationProgress() {
  const navigation = useNavigation();
  if (navigation.state === 'idle') return null;
  return <div className={styles.bar} role="progressbar" aria-label="Загружаем страницу" />;
}
