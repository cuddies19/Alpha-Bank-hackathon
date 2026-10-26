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
  onFiles?: (files: File[]) => void;
  onRemove?: (id: string) => void;
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  className?: string;
}

function fileProblem(file: File, extensions: string[], maxSizeMb: number): string | null {
  const extension = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  if (!extensions.includes(extension)) return `${file.name}: такой формат не подходит`;
  if (file.size > maxSizeMb * 1024 * 1024) return `${file.name}: файл больше ${maxSizeMb} МБ`;
  return null;
}

export function DocumentUpload({
  label = 'Перетащите файлы сюда или выберите на компьютере',
  hint = 'PDF, JPG или PNG до 10 МБ',
  files = [],
  onFiles,
  onRemove,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMb = 10,
  multiple = true,
  className,
}: DocumentUploadProps) {
  const [over, setOver] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const inputId = useId();
  const extensions = accept.split(',').map((ext) => ext.trim().toLowerCase());

  const take = (list: FileList) => {
    const all = Array.from(list);
    const found = all.map((file) => fileProblem(file, extensions, maxSizeMb));
    setProblems(found.filter((problem): problem is string => problem !== null));
    const valid = all.filter((_, index) => found[index] === null);
    if (valid.length) onFiles?.(valid);
  };
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
          if (e.dataTransfer.files.length) take(e.dataTransfer.files);
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
            if (e.target.files?.length) take(e.target.files);
            e.target.value = '';
          }}
        />
      </label>
      {problems.length ? (
        <div className={cx('body-sm', styles.problems)} role="alert">
          {problems.map((problem) => (
            <p key={problem}>{problem}</p>
          ))}
        </div>
      ) : null}
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
