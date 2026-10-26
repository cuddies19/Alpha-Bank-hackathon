import type { ReactNode } from 'react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { useSession, type Persona } from '@/entities/session';
import { routes } from '@/shared/config';
import { Button, ButtonLink, EmptyState } from '@/shared/ui';
import styles from './SystemPage.module.css';

function Screen({ children }: { children: ReactNode }) {
  return (
    <main className={styles.screen}>
      <div className={styles.card}>{children}</div>
    </main>
  );
}

function useHomePath() {
  const { persona } = useSession();
  return persona?.home ?? routes.login();
}

export function NotFoundPage() {
  const home = useHomePath();
  return (
    <Screen>
      <EmptyState
        code="404"
        headingLevel={1}
        title="Такой страницы нет"
        description="Возможно, ссылка устарела. Заявки и документы — в разделах кабинета."
        action={<ButtonLink to={home}>На главную</ButtonLink>}
      />
    </Screen>
  );
}

export function ForbiddenPage({ persona }: { persona: Persona }) {
  const isClient = persona.role === 'client';
  return (
    <Screen>
      <EmptyState
        icon="shield"
        headingLevel={1}
        title={isClient ? 'Этот раздел — для сотрудников банка' : 'Этот раздел — для клиентов'}
        description={
          isClient
            ? `Вы вошли как клиент ${persona.org}. Ваши заявки и решения — в кабинете.`
            : 'Вы вошли как сотрудник банка. Заявки клиентов — в очереди консоли.'
        }
        action={
          <ButtonLink to={isClient ? routes.client.applications() : routes.bank.queue()}>
            {isClient ? 'Вернуться в кабинет' : 'Открыть очередь'}
          </ButtonLink>
        }
      />
    </Screen>
  );
}

export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  return (
    <Screen>
      <EmptyState
        icon="alert"
        headingLevel={1}
        title="Что-то пошло не так"
        description="Страница не открылась из-за ошибки. Обновите её — данные, которые вы ввели, сохранены в черновике."
        action={
          <Button variant="primary" onClick={() => navigate(0)}>
            Обновить страницу
          </Button>
        }
      />
    </Screen>
  );
}
