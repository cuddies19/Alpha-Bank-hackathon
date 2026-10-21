import { useCallback, useMemo, useState, type ReactNode } from 'react';
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
    setPersona(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const signOut = useCallback(() => {
    setPersona(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo(() => ({ persona, signIn, signOut }), [persona, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
