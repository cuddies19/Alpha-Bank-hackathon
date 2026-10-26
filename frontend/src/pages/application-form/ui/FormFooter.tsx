import type { ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon, Spinner } from '@/shared/ui';
import styles from './ApplicationFormPage.module.css';

export interface FormFooterProps {
  state: 'saved' | 'saving' | 'offline' | 'sending';
  savedAt?: string;
  blocker?: string;
  children: ReactNode;
}

export function FormFooter({ state, savedAt, blocker, children }: FormFooterProps) {
  return (
    <div className={styles.footer}>
      <span className={cx('body-sm', styles.status)} role="status">
        {state === 'saving' ? (
          <>
            <Spinner />
            Сохраняем черновик
          </>
        ) : state === 'offline' ? (
          <>
            <span className={styles.warn}>
              <Icon name="alert" />
            </span>
            Нет связи — черновик сохранится, когда соединение вернётся
          </>
        ) : state === 'sending' ? (
          'Не закрывайте страницу — это займёт несколько секунд'
        ) : blocker ? (
          <span className={styles.warn}>{blocker}</span>
        ) : (
          <>
            <span className={styles.ok}>
              <Icon name="check-circle" />
            </span>
            Черновик сохранён{savedAt ? ` в ${savedAt}` : ''}
          </>
        )}
      </span>
      {children}
    </div>
  );
}
