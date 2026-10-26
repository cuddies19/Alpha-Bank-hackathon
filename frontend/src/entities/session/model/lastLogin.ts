const LAST_LOGIN_KEY = 'kk-last-login';

export function lastLogin(): string | null {
  try {
    return sessionStorage.getItem(LAST_LOGIN_KEY);
  } catch {
    return null;
  }
}

export function rememberLogin(login: string) {
  try {
    sessionStorage.setItem(LAST_LOGIN_KEY, login);
  } catch {}
}
