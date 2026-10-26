import { useId, type ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { IconButton } from '../IconButton';
import styles from './Overlay.module.css';
import { useDialog } from './useDialog';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  closeLabel?: string;
  width?: 'md' | 'lg';
  children?: ReactNode;
  footer?: ReactNode;
}

export function Drawer(props: DrawerProps) {
  return props.open ? <DrawerDialog {...props} /> : null;
}

function DrawerDialog({
  onClose,
  title,
  subtitle,
  leading,
  closeLabel = 'Закрыть',
  width = 'md',
  children,
  footer,
}: DrawerProps) {
  const titleId = useId();
  const dialog = useDialog(onClose);
  return (
    <dialog
      {...dialog}
      className={cx(styles.dialog, styles.drawer, width === 'lg' && styles.wide)}
      aria-labelledby={titleId}
    >
      <div className={styles.drawerBody}>
        <div className={styles.drawerHead}>
          <div className={styles.heading}>
            {leading}
            <div className={styles.titles}>
              <h2 className="title-3" id={titleId}>
                {title}
              </h2>
              {subtitle ? <span className={cx('body-sm', styles.subtitle)}>{subtitle}</span> : null}
            </div>
          </div>
          <IconButton icon="x" label={closeLabel} onClick={onClose} />
        </div>
        <div className={styles.drawerContent}>{children}</div>
        {footer ? <div className={styles.drawerFoot}>{footer}</div> : null}
      </div>
    </dialog>
  );
}
