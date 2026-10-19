import { useCallback, useState } from 'react';

/** Состояние экрана: setState сливает изменения с текущими значениями, как в макете. */
export function useMergeState<S extends object>(initial: S = {} as S) {
  const [state, set] = useState<S>(initial);
  const setState = useCallback((patch: Partial<S>) => set((s) => ({ ...s, ...patch })), []);
  return [state, setState] as const;
}
