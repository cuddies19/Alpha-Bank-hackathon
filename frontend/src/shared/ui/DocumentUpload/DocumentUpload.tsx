import { useId, useState, type ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Badge } from '../Badge';
import { FileIcon } from '../FileIcon';
import { Icon } from '../Icon';
import { DOC_STATUS, type DocStatus } from './docStatus';
import styles from './DocumentUpload.module.css';

export interface UploadedDoc {
  id: string;
  name: string;
  size?: string;
  status: DocStatus;
  progress?: number;
  message?: ReactNode;
}

export interface DocumentUploadProps {
  label?: string;
  hint?: ReactNode;
  files?: UploadedDoc[];
  onFiles?: (files: FileList) => void;
  onRemove?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function DocumentUpload({
  label = 'Перетащите файлы сюда или выберите на компьютере',
  hint = 'PDF, JPG или PNG до 20 МБ',
  files = [],
  onFiles,
  onRemove,
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = true,
  className,
}: DocumentUploadProps) {
  const [over, setOver] = useState(false);
  const inputId = useId();
  return (
    <div className={cx(styles.upload, className)}>
      <label
        htmlFor={inputId}
        className={cx(styles.zone, over && styles.over)}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) onFiles?.(e.dataTransfer.files);
        }}
      >
        <span className={styles.zoneIcon}>
          <Icon name="upload" size={24} />
        </span>
        <span className="body-strong">{label}</span>
        {hint ? <span className={cx('body-sm', styles.hint)}>{hint}</span> : null}
        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files?.length) onFiles?.(e.target.files);
            e.target.value = '';
          }}
        />
      </label>
      {files.length ? (
        <ul className={styles.list}>
          {files.map((file) => (
            <li key={file.id} className={cx(styles.doc, file.status === 'error' && styles.error)}>
              <FileIcon />
              <div className={styles.main}>
                <div className={styles.row}>
                  <span className={cx('body', styles.name)}>{file.name}</span>
                  <Badge tone={DOC_STATUS[file.status].tone} icon={file.status === 'uploading' ? false : undefined}>
                    {file.status === 'uploading' && file.progress != null
                      ? `${DOC_STATUS.uploading.word} ${file.progress}%`
                      : DOC_STATUS[file.status].word}
                  </Badge>
                </div>
                {file.status === 'uploading' ? (
                  <span
                    className={styles.bar}
                    role="progressbar"
                    aria-label={'Загрузка ' + file.name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={file.progress ?? 0}
                  >
                    <span style={{ width: (file.progress ?? 0) + '%' }} />
                  </span>
                ) : null}
                {file.message ? (
                  <p className={cx('body-sm', styles.message)}>{file.message}</p>
                ) : file.size ? (
                  <p className={cx('body-sm', styles.meta)}>{file.size}</p>
                ) : null}
              </div>
              {onRemove ? (
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => onRemove(file.id)}
                  aria-label={'Удалить ' + file.name}
                >
                  <Icon name="x" size={16} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
