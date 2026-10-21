import { useId, type ReactNode } from 'react';
import { cx } from '@/shared/lib';
import styles from './Overlay.module.css';
import { useDialog } from './useDialog';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}

export function Modal(props: ModalProps) {
  return props.open ? <ModalDialog {...props} /> : null;
}

function ModalDialog({ onClose, title, children, actions }: ModalProps) {
  const titleId = useId();
  const dialog = useDialog(onClose);
  return (
    <dialog {...dialog} className={cx(styles.dialog, styles.modal)} aria-labelledby={titleId}>
      <div className={styles.modalBody}>
        <h2 className="title-3" id={titleId}>
          {title}
        </h2>
        {children}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </dialog>
  );
}
