import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@/shared/lib';
import { Icon } from '../Icon';
import styles from './Chat.module.css';

export interface ChatComposerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSend?: (value: string) => void;
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
  hint?: ReactNode;
  className?: string;
}

const MAX_HEIGHT = 132;

export function ChatComposer({
  value,
  defaultValue = '',
  onChange,
  onSend,
  onAttach,
  placeholder = 'Опишите задачу своими словами',
  disabled = false,
  hint = 'Ассистент может ошибаться. Решение по кредиту принимает банк.',
  className,
}: ChatComposerProps) {
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + 'px';
  }, [text]);

  const set = (next: string) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    set('');
  };

  return (
    <div className={cx(styles.composer, className)}>
      <div className={styles.box}>
        {onAttach ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onAttach}
            disabled={disabled}
            aria-label="Прикрепить документ"
          >
            <Icon name="paperclip" size={20} />
          </button>
        ) : null}
        <textarea
          ref={ref}
          rows={1}
          className={cx('body', styles.input)}
          value={text}
          placeholder={placeholder}
          aria-label={placeholder}
          disabled={disabled}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          type="button"
          className={styles.send}
          onClick={send}
          disabled={disabled || !text.trim()}
          aria-label="Отправить"
        >
          <Icon name="arrow-up" size={20} />
        </button>
      </div>
      {hint ? <p className={cx('caption', styles.hint)}>{hint}</p> : null}
    </div>
  );
}
