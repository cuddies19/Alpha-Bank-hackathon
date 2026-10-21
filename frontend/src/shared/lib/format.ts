export const NBSP = ' ';

export function formatNumber(value: number, decimals = 0): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return (value < 0 ? '−' : '') + grouped + (frac ? ',' + frac : '');
}

export function formatMoney(value: number, opts: { currency?: boolean; decimals?: number } = {}): string {
  const { currency = true, decimals = 0 } = opts;
  if (!Number.isFinite(value)) return '';
  const body = formatNumber(value, decimals);
  return currency ? body + NBSP + '₽' : body;
}

export function formatApproxMoney(value: number): string {
  return '≈' + NBSP + formatMoney(value);
}

export function parseMoney(input: string): number {
  const digits = input.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export function formatPercent(value: number, decimals = 1): string {
  return value.toFixed(decimals).replace(/\.0+$/, '').replace('.', ',') + '%';
}

export function formatMonths(value: number): string {
  return value + NBSP + 'мес.';
}

export function formatMonthsLong(value: number): string {
  return value + NBSP + plural(value, ['месяц', 'месяца', 'месяцев']);
}

export function plural(n: number, forms: readonly [one: string, few: string, many: string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const;

export function formatDate(date: Date, opts: { year?: boolean } = {}): string {
  const { year = true } = opts;
  const base = date.getDate() + NBSP + MONTHS_GENITIVE[date.getMonth()];
  return year ? base + ' ' + date.getFullYear() : base;
}
