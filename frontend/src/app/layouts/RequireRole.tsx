import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSession, type Role } from '@/entities/session';
import { ForbiddenPage } from '@/pages/system';
import { routes } from '@/shared/config';

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { persona } = useSession();
  const location = useLocation();
  if (!persona) return <Navigate to={routes.login()} replace state={{ from: location.pathname }} />;
  if (persona.role !== role) return <ForbiddenPage persona={persona} />;
  return children;
}
