import { useEffect, useRef, type MouseEvent, type SyntheticEvent } from 'react';

export function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return {
    ref,
    onCancel: (e: SyntheticEvent) => {
      e.preventDefault();
      onClose();
    },
    onClick: (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
  };
}
