import { createContext, useContext } from 'react';
import type { Persona } from './types';

export interface SessionValue {
  persona: Persona | null;
  signIn: (persona: Persona) => void;
  signOut: () => void;
}

export const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession: оберните приложение в <SessionProvider>');
  return value;
}

export function useCompanyId(): string {
  const { persona } = useSession();
  if (!persona?.companyId) throw new Error('useCompanyId: нет компании — страница вне кабинета клиента');
  return persona.companyId;
}
