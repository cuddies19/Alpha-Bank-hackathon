import { useMemo, useState, type ReactNode } from 'react';
import { features } from '@/shared/config';
import { DemoPanel } from '../ui/DemoPanel';
import { DemoModeContext } from './context';

export function DemoModeProvider({ children }: { children: ReactNode }) {
  return features.demo ? <DemoModeHost>{children}</DemoModeHost> : <>{children}</>;
}

function DemoModeHost({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, show: () => setOpen(true), hide: () => setOpen(false) }), [open]);
  return (
    <DemoModeContext.Provider value={value}>
      {children}
      <DemoPanel open={open} onClose={() => setOpen(false)} />
    </DemoModeContext.Provider>
  );
}
