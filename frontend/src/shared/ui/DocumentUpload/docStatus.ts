import type { Tone } from '../Badge';

export type DocStatus = 'uploading' | 'checking' | 'ok' | 'error';

export const DOC_STATUS: Record<DocStatus, { tone: Tone; word: string }> = {
  uploading: { tone: 'neutral', word: 'Загружается' },
  checking: { tone: 'info', word: 'Проверяем' },
  ok: { tone: 'success', word: 'Принят' },
  error: { tone: 'danger', word: 'Нужно заменить' },
};
