import type * as React from 'react';

/** «1 500 000 ₽»: неразрывные пробелы между разрядами и перед знаком рубля. */
export declare function formatMoney(value: number | string, opts?: { currency?: boolean; decimals?: number }): string;
/** «13,5%»: десятичная запятая, без пробела перед знаком процента. */
export declare function formatPercent(value: number, decimals?: number): string;

export type IconName =
  | 'sparkle' | 'arrow-up' | 'arrow-down' | 'paperclip' | 'document' | 'upload'
  | 'check' | 'check-circle' | 'clock' | 'alert' | 'info' | 'x' | 'x-circle'
  | 'chevron-right' | 'wallet' | 'calendar' | 'shield' | 'circle' | 'trend-up' | 'trend-down';

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'name'> {
  name: IconName;
  /** px, по умолчанию 20. */
  size?: number;
  /** Подпись для скринридера; без неё иконка декоративная. */
  title?: string;
}
export declare function Icon(props: IconProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary — главное действие, одно на экран. По умолчанию secondary. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: IconName;
}
export declare function Chip(props: ChipProps): React.ReactElement;

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** «мес.», «%». Для format="money" по умолчанию «₽». */
  suffix?: React.ReactNode;
  /** Значение подставил ассистент. */
  prefilled?: boolean;
  /** money — только цифры с группировкой разрядов. */
  format?: 'text' | 'money';
}
export declare function TextField(props: TextFieldProps): React.ReactElement;

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
export interface BadgeProps {
  tone?: Tone;
  /** Своя иконка или false, чтобы убрать иконку тона. */
  icon?: IconName | false;
  children?: React.ReactNode;
  className?: string;
}
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  padding?: 'sm' | 'md' | 'lg';
  /** Тень при наведении; передайте as="button" или as="a". */
  interactive?: boolean;
  /** accent — совет ассистента на мягком фоне. */
  tone?: 'default' | 'accent';
  as?: 'div' | 'section' | 'article' | 'button' | 'a';
  href?: string;
}
export declare function Card(props: CardProps): React.ReactElement;

export interface MetricTileProps {
  label: string;
  value: React.ReactNode;
  icon?: IconName;
  delta?: { value: string; direction: 'up' | 'down'; tone?: 'success' | 'danger' | 'neutral'; label?: string };
  hint?: React.ReactNode;
  className?: string;
}
export declare function MetricTile(props: MetricTileProps): React.ReactElement;

export interface PaymentLoadMeterProps {
  /** Ежемесячный платёж, ₽. */
  payment: number;
  /** Среднемесячный чистый денежный поток по счёту, ₽. */
  cashFlow: number;
  /** Порог «на грани», доля от cashFlow. По умолчанию 0.3 — согласовать с банком. */
  warnAt?: number;
  /** Порог «высокая нагрузка». По умолчанию 0.5 — согласовать с банком. */
  riskAt?: number;
  title?: string;
  className?: string;
}
export declare function PaymentLoadMeter(props: PaymentLoadMeterProps): React.ReactElement;

export interface ProductParam { label: string; value: React.ReactNode }
export interface CardAction { label: string; onClick?: () => void }
export interface ProductCardProps {
  name: string;
  purpose?: string;
  amount: React.ReactNode;
  /** По умолчанию «Лимит». */
  amountLabel?: string;
  params?: ProductParam[];
  /** Факты о бизнесе клиента, на которых основана рекомендация. */
  reasons?: string[];
  recommended?: boolean;
  /** Подпись «Предварительная оценка… Решение принимает банк». По умолчанию true. */
  preliminary?: boolean;
  primaryAction?: CardAction;
  secondaryAction?: CardAction;
  /** Слот под параметрами, обычно PaymentLoadMeter. */
  children?: React.ReactNode;
  className?: string;
}
export declare function ProductCard(props: ProductCardProps): React.ReactElement;

export interface StepperProps {
  steps: Array<{ label: string; description?: string }>;
  /** Индекс текущего шага с нуля. */
  current: number;
  className?: string;
}
export declare function Stepper(props: StepperProps): React.ReactElement;

export type StageStatus = 'done' | 'current' | 'pending' | 'attention' | 'failed';
export interface TrackerStage {
  title: string;
  status: StageStatus;
  time?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}
export interface StatusTrackerProps { stages: TrackerStage[]; className?: string }
export declare function StatusTracker(props: StatusTrackerProps): React.ReactElement;

export interface ChatMessageProps {
  role: 'assistant' | 'user';
  children?: React.ReactNode;
  time?: string;
  typing?: boolean;
  /** Под пузырём: Chip, ProductCard, PaymentLoadMeter. */
  footer?: React.ReactNode;
  className?: string;
}
export declare function ChatMessage(props: ChatMessageProps): React.ReactElement;

export interface ChatComposerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Enter или кнопка; Shift+Enter — перенос строки. */
  onSend?: (value: string) => void;
  /** Показывает кнопку «Прикрепить документ». */
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** По умолчанию дисклеймер ассистента; null — скрыть. */
  hint?: React.ReactNode;
  className?: string;
}
export declare function ChatComposer(props: ChatComposerProps): React.ReactElement;

export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'assistant';
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}
export declare function Alert(props: AlertProps): React.ReactElement;

export type DocStatus = 'uploading' | 'checking' | 'ok' | 'error';
export interface UploadedDoc {
  name: string;
  size?: string;
  status: DocStatus;
  progress?: number;
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
export declare function DocumentUpload(props: DocumentUploadProps): React.ReactElement;

declare global {
  interface Window {
    Cabinet: {
      formatMoney: typeof formatMoney; formatPercent: typeof formatPercent;
      Icon: typeof Icon; Button: typeof Button; Chip: typeof Chip; TextField: typeof TextField;
      Badge: typeof Badge; Card: typeof Card; MetricTile: typeof MetricTile; PaymentLoadMeter: typeof PaymentLoadMeter;
      ProductCard: typeof ProductCard; Stepper: typeof Stepper; StatusTracker: typeof StatusTracker;
      ChatMessage: typeof ChatMessage; ChatComposer: typeof ChatComposer; Alert: typeof Alert; DocumentUpload: typeof DocumentUpload;
    };
  }
}
