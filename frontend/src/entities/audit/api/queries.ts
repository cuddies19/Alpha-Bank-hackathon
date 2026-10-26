import { useQuery } from '@tanstack/react-query';
import type { Dto } from '@/shared/api';
import { cachedGet, http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import { formatDay, formatMoney, formatMonths, formatPercent, formatStamp } from '@/shared/lib';
import * as server from '@/mocks/server';
import type { AuditActor, AuditEvent, AuditField, AuditKind, AuditTone } from '../model/types';

const ACTOR: Record<Dto.ActorType, AuditActor> = { client: 'client', system: 'system', underwriter: 'staff' };
const ROLE: Record<Dto.ActorType, string> = { client: 'Клиент', system: 'Система', underwriter: 'Сотрудник' };

const ACTION: Record<string, string> = {
  application_created: 'Черновик создан',
  application_updated: 'Черновик изменён',
  application_taken: 'Взята в работу',
  decision_made: 'Решение принято',
  document_uploaded: 'Документ загружен',
  status_changed: 'Статус изменён',
};

const KIND: Record<string, AuditKind> = {
  application_created: 'created',
  application_updated: 'updated',
  application_taken: 'taken',
  decision_made: 'decision',
  document_uploaded: 'document',
  status_changed: 'status',
};

const STATUS_TONE: Record<string, AuditTone> = {
  draft: 'neutral',
  submitted: 'info',
  processing: 'info',
  manual_review: 'info',
  client_action: 'warning',
  approved: 'success',
  counter_offer: 'warning',
  rejected: 'danger',
  signing: 'info',
  signed: 'success',
  issued: 'success',
  client_declined: 'neutral',
  withdrawn: 'neutral',
};

const OUTCOME_TONE: Record<string, AuditTone> = {
  approve: 'success',
  counter: 'warning',
  request: 'info',
  decline: 'danger',
};

const LONG_TEXT = 60;

function toneOf(key: string, value: unknown): AuditTone | undefined {
  if (value === null || value === undefined) return undefined;
  if (key === 'status') return STATUS_TONE[String(value)];
  if (key === 'outcome') return OUTCOME_TONE[String(value)];
  return undefined;
}

const FIELD: Record<string, string> = {
  number: 'Номер заявки',
  product_id: 'Продукт',
  amount: 'Сумма',
  term_months: 'Срок',
  rate: 'Ставка',
  purpose: 'Цель',
  needed_by: 'Деньги нужны к',
  repayment_source: 'Источник возврата',
  status: 'Статус',
  taken_by: 'Исполнитель',
  outcome: 'Решение',
  requested_documents: 'Запрошенные документы',
  client_message: 'Сообщение клиенту',
  decline_reason: 'Причина отказа',
  internal_comment: 'Внутренний комментарий',
  comment: 'Комментарий',
  reason: 'Причина',
  doc_type: 'Тип документа',
  filename: 'Файл',
  size_bytes: 'Размер',
  mime_type: 'Формат',
  labels: 'Метки',
};

const CONSENT: Record<string, string> = {
  personal_data: 'Согласие на обработку данных',
  bki_request: 'Согласие на запрос в БКИ',
  terms: 'Согласие с условиями',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Черновик',
  submitted: 'Подана',
  processing: 'Проверяем данные',
  manual_review: 'Ручное рассмотрение',
  client_action: 'Ждёт клиента',
  approved: 'Одобрено',
  counter_offer: 'Встречное предложение',
  rejected: 'Отказ',
  signing: 'Подписание',
  signed: 'Подписано',
  issued: 'Выдано',
  client_declined: 'Клиент отказался',
  withdrawn: 'Отозвана',
};

const OUTCOME: Record<string, string> = {
  approve: 'Одобрить',
  counter: 'Встречное предложение',
  request: 'Запросить данные',
  decline: 'Отказать',
};

const DOC_TYPE: Record<string, string> = {
  bs: 'Бухгалтерская отчётность',
  stmt: 'Выписка из другого банка',
  supply: 'Договор поставки',
  other: 'Другой документ',
};

type Snapshot = Record<string, unknown> | null | undefined;

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

function show(key: string, value: unknown, products: Map<number, string>): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (Array.isArray(value)) {
    if (!value.length) return undefined;
    return value
      .map((v) => (key === 'requested_documents' ? (DOC_TYPE[String(v)] ?? String(v)) : String(v)))
      .join(', ');
  }
  switch (key) {
    case 'status':
      return STATUS_LABEL[String(value)] ?? String(value);
    case 'outcome':
      return OUTCOME[String(value)] ?? String(value);
    case 'doc_type':
      return DOC_TYPE[String(value)] ?? String(value);
    case 'product_id':
      return products.get(Number(value)) ?? `№ ${value}`;
    case 'amount':
      return formatMoney(Number(value));
    case 'term_months':
      return formatMonths(Number(value));
    case 'rate':
      return formatPercent(Number(value));
    case 'mime_type':
      return String(value).split('/').pop()?.toUpperCase();
    case 'size_bytes':
      return formatSize(Number(value));
    case 'needed_by':
      return formatDay(String(value), { year: true });
    default:
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
}

function consentFields(before: Snapshot, after: Snapshot): AuditField[] {
  const was = (before?.consents ?? {}) as Record<string, unknown>;
  const now = (after?.consents ?? {}) as Record<string, unknown>;
  const word = (v: unknown) => (v === true ? 'дано' : v === false ? 'отозвано' : undefined);
  const tone = (v: unknown): AuditTone | undefined => (v === true ? 'success' : v === false ? 'danger' : undefined);
  return [...new Set([...Object.keys(was), ...Object.keys(now)])]
    .filter((key) => was[key] !== now[key])
    .map((key) => ({
      label: CONSENT[key] ?? key,
      before: word(was[key]),
      after: word(now[key]),
      beforeTone: tone(was[key]),
      afterTone: tone(now[key]),
    }));
}

function buildDetails(before: Snapshot, after: Snapshot, products: Map<number, string>): AuditField[] {
  const normalize = (snapshot: Snapshot) => {
    if (!snapshot) return snapshot;
    const copy: Record<string, unknown> = { ...snapshot };
    if ('taken_by_id' in copy || 'taken_by_name' in copy) copy.taken_by = copy.taken_by_name ?? null;
    return copy;
  };
  const b = normalize(before);
  const a = normalize(after);
  const keys = [...new Set([...Object.keys(b ?? {}), ...Object.keys(a ?? {})])].filter(
    (k) =>
      k !== 'consents' && !k.endsWith('_label') && (!k.endsWith('_id') || k === 'product_id') && k !== 'taken_by_name',
  );
  const fields: AuditField[] = [];
  for (const key of keys) {
    const was = b && key in b ? show(key, b[key], products) : undefined;
    const now = a && key in a ? show(key, a[key], products) : undefined;
    if (was === undefined && now === undefined) continue;
    if (b && a && key in b && key in a && was === now) continue;
    fields.push({
      label: FIELD[key] ?? key,
      before: was,
      after: now,
      beforeTone: b && key in b ? toneOf(key, b[key]) : undefined,
      afterTone: a && key in a ? toneOf(key, a[key]) : undefined,
      long: (was?.length ?? 0) > LONG_TEXT || (now?.length ?? 0) > LONG_TEXT,
    });
  }
  return [...fields, ...consentFields(before, after)];
}

function summary(fields: AuditField[]) {
  return fields.map((f) => `${f.label}: ${f.before !== undefined ? `${f.before} → ` : ''}${f.after ?? '—'}`).join('; ');
}

function toEvent(dto: Dto.AuditItemOut, products: Map<number, string>): AuditEvent {
  const details = buildDetails(dto.before, dto.after, products);
  return {
    id: String(dto.id),
    kind: KIND[dto.action] ?? 'other',
    time: formatStamp(dto.created_at),
    who: dto.actor_name,
    role: ROLE[dto.actor_type],
    actor: ACTOR[dto.actor_type],
    applicationId: dto.application_number ?? '—',
    applicationRef: dto.application_id ? String(dto.application_id) : undefined,
    action: ACTION[dto.action] ?? dto.action,
    change: summary(details) || '—',
    details,
  };
}

async function listApiAudit() {
  const [audit, products] = await Promise.all([
    http<Dto.AuditList>('/bank/audit', { query: { limit: 200 } }),
    cachedGet<Dto.ProductOut[]>('/products').catch(() => [] as Dto.ProductOut[]),
  ]);
  const names = new Map(products.map((p) => [p.id, p.name]));
  return audit.items.map((item) => toEvent(item, names));
}

const listAudit = USE_API ? listApiAudit : () => mockResponse(() => server.listAudit());

export function useAuditLog() {
  return useQuery({ queryKey: ['audit'], queryFn: listAudit });
}
