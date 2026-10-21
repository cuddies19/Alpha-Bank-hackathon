import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Toast, ToastViewport, type ToastData } from './Toast';
import { ToastContext } from './context';

const LIFETIME_MS = 6000;

interface Item extends ToastData {
  id: number;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (toast: ToastData) => {
      const id = nextId.current++;
      setItems((list) => [...list, { ...toast, id }]);
      window.setTimeout(() => dismiss(id), LIFETIME_MS);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport>
        {items.map(({ id, ...toast }) => (
          <Toast key={id} {...toast} onClose={() => dismiss(id)} />
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
}
