const MONTHS = [
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

const SHORT_MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'] as const;

const pad = (n: number) => String(n).padStart(2, '0');

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatClock(value: string | Date): string {
  const d = toDate(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDay(value: string | Date, opts: { year?: boolean } = {}): string {
  const d = toDate(value);
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return opts.year ? `${base} ${d.getFullYear()}` : base;
}

export function formatStamp(value: string | Date): string {
  return `${formatDay(value)}, ${formatClock(value)}`;
}

export function formatRelativeDay(value: string | Date, now = new Date()): string {
  const d = toDate(value);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86_400_000);
  if (diff === 0) return `Сегодня, ${formatDay(d)}`;
  if (diff === 1) return `Вчера, ${formatDay(d)}`;
  return formatDay(d, { year: d.getFullYear() !== now.getFullYear() });
}

export function shortMonth(value: string | Date): string {
  return SHORT_MONTHS[toDate(value).getMonth()];
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseRuDate(text: string, now = new Date()): string | null {
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const match = text.toLowerCase().match(/(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}))?/);
  if (!match) return null;
  const month = MONTHS.findIndex((m) => m.startsWith(match[2].slice(0, 3)));
  if (month < 0) return null;
  const day = Number(match[1]);
  let year = match[3] ? Number(match[3]) : now.getFullYear();
  if (!match[3] && new Date(year, month, day) < new Date(now.getFullYear(), now.getMonth(), now.getDate())) year += 1;
  return toIsoDate(new Date(year, month, day));
}

export function addMonths(value: string | Date, months: number): Date {
  const d = toDate(value);
  return new Date(d.getFullYear(), d.getMonth() + months, d.getDate());
}

export function todayLabel(opts: { year?: boolean } = {}): string {
  return formatDay(new Date(), opts);
}
