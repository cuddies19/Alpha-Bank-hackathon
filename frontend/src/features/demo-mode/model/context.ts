import { createContext, useContext } from 'react';

export interface DemoModeValue {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const DemoModeContext = createContext<DemoModeValue | null>(null);

export function useDemoMode(): DemoModeValue {
  const value = useContext(DemoModeContext);
  if (!value) throw new Error('useDemoMode: оберните приложение в <DemoModeProvider>');
  return value;
}
