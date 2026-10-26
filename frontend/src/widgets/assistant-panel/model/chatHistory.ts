import { useSyncExternalStore } from 'react';

export interface ChatEntry {
  id: number;
  role: 'user' | 'assistant';
  text: string[];
  replies?: Array<{ label: string; to: string }>;
  time: string;
}

const PREFIX = 'kk-chat:';
const LIMIT = 100;
const EMPTY: ChatEntry[] = [];

const cache = new Map<string, ChatEntry[]>();
const listeners = new Set<() => void>();

function load(user: string): ChatEntry[] {
  try {
    const raw = sessionStorage.getItem(PREFIX + user);
    return raw ? (JSON.parse(raw) as ChatEntry[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function read(user: string): ChatEntry[] {
  if (!cache.has(user)) cache.set(user, load(user));
  return cache.get(user) ?? EMPTY;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function appendChatEntry(user: string, entry: ChatEntry) {
  const next = [...read(user), entry].slice(-LIMIT);
  cache.set(user, next);
  try {
    sessionStorage.setItem(PREFIX + user, JSON.stringify(next));
  } catch {}
  emit();
}

export function clearChatHistory() {
  cache.clear();
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {}
  emit();
}

export function useChatHistory(user: string): ChatEntry[] {
  return useSyncExternalStore(subscribe, () => read(user));
}
