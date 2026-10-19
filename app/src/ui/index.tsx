import * as React from 'react';

/* Кредитный кабинет — компоненты. React 18, без зависимостей кроме react.
   Стили: components/bundle.css (классы kk-*), значения — CSS-переменные из tokens.css. */

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ format */

const NBSP = ' ';

/** «1 500 000 ₽». Пробелы — неразрывные, знак рубля через неразрывный пробел. */
export function formatMoney(value: number | string, opts: { currency?: boolean; decimals?: number } = {}): string {
  const { currency = true, decimals = 0 } = opts;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.,-]/g, '').replace(',', '.'));
  if (!isFinite(n) || String(value).trim() === '') return '';
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const body = (n < 0 ? '−' : '') + grouped + (frac ? ',' + frac : '');
  return currency ? body + NBSP + '₽' : body;
}

/** «13,5%» — десятичная запятая, без пробела перед знаком процента. */
export function formatPercent(value: number, decimals = 1): string {
  const s = value.toFixed(decimals).replace(/\.0+$/, '').replace('.', ',');
  return s + '%';
}

/* -------------------------------------------------------------------- Icon */

export type IconName =
  | 'sparkle' | 'arrow-up' | 'arrow-down' | 'paperclip' | 'document' | 'upload'
  | 'check' | 'check-circle' | 'clock' | 'alert' | 'info' | 'x' | 'x-circle'
  | 'chevron-right' | 'wallet' | 'calendar' | 'shield' | 'circle' | 'trend-up' | 'trend-down';

const ICONS: Record<IconName, React.ReactNode> = {
  'sparkle': <g fill="currentColor" stroke="none"><path d="M11 4l1.9 7.1L20 13l-7.1 1.9L11 22l-1.9-7.1L2 13l7.1-1.9z" /><path d="M19 1.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" /></g>,
  'arrow-up': <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />,
  'arrow-down': <path d="M12 5v14M18.5 12.5L12 19l-6.5-6.5" />,
  'paperclip': <path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" />,
  'document': <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  'upload': <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />,
  'check': <path d="M5 12.5l4.5 4.5L19 7.5" />,
  'check-circle': <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.8 2.8L16 10" /></>,
  'clock': <><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>,
  'alert': <path d="M10.3 4.2L2.8 17.5a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0zM12 9.5v4M12 17h.01" />,
  'info': <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.8h.01" /></>,
  'x': <path d="M6 6l12 12M18 6L6 18" />,
  'x-circle': <><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></>,
  'chevron-right': <path d="M9.5 6l6 6-6 6" />,
  'wallet': <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17a1 1 0 0 1 1 1v2" /><path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5zM16 13.5h.01" /></>,
  'calendar': <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  'shield': <path d="M12 3l7 3v5.5c0 4.3-3 7.9-7 9.5-4-1.6-7-5.2-7-9.5V6zM9 12l2 2 4-4" />,
  'circle': <circle cx="12" cy="12" r="9" />,
  'trend-up': <path d="M4 16l5.5-5.5 4 4L20 8M15 8h5v5" />,
  'trend-down': <path d="M4 8l5.5 5.5 4-4L20 16M15 16h5v-5" />,
};

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'name'> {
  name: IconName;
  /** px, по умолчанию 20 (icon-md). */
  size?: number;
  /** Подпись для скринридера. Без неё иконка декоративная (aria-hidden). */
  title?: string;
}

/** Линейная иконка 24×24, обводка 1.75, цвет — currentColor. */
export function Icon({ name, size = 20, title, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      className={cx('kk-icon', className)}
      aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} focusable="false" {...rest}
    >
      {title ? <title>{title}</title> : null}
      {ICONS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ Button */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary — главное действие, не больше одного на экране. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
}

export function Button({
  variant = 'secondary', size = 'md', loading = false, iconLeft, iconRight, fullWidth,
  className, children, disabled, type = 'button', ...rest
}: ButtonProps) {
  const iconSize = size === 'sm' ? 16 : 20;
  return (
    <button
      type={type} {...rest} disabled={disabled || loading} aria-busy={loading || undefined}
      className={cx('kk-btn', 'kk-btn--' + variant, 'kk-btn--' + size, fullWidth && 'kk-btn--full', loading && 'is-loading', className)}
    >
      {loading ? <span className="kk-spinner" aria-hidden="true" /> : iconLeft ? <Icon name={iconLeft} size={iconSize} /> : null}
      {children != null ? <span className="kk-btn__label">{children}</span> : null}
      {!loading && iconRight ? <Icon name={iconRight} size={iconSize} /> : null}
    </button>
  );
}

/* -------------------------------------------------------------------- Chip */

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: IconName;
}

/** Быстрый ответ ассистенту или фильтр. */
export function Chip({ selected = false, icon, className, children, type = 'button', ...rest }: ChipProps) {
  return (
    <button type={type} aria-pressed={selected} {...rest} className={cx('kk-chip', selected && 'is-selected', className)}>
      {icon ? <Icon name={icon} size={16} /> : null}
      <span>{children}</span>
    </button>
  );
}

/* --------------------------------------------------------------- TextField */

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Текст справа в поле: «мес.», «%». Для format="money" по умолчанию «₽». */
  suffix?: React.ReactNode;
  /** Значение подставил ассистент — показывает метку «Заполнено ассистентом». */
  prefilled?: boolean;
  /** money — оставляет только цифры и группирует разряды. */
  format?: 'text' | 'money';
}

export function TextField({
  label, hint, error, suffix, prefilled, format = 'text', id, className, onChange, inputMode, ...rest
}: TextFieldProps) {
  const autoId = React.useId();
  const fid = id || autoId;
  const msgId = fid + '-msg';
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (format === 'money') {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
      e.target.value = digits ? formatMoney(digits, { currency: false }) : '';
    }
    if (onChange) onChange(e);
  };
  const tail = suffix != null ? suffix : format === 'money' ? '₽' : null;
  return (
    <div className={cx('kk-field', error ? 'is-invalid' : null, prefilled && 'is-prefilled', className)}>
      <div className="kk-field__top">
        <label htmlFor={fid} className="kk-field__label label">{label}</label>
        {prefilled ? <span className="kk-field__tag caption"><Icon name="sparkle" size={14} />Заполнено ассистентом</span> : null}
      </div>
      <div className="kk-field__control">
        <input
          id={fid} {...rest} onChange={handle}
          inputMode={format === 'money' ? 'numeric' : inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? msgId : undefined}
          className={cx('kk-field__input', format === 'money' && 'kk-num')}
        />
        {tail != null ? <span className="kk-field__suffix" aria-hidden="true">{tail}</span> : null}
      </div>
      {error
        ? <p id={msgId} className="kk-field__msg kk-field__msg--error body-sm"><Icon name="alert" size={16} />{error}</p>
        : hint ? <p id={msgId} className="kk-field__msg body-sm">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------- Badge */

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

const TONE_ICON: Record<Tone, IconName | null> = {
  neutral: null, success: 'check-circle', warning: 'alert', danger: 'x-circle', info: 'clock', accent: 'sparkle',
};

export interface BadgeProps {
  tone?: Tone;
  /** Своя иконка или false, чтобы убрать иконку тона. */
  icon?: IconName | false;
  children?: React.ReactNode;
  className?: string;
}

/** Статус в одно-два слова. Цвет всегда дублируется иконкой и словом. */
export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  const name = icon === false ? null : icon || TONE_ICON[tone];
  return (
    <span className={cx('kk-badge', 'kk-badge--' + tone, 'caption', className)}>
      {name ? <Icon name={name} size={14} /> : null}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------- Card */

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  padding?: 'sm' | 'md' | 'lg';
  /** Кликабельная карточка: тень при наведении. Передайте as="button" или as="a". */
  interactive?: boolean;
  tone?: 'default' | 'accent';
  as?: 'div' | 'section' | 'article' | 'button' | 'a';
  href?: string;
}

export function Card({ padding = 'md', interactive, tone = 'default', as = 'div', className, children, ...rest }: CardProps) {
  return React.createElement(
    as,
    { ...rest, className: cx('kk-card', 'kk-card--' + padding, tone === 'accent' && 'kk-card--accent', interactive && 'kk-card--interactive', className) },
    children,
  );
}

/* -------------------------------------------------------------- MetricTile */

export interface MetricTileProps {
  label: string;
  value: React.ReactNode;
  icon?: IconName;
  /** Изменение: «+12%» и пояснение «к сентябрю». Тон задаёт цвет, стрелка — направление. */
  delta?: { value: string; direction: 'up' | 'down'; tone?: 'success' | 'danger' | 'neutral'; label?: string };
  hint?: React.ReactNode;
  className?: string;
}

export function MetricTile({ label, value, icon, delta, hint, className }: MetricTileProps) {
  return (
    <div className={cx('kk-metric', className)}>
      <div className="kk-metric__top">
        <span className="kk-metric__label body-sm">{label}</span>
        {icon ? <span className="kk-metric__icon"><Icon name={icon} size={20} /></span> : null}
      </div>
      <div className="kk-metric__value amount-lg kk-num">{value}</div>
      {delta ? (
        <div className={cx('kk-metric__delta', 'body-sm', 'is-' + (delta.tone || 'neutral'))}>
          <Icon name={delta.direction === 'up' ? 'trend-up' : 'trend-down'} size={16} />
          <span className="kk-num">{delta.value}</span>
          {delta.label ? <span className="kk-metric__delta-label">{delta.label}</span> : null}
        </div>
      ) : null}
      {hint ? <div className="kk-metric__hint body-sm">{hint}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------- PaymentLoadMeter */

export interface PaymentLoadMeterProps {
  /** Ежемесячный платёж, ₽. */
  payment: number;
  /** Среднемесячный чистый денежный поток бизнеса по счёту, ₽: поступления минус обязательные платежи. */
  cashFlow: number;
  /** Доля, с которой нагрузка «на грани». Параметр банка, по умолчанию 0.3. */
  warnAt?: number;
  /** Доля, с которой нагрузка «высокая». Параметр банка, по умолчанию 0.5. */
  riskAt?: number;
  title?: string;
  className?: string;
}

/** Показывает платёж как долю от чистого денежного потока бизнеса: шкала, зона словом и иконкой, пояснение. */
export function PaymentLoadMeter({ payment, cashFlow, warnAt = 0.3, riskAt = 0.5, title = 'Нагрузка на бизнес', className }: PaymentLoadMeterProps) {
  const share = cashFlow > 0 ? payment / cashFlow : 1;
  const zone = share < warnAt ? 'safe' : share < riskAt ? 'warn' : 'risk';
  const max = Math.min(1, Math.max(riskAt + 0.2, share + 0.05));
  const pos = (x: number) => Math.min(100, (x / max) * 100) + '%';
  const words = { safe: 'Комфортно', warn: 'На грани', risk: 'Высокая нагрузка' } as const;
  const icons = { safe: 'check-circle', warn: 'alert', risk: 'x-circle' } as const;
  const pct = Math.round(share * 100);
  return (
    <div className={cx('kk-meter', 'is-' + zone, className)}>
      <div className="kk-meter__top">
        <span className="kk-meter__title label">{title}</span>
        <span className="kk-meter__zone body-strong"><Icon name={icons[zone]} size={16} />{words[zone]}</span>
      </div>
      <div
        className="kk-meter__track" role="meter" aria-label={title}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={pct + '% от чистого потока, ' + words[zone].toLowerCase()}
      >
        <span className="kk-meter__fill" style={{ width: pos(share) }} />
        <span className="kk-meter__tick" style={{ left: pos(warnAt) }} />
        <span className="kk-meter__tick" style={{ left: pos(riskAt) }} />
      </div>
      <div className="kk-meter__scale caption" aria-hidden="true">
        <span style={{ left: pos(warnAt) }}>{Math.round(warnAt * 100)}%</span>
        <span style={{ left: pos(riskAt) }}>{Math.round(riskAt * 100)}%</span>
      </div>
      <p className="kk-meter__text body-sm">
        Платёж <b className="kk-num">{formatMoney(payment)}</b> в месяц — <b className="kk-num">{pct}%</b> от среднемесячного чистого потока <span className="kk-num">{formatMoney(cashFlow)}</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- ProductCard */

export interface ProductParam { label: string; value: React.ReactNode }
export interface CardAction { label: string; onClick?: () => void }

export interface ProductCardProps {
  name: string;
  /** Для какой задачи: «На закупки к сезону, берёте частями». */
  purpose?: string;
  amount: React.ReactNode;
  amountLabel?: string;
  params?: ProductParam[];
  /** Почему ассистент рекомендует продукт — факты о бизнесе клиента. */
  reasons?: string[];
  recommended?: boolean;
  /** Подпись о предварительной оценке. По умолчанию включена. */
  preliminary?: boolean;
  primaryAction?: CardAction;
  secondaryAction?: CardAction;
  /** Слот под параметрами — например, PaymentLoadMeter. */
  children?: React.ReactNode;
  className?: string;
}

export function ProductCard({
  name, purpose, amount, amountLabel = 'Лимит', params = [], reasons = [], recommended = false,
  preliminary = true, primaryAction, secondaryAction, children, className,
}: ProductCardProps) {
  const headingId = React.useId();
  return (
    <article className={cx('kk-product', recommended && 'is-recommended', className)} aria-labelledby={headingId}>
      {recommended ? <div className="kk-product__flag"><Badge tone="accent">Рекомендуем</Badge></div> : null}
      <h3 id={headingId} className="kk-product__name title-3">{name}</h3>
      {purpose ? <p className="kk-product__purpose body">{purpose}</p> : null}
      <div className="kk-product__amount">
        <span className="label">{amountLabel}</span>
        <span className="amount-xl kk-num">{amount}</span>
      </div>
      {params.length ? (
        <dl className="kk-product__params">
          {params.map((p, i) => (
            <div key={i} className="kk-product__param">
              <dt className="label">{p.label}</dt>
              <dd className="amount-md kk-num">{p.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children ? <div className="kk-product__slot">{children}</div> : null}
      {reasons.length ? (
        <div className="kk-product__reasons">
          <p className="body-strong">Почему подходит</p>
          <ul>
            {reasons.map((r, i) => <li key={i} className="body"><Icon name="check" size={20} />{r}</li>)}
          </ul>
        </div>
      ) : null}
      {preliminary ? (
        <p className="kk-product__note body-sm"><Icon name="info" size={16} />Предварительная оценка по данным вашего счёта. Решение принимает банк.</p>
      ) : null}
      {primaryAction || secondaryAction ? (
        <div className="kk-product__actions">
          {primaryAction ? <Button variant="primary" onClick={primaryAction.onClick}>{primaryAction.label}</Button> : null}
          {secondaryAction ? <Button variant="ghost" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button> : null}
        </div>
      ) : null}
    </article>
  );
}

/* ----------------------------------------------------------------- Stepper */

export interface StepperProps {
  steps: Array<{ label: string; description?: string }>;
  /** Индекс текущего шага, с нуля. */
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cx('kk-stepper', className)} aria-label={'Шаг ' + (current + 1) + ' из ' + steps.length}>
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li key={i} className={cx('kk-step', 'is-' + state)} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="kk-step__marker kk-num" aria-hidden="true">
              {state === 'done' ? <Icon name="check" size={16} /> : i + 1}
            </span>
            <span className="kk-step__text">
              <span className="kk-step__label body-strong">{s.label}</span>
              {s.description ? <span className="kk-step__desc body-sm">{s.description}</span> : null}
              <span className="kk-sr">{state === 'done' ? ' — готово' : state === 'current' ? ' — текущий шаг' : ''}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ----------------------------------------------------------- StatusTracker */

export type StageStatus = 'done' | 'current' | 'pending' | 'attention' | 'failed';

export interface TrackerStage {
  title: string;
  status: StageStatus;
  /** «Сегодня, 14:20» или «обычно до 2 часов». */
  time?: string;
  description?: React.ReactNode;
  /** Кнопка действия для этапа attention. */
  action?: React.ReactNode;
}

export interface StatusTrackerProps { stages: TrackerStage[]; className?: string }

const STAGE_ICON: Record<StageStatus, IconName> = {
  done: 'check-circle', current: 'clock', pending: 'circle', attention: 'alert', failed: 'x-circle',
};
const STAGE_WORD: Record<StageStatus, string> = {
  done: 'готово', current: 'сейчас', pending: 'впереди', attention: 'нужно ваше действие', failed: 'не пройдено',
};

/** Этапы рассмотрения заявки сверху вниз. */
export function StatusTracker({ stages, className }: StatusTrackerProps) {
  return (
    <ol className={cx('kk-tracker', className)}>
      {stages.map((s, i) => (
        <li key={i} className={cx('kk-stage', 'is-' + s.status)} aria-current={s.status === 'current' ? 'step' : undefined}>
          <span className="kk-stage__rail" aria-hidden="true">
            <span className="kk-stage__icon"><Icon name={STAGE_ICON[s.status]} size={24} /></span>
          </span>
          <div className="kk-stage__body">
            <div className="kk-stage__head">
              <span className="kk-stage__title body-strong">{s.title}<span className="kk-sr"> — {STAGE_WORD[s.status]}</span></span>
              {s.time ? <span className="kk-stage__time body-sm kk-num">{s.time}</span> : null}
            </div>
            {s.description ? <div className="kk-stage__desc body-sm">{s.description}</div> : null}
            {s.action ? <div className="kk-stage__action">{s.action}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------- ChatMessage */

export interface ChatMessageProps {
  role: 'assistant' | 'user';
  children?: React.ReactNode;
  /** «14:20» */
  time?: string;
  /** Ассистент печатает: три точки вместо текста. */
  typing?: boolean;
  /** Слот под пузырём: Chip с быстрыми ответами, ProductCard, PaymentLoadMeter. */
  footer?: React.ReactNode;
  className?: string;
}

export function ChatMessage({ role, children, time, typing = false, footer, className }: ChatMessageProps) {
  const isAssistant = role === 'assistant';
  return (
    <div className={cx('kk-msg', 'kk-msg--' + role, className)}>
      {isAssistant ? <span className="kk-msg__avatar" aria-hidden="true"><Icon name="sparkle" size={18} /></span> : null}
      <div className="kk-msg__col">
        <span className="kk-sr">{isAssistant ? 'Ассистент:' : 'Вы:'}</span>
        <div className={cx('kk-msg__bubble', isAssistant ? 'body-lg' : 'body')}>
          {typing
            ? <span className="kk-typing" role="status" aria-label="Ассистент печатает"><i /><i /><i /></span>
            : children}
        </div>
        {footer ? <div className="kk-msg__footer">{footer}</div> : null}
        {time ? <span className="kk-msg__time caption kk-num">{time}</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ ChatComposer */

export interface ChatComposerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Enter или кнопка отправки. Shift+Enter — перенос строки. */
  onSend?: (value: string) => void;
  /** Показывает кнопку скрепки. */
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Строка под полем, по умолчанию — дисклеймер ассистента. Передайте null, чтобы скрыть. */
  hint?: React.ReactNode;
  className?: string;
}

export function ChatComposer({
  value, defaultValue = '', onChange, onSend, onAttach, placeholder = 'Опишите задачу своими словами',
  disabled = false, hint = 'Ассистент может ошибаться. Решение по кредиту принимает банк.', className,
}: ChatComposerProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const text = value !== undefined ? value : inner;
  const ref = React.useRef<HTMLTextAreaElement>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 132) + 'px';
  }, [text]);
  const set = (v: string) => { if (value === undefined) setInner(v); if (onChange) onChange(v); };
  const send = () => {
    const v = text.trim();
    if (!v || disabled) return;
    if (onSend) onSend(v);
    set('');
  };
  return (
    <div className={cx('kk-composer', disabled && 'is-disabled', className)}>
      <div className="kk-composer__box">
        {onAttach ? (
          <button type="button" className="kk-iconbtn" onClick={onAttach} disabled={disabled} aria-label="Прикрепить документ">
            <Icon name="paperclip" size={20} />
          </button>
        ) : null}
        <textarea
          ref={ref} rows={1} className="kk-composer__input body" value={text} placeholder={placeholder}
          aria-label={placeholder} disabled={disabled}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !(e.nativeEvent as KeyboardEvent).isComposing) { e.preventDefault(); send(); }
          }}
        />
        <button type="button" className="kk-composer__send" onClick={send} disabled={disabled || !text.trim()} aria-label="Отправить">
          <Icon name="arrow-up" size={20} />
        </button>
      </div>
      {hint ? <p className="kk-composer__hint caption">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------- Alert */

export interface AlertProps {
  /** assistant — подсказка ассистента на экране, не системное сообщение. */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'assistant';
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const ALERT_ICON: Record<NonNullable<AlertProps['tone']>, IconName> = {
  info: 'info', success: 'check-circle', warning: 'alert', danger: 'x-circle', assistant: 'sparkle',
};

export function Alert({ tone = 'info', title, children, action, onClose, className }: AlertProps) {
  return (
    <div className={cx('kk-alert', 'kk-alert--' + tone, className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <span className="kk-alert__icon"><Icon name={ALERT_ICON[tone]} size={20} /></span>
      <div className="kk-alert__body">
        {title ? <p className="kk-alert__title body-strong">{title}</p> : null}
        {children ? <div className="kk-alert__text body-sm">{children}</div> : null}
        {action ? <div className="kk-alert__action">{action}</div> : null}
      </div>
      {onClose ? (
        <button type="button" className="kk-iconbtn kk-alert__close" onClick={onClose} aria-label="Закрыть">
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------- DocumentUpload */

export type DocStatus = 'uploading' | 'checking' | 'ok' | 'error';

export interface UploadedDoc {
  name: string;
  /** «1,2 МБ» */
  size?: string;
  status: DocStatus;
  /** 0–100, для uploading. */
  progress?: number;
  /** Пояснение к ошибке: что не так и как исправить. */
  message?: React.ReactNode;
}

export interface DocumentUploadProps {
  label?: string;
  hint?: React.ReactNode;
  files?: UploadedDoc[];
  onFiles?: (files: FileList) => void;
  onRemove?: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

const DOC_BADGE: Record<DocStatus, { tone: Tone; word: string }> = {
  uploading: { tone: 'neutral', word: 'Загружается' },
  checking: { tone: 'info', word: 'Проверяем' },
  ok: { tone: 'success', word: 'Принят' },
  error: { tone: 'danger', word: 'Нужно заменить' },
};

export function DocumentUpload({
  label = 'Перетащите файлы сюда или выберите на компьютере', hint = 'PDF, JPG или PNG до 20 МБ',
  files = [], onFiles, onRemove, accept = '.pdf,.jpg,.jpeg,.png', multiple = true, className,
}: DocumentUploadProps) {
  const [over, setOver] = React.useState(false);
  const inputId = React.useId();
  return (
    <div className={cx('kk-upload', className)}>
      <label
        htmlFor={inputId} className={cx('kk-upload__zone', over && 'is-over')}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (onFiles && e.dataTransfer.files.length) onFiles(e.dataTransfer.files); }}
      >
        <span className="kk-upload__icon"><Icon name="upload" size={24} /></span>
        <span className="kk-upload__label body-strong">{label}</span>
        {hint ? <span className="kk-upload__hint body-sm">{hint}</span> : null}
        <input
          id={inputId} type="file" className="kk-sr" accept={accept} multiple={multiple}
          onChange={(e) => { if (onFiles && e.target.files && e.target.files.length) onFiles(e.target.files); }}
        />
      </label>
      {files.length ? (
        <ul className="kk-upload__list">
          {files.map((f, i) => (
            <li key={i} className={cx('kk-doc', 'is-' + f.status)}>
              <span className="kk-doc__icon"><Icon name="document" size={20} /></span>
              <div className="kk-doc__main">
                <div className="kk-doc__row">
                  <span className="kk-doc__name body">{f.name}</span>
                  <Badge tone={DOC_BADGE[f.status].tone} icon={f.status === 'uploading' ? false : undefined}>
                    {f.status === 'uploading' && f.progress != null ? DOC_BADGE.uploading.word + ' ' + f.progress + '%' : DOC_BADGE[f.status].word}
                  </Badge>
                </div>
                {f.status === 'uploading' ? (
                  <span className="kk-doc__bar" role="progressbar" aria-label={'Загрузка ' + f.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={f.progress || 0}>
                    <span style={{ width: (f.progress || 0) + '%' }} />
                  </span>
                ) : null}
                {f.message ? <p className="kk-doc__msg body-sm">{f.message}</p> : f.size ? <p className="kk-doc__meta body-sm kk-num">{f.size}</p> : null}
              </div>
              {onRemove ? (
                <button type="button" className="kk-iconbtn" onClick={() => onRemove(i)} aria-label={'Удалить ' + f.name}>
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
