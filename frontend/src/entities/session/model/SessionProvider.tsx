import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { UNAUTHORIZED_EVENT, queryClient } from '@/shared/api';
import { sessionApi } from '../api/sessionApi';
import { rememberLogin } from './lastLogin';
import type { Persona } from './types';
import { SessionContext } from './context';

const STORAGE_KEY = 'kk-session';

function readStored(): Persona | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persona) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona | null>(readStored);

  const signIn = useCallback((next: Persona) => {
    queryClient.clear();
    setPersona(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      rememberLogin(next.login);
    } catch {}
  }, []);

  const signOut = useCallback(() => {
    sessionApi.logout();
    queryClient.removeQueries({ queryKey: ['http-cache'] });
    setPersona(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signOut);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut);
  }, [signOut]);

  const value = useMemo(() => ({ persona, signIn, signOut }), [persona, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
