import { useEffect } from 'react';
import { useRouteHandle } from '@/shared/lib';

const APP_NAME = 'Кредитный кабинет';

export function useDocumentTitle() {
  const handle = useRouteHandle();
  useEffect(() => {
    document.title = handle?.title ? `${handle.title} — ${APP_NAME}` : APP_NAME;
  }, [handle?.title]);
}
