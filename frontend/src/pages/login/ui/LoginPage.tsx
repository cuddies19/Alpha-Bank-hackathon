import { LoginForm } from '@/features/auth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  return (
    <main className={styles.screen}>
      <section className={styles.hero}>
        <div>
          <h1 className={`display ${styles.title}`}>Кредитный кабинет</h1>
          <p className={`body-lg ${styles.lead}`}>
            Финансирование для малого бизнеса: от задачи своими словами до денег на счёте — в одном кабинете.
          </p>
        </div>
      </section>
      <section className={styles.formSide} aria-label="Вход">
        <LoginForm />
      </section>
    </main>
  );
}
