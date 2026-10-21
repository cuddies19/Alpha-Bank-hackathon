import styles from './AppFooter.module.css';

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <span>
        <b>Кредитный кабинет</b> · демонстрационная версия
      </span>
      <span>Данные синтетические</span>
    </footer>
  );
}
