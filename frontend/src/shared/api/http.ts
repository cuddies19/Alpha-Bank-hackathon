import { ApiError } from './request';

const BASE_URL = '/api';
const TOKEN_KEY = 'kk-token';
export const UNAUTHORIZED_EVENT = 'kk:unauthorized';

export const tokenStorage = {
  get(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null) {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Query;
  body?: unknown;
  form?: FormData;
  auth?: boolean;
}

function buildUrl(path: string, query?: Query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const search = params.toString();
  return `${BASE_URL}${path}${search ? `?${search}` : ''}`;
}

async function readError(response: Response): Promise<ApiError> {
  let message = 'Сервис временно недоступен. Попробуйте ещё раз';
  let code: string | undefined;
  try {
    const data = (await response.json()) as { code?: string; message?: string; detail?: unknown };
    code = data.code;
    if (data.message) message = data.message;
    else if (typeof data.detail === 'string') message = data.detail;
  } catch {}
  return new ApiError(message, response.status, code);
}

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, form, auth = true } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = auth ? tokenStorage.get() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError('Нет связи с сервером. Проверьте подключение', 0, 'network_error');
  }

  if (!response.ok) {
    const error = await readError(response);
    if (response.status === 401 && token) {
      tokenStorage.set(null);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
