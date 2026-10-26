import { Navigate } from 'react-router';
import { useSession } from '@/entities/session';
import { routes } from '@/shared/config';

export function IndexRedirect() {
  const { persona } = useSession();
  return <Navigate to={persona?.home ?? routes.login()} replace />;
}
