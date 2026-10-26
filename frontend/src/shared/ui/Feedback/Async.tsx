import type { ReactNode } from 'react';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Skeleton } from './Feedback';
import styles from './Async.module.css';

export interface ErrorStateProps {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = 'Нет связи с сервером' }: ErrorStateProps) {
  const message =
    error instanceof Error && error.name === 'ApiError'
      ? error.message
      : 'Проверьте интернет и повторите — данные, которые вы ввели, сохранены.';
  return (
    <Alert
      tone="danger"
      title={title}
      action={
        onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Повторить
          </Button>
        ) : undefined
      }
    >
      <p>{message}</p>
    </Alert>
  );
}

export interface QueryLike<T> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

export interface AsyncContentProps<T> {
  query: QueryLike<T>;
  skeleton?: ReactNode;
  children: (data: T) => ReactNode;
}

export function AsyncContent<T>({ query, skeleton = <PageSkeleton />, children }: AsyncContentProps<T>) {
  if (query.isPending) {
    return (
      <div aria-busy="true" aria-label="Загружаем данные">
        {skeleton}
      </div>
    );
  }
  if (query.isError || query.data === undefined) {
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }
  return <>{children(query.data)}</>;
}

export function PageSkeleton({ tiles = 4 }: { tiles?: number }) {
  return (
    <div className={styles.page}>
      <Skeleton width="60%" height={40} onBackground />
      <Skeleton width="40%" height={16} onBackground />
      {tiles ? (
        <div className={styles.cards}>
          {Array.from({ length: tiles }, (_, i) => (
            <div key={i} className={styles.card}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="80%" height={28} />
            </div>
          ))}
        </div>
      ) : null}
      <div className={styles.card}>
        <Skeleton width="45%" height={20} />
        <Skeleton height={12} />
        <Skeleton height={12} />
        <Skeleton width="70%" height={12} />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={styles.table}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.row}>
          <Skeleton width={96} height={14} />
          <Skeleton width={`${60 + ((i * 17) % 35)}%`} height={14} />
          <Skeleton width={80} height={14} />
          <Skeleton width={70} height={22} radius={9999} />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className={styles.card}>
      <Skeleton width="45%" height={20} />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '70%' : '100%'} height={12} />
      ))}
    </div>
  );
}
