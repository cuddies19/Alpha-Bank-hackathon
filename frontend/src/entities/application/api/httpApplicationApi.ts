import { fetchProductDtos, monthlyCashFlow, productApiId, productIdFromCode } from '@/entities/product/@x/application';
import type { Dto } from '@/shared/api';
import { ApiError, http } from '@/shared/api';
import {
  addMonths,
  annuityPayment,
  formatClock,
  formatDay,
  formatMoney,
  formatMonths,
  formatStamp,
  parseRuDate,
  loadLabel,
  paymentShare,
} from '@/shared/lib';
import type { IconName } from '@/shared/ui';
import { REQUESTABLE_DOCUMENTS, documentChecklist } from '../model/documents';
import type {
  Application,
  ApplicationCase,
  ApplicationDocument,
  ApplicationEvent,
  ApplicationStatus,
  BankStage,
  CaseDocument,
  CheckStatus,
  ClosedReason,
  Decision,
  DecisionInput,
  DecisionOutcome,
  DraftInput,
  DraftPatch,
  ProductRuleResult,
  QueueItem,
  QueueTag,
  RiskClass,
  SigningFile,
  SlaLevel,
  SourceCheck,
  SourceId,
  TimelineStep,
  UploadInput,
} from '../model/types';

type Detail = Dto.ApplicationDetail | Dto.BankApplicationDetail;

const SHARE_LIMIT = 30;
const REVIEW_SLA_MS = 2 * 60 * 60 * 1000;
const OFFER_VALID_DAYS = 7;

const STATUS: Record<Dto.ApplicationStatus, ApplicationStatus> = {
  draft: 'draft',
  submitted: 'submitted',
  processing: 'scoring',
  manual_review: 'manual_review',
  client_action: 'needs_info',
  approved: 'approved',
  counter_offer: 'counter_offer',
  rejected: 'rejected',
  signing: 'approved',
  signed: 'issued',
  issued: 'issued',
  client_declined: 'rejected',
  withdrawn: 'rejected',
};

const CLOSED: Partial<Record<Dto.ApplicationStatus, ClosedReason>> = {
  client_declined: 'client_declined',
  withdrawn: 'withdrawn',
};

const TIMELINE: Partial<Record<Dto.ApplicationStatus, TimelineStep>> = {
  submitted: 'submitted',
  processing: 'checked',
  manual_review: 'review',
  client_action: 'decided',
  approved: 'decided',
  counter_offer: 'decided',
  rejected: 'decided',
  signed: 'signed',
  issued: 'issued',
};

const EVENT_ICON: Partial<Record<Dto.ApplicationStatus, IconName>> = {
  submitted: 'upload',
  processing: 'clock',
  manual_review: 'clock',
  client_action: 'alert',
  approved: 'check-circle',
  counter_offer: 'check-circle',
  rejected: 'x-circle',
  issued: 'check-circle',
  withdrawn: 'x-circle',
  client_declined: 'x-circle',
};

const CONSENT_KEYS = { pd: 'personal_data', bki: 'bki_request', ops: 'terms' } as const;

const SOURCE_ID: Record<string, SourceId> = {
  egrul: 'egrul',
  fns: 'fns',
  bki: 'bki',
  statement: 'statement',
  scoring: 'scoring',
};

const CHECK_STATUS: Record<Dto.SourceStatus, CheckStatus> = {
  ok: 'ok',
  warn: 'warn',
  fail: 'fail',
  unavailable: 'fail',
};

const RISK_LABEL: Record<string, string> = {
  A: 'низкий риск',
  B: 'умеренный риск',
  C: 'повышенный риск',
  D: 'высокий риск',
  E: 'очень высокий риск',
};

const RULE_LABEL: Record<string, string> = {
  amount_limit: 'Сумма в лимите продукта',
  term_limit: 'Срок в лимите продукта',
  business_age: 'Возраст бизнеса',
  tax_debt: 'Нет налоговой задолженности',
  risk_class: 'Класс риска',
  credit_history: 'Кредитная история',
  payment_share: 'Доля платежа в потоке',
  debt_load: 'Доля платежа в потоке',
};

const DECIDED: Dto.ApplicationStatus[] = [
  'approved',
  'counter_offer',
  'rejected',
  'client_declined',
  'issued',
  'signing',
  'signed',
];

export function shortPersonName(fullName: string) {
  const [first, last] = fullName.trim().split(/\s+/);
  return last ? `${first[0]}. ${last}` : fullName;
}

const consentsOf = (raw: Record<string, unknown> | undefined, at: string): Application['consents'] => ({
  pd: raw?.[CONSENT_KEYS.pd] === true ? at : null,
  bki: raw?.[CONSENT_KEYS.bki] === true ? at : null,
  ops: raw?.[CONSENT_KEYS.ops] === true ? at : null,
});

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

function documentsOf(dto: Detail): ApplicationDocument[] {
  const slots = documentChecklist(dto.company.type);
  const extra: ApplicationDocument[] = [];
  for (const file of dto.documents ?? []) {
    const status = file.status === 'rejected' ? 'error' : 'ok';
    const fields = {
      status,
      fileName: file.filename,
      size: formatSize(file.size_bytes),
      message: file.status === 'rejected' ? 'Банк попросил заменить файл' : undefined,
    } as const;
    const slot = slots.find((s) => s.id === file.doc_type);
    if (slot) Object.assign(slot, fields);
    else {
      const known = REQUESTABLE_DOCUMENTS[file.doc_type];
      extra.push({
        id: `file-${file.id}`,
        title: known?.title ?? file.filename,
        note: known?.note ?? 'Загружен в кабинете',
        required: false,
        ...fields,
      });
    }
  }
  return [...slots, ...extra];
}

function timelineOf(dto: Detail): Application['timeline'] {
  const timeline: Application['timeline'] = {};
  if (dto.submitted_at) timeline.submitted = formatClock(dto.submitted_at);
  for (const item of dto.history ?? []) {
    const key = TIMELINE[item.to_status];
    if (key) timeline[key] = formatClock(item.created_at);
  }
  if (dto.decided_at) timeline.decided = formatClock(dto.decided_at);
  return timeline;
}

function eventsOf(dto: Detail): ApplicationEvent[] {
  return [...(dto.history ?? [])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((item, index) => ({
      id: `h-${index}-${item.created_at}`,
      text: item.comment ? `${item.to_label}: ${item.comment}` : item.to_label,
      time: formatStamp(item.created_at),
      icon: EVENT_ICON[item.to_status] ?? 'clock',
    }));
}

function decisionOf(
  dto: Detail,
  base: { amount: number; term: number; rate: number; payment: number; cashFlow: number },
): Decision | undefined {
  const d = dto.decision;
  if (!d) return undefined;
  const amount = d.amount ?? base.amount;
  const term = d.term_months ?? base.term;
  const rate = d.rate ?? base.rate;
  const payment = d.monthly_payment ?? annuityPayment({ principal: amount, ratePct: rate, months: term, roundTo: 100 });
  const share = paymentShare(payment, base.cashFlow);
  const decidedAt = new Date(d.decided_at);
  const decidedBy =
    'decided_by_name' in d && d.decided_by_name ? shortPersonName(d.decided_by_name) : 'Специалист банка';
  const requestedDocs =
    d.outcome === 'request'
      ? (d.requested_documents ?? []).map((id) => {
          const known = REQUESTABLE_DOCUMENTS[id];
          const uploaded = (dto.documents ?? []).find((f) => f.doc_type === id && new Date(f.uploaded_at) >= decidedAt);
          return {
            id,
            title: known?.title ?? id,
            note: known?.note ?? 'Запрошено специалистом',
            status: uploaded ? ('ok' as const) : ('missing' as const),
            fileName: uploaded?.filename,
            size: uploaded ? formatSize(uploaded.size_bytes) : undefined,
          };
        })
      : undefined;
  const requestedShare = paymentShare(base.payment, base.cashFlow);
  return {
    outcome: d.outcome,
    decidedAt: formatStamp(d.decided_at),
    decidedBy,
    amount,
    term,
    rate,
    payment: d.outcome === 'request' || d.outcome === 'decline' ? 0 : payment,
    share,
    requested:
      d.outcome === 'counter'
        ? { amount: base.amount, term: base.term, payment: base.payment, share: requestedShare }
        : undefined,
    firstPayment: formatDay(addMonths(decidedAt, 1)),
    validUntil: formatDay(new Date(decidedAt.getTime() + OFFER_VALID_DAYS * 86_400_000)),
    summary:
      d.outcome === 'counter' && base.cashFlow > 0
        ? `Платёж на ${formatMoney(base.amount)} занял бы ${requestedShare}% вашего денежного потока. С этой суммой — ${loadLabel(share)}.`
        : d.outcome === 'counter' || d.outcome === 'approve'
          ? undefined
          : (d.client_message ?? undefined),
    reasons:
      d.outcome === 'decline'
        ? [{ text: d.decline_reason ?? 'Заявка не прошла правила банка', tone: 'danger' }]
        : d.outcome === 'counter'
          ? [
              {
                text: `Платёж на ${formatMoney(base.amount)} — ${requestedShare}% потока, комфортно до ${SHARE_LIMIT}%`,
                tone: 'warning',
              },
            ]
          : [],
    requestedDocs,
    deadline:
      d.outcome === 'request' ? formatDay(new Date(decidedAt.getTime() + OFFER_VALID_DAYS * 86_400_000)) : undefined,
    message: d.client_message ?? undefined,
    declineReason: d.decline_reason ?? undefined,
    declineDetails: d.client_message ?? undefined,
  };
}

function slaOf(dto: Detail | Dto.BankQueueItem, now = Date.now()): QueueItem['sla'] {
  if (dto.status !== 'manual_review' && dto.status !== 'submitted') return { text: '—', level: 'ok' };
  const startedAt =
    ('history' in dto ? dto.history?.findLast((h) => h.to_status === 'manual_review')?.created_at : undefined) ??
    dto.submitted_at;
  if (!startedAt) return { text: '—', level: 'ok' };
  const left = new Date(startedAt).getTime() + REVIEW_SLA_MS - now;
  const minutes = Math.round(Math.abs(left) / 60_000);
  const text = `${minutes >= 60 ? `${Math.floor(minutes / 60)} ч ` : ''}${minutes % 60} мин`;
  const level: SlaLevel = left < 0 ? 'late' : left < 60 * 60_000 ? 'warn' : 'ok';
  return { text: left < 0 ? `просрочено на ${text}` : text, level };
}

function riskOf(value: string | null | undefined): RiskClass | undefined {
  return value && 'ABCDE'.includes(value) ? (value as RiskClass) : undefined;
}

function outcomeOf(value: string | null | undefined): DecisionOutcome | undefined {
  return value === 'approve' || value === 'counter' || value === 'request' || value === 'decline' ? value : undefined;
}

function tagsOf(labels: string[] | undefined): QueueTag[] {
  return (labels ?? []).map((label) => ({ label, tone: 'neutral', icon: false }));
}

function toApplication(dto: Detail, cashFlow: number): Application {
  const rate = dto.product.rate;
  const payment = annuityPayment({ principal: dto.amount, ratePct: rate, months: dto.term_months, roundTo: 100 });
  const createdAt = formatStamp(dto.created_at);
  const consentAt = dto.submitted_at ? formatStamp(dto.submitted_at) : createdAt;
  const status = STATUS[dto.status];
  const app: Application = {
    id: String(dto.id),
    number: dto.number,
    companyId: String(dto.company.id),
    companyName: dto.company.name,
    inn: dto.company.inn,
    productId: productIdFromCode(dto.product.code),
    productName: dto.product.name,
    amount: dto.amount,
    term: dto.term_months,
    rate,
    payment,
    cashFlow,
    goal: dto.purpose,
    neededBy: dto.needed_by ? `до ${formatDay(dto.needed_by)}` : '',
    repaymentSource: dto.repayment_source ?? '',
    pledge: dto.product.requires_collateral,
    status,
    createdAt,
    submittedAt: dto.submitted_at ? formatStamp(dto.submitted_at) : undefined,
    submittedAtMs: dto.submitted_at ? new Date(dto.submitted_at).getTime() : undefined,
    draftStep: dto.status === 'draft' ? draftSteps.get(String(dto.id)) : undefined,
    draftSavedAt: dto.status === 'draft' ? formatClock(new Date()) : undefined,
    consents: consentsOf(dto.consents, consentAt),
    documents: documentsOf(dto),
    timeline: timelineOf(dto),
    events: eventsOf(dto),
    closedReason: CLOSED[dto.status],
    assignee: dto.taken_by_name ? shortPersonName(dto.taken_by_name) : undefined,
    tags: tagsOf(dto.labels),
    isNew: dto.status === 'submitted',
  };
  app.decision = decisionOf(dto, { amount: app.amount, term: app.term, rate, payment, cashFlow });
  if ('recommendation' in dto) app.recommendation = outcomeOf(dto.recommendation);
  if ('score' in dto) app.riskClass = riskOf(dto.score?.risk_class);
  app.sla = slaOf(dto);
  return app;
}

function bankStageOf(status: Dto.ApplicationStatus): BankStage {
  if (status === 'submitted' || status === 'processing') return 'pipeline';
  if (status === 'manual_review') return 'manual';
  if (status === 'client_action') return 'client';
  return 'decided';
}

function toQueueItem(dto: Dto.BankQueueItem): QueueItem {
  return {
    id: String(dto.id),
    number: dto.number,
    companyId: String(dto.company_id),
    companyName: dto.company_name,
    inn: dto.inn,
    productId: productIdFromCode(productCodes.get(dto.product_id) ?? ''),
    productName: dto.product_name,
    amount: dto.amount,
    term: dto.term_months,
    rate: 0,
    payment: 0,
    cashFlow: 0,
    goal: '',
    neededBy: '',
    repaymentSource: '',
    pledge: false,
    status: STATUS[dto.status],
    createdAt: formatStamp(dto.created_at),
    submittedAt: dto.submitted_at ? formatStamp(dto.submitted_at) : undefined,
    consents: { pd: null, bki: null, ops: null },
    documents: [],
    timeline: {},
    events: [],
    closedReason: CLOSED[dto.status],
    riskClass: riskOf(dto.risk_class),
    recommendation: outcomeOf(dto.recommendation),
    assignee: dto.taken_by_name ? shortPersonName(dto.taken_by_name) : undefined,
    sla: slaOf(dto),
    tags: tagsOf(dto.tags),
    isNew: dto.status === 'submitted' && !dto.taken_by_name,
    bankStage: bankStageOf(dto.status),
  };
}

const draftSteps = new Map<string, number>();
const productCodes = new Map<number, string>();

function rememberProduct(product: Dto.ProductOut) {
  productCodes.set(product.id, product.code);
}

async function cashFlowSafe() {
  return monthlyCashFlow().catch(() => 0);
}

async function loadDetail(id: string): Promise<Application> {
  const [dto, cashFlow] = await Promise.all([http<Dto.ApplicationDetail>(`/applications/${id}`), cashFlowSafe()]);
  rememberProduct(dto.product);
  return toApplication(dto, cashFlow);
}

async function detailFrom(request: Promise<Dto.ApplicationDetail>): Promise<Application> {
  const [dto, cashFlow] = await Promise.all([request, cashFlowSafe()]);
  rememberProduct(dto.product);
  return toApplication(dto, cashFlow);
}

function draftBody(patch: DraftPatch) {
  const body: Dto.ApplicationUpdate = {};
  if (patch.amount !== undefined) body.amount = patch.amount;
  if (patch.term !== undefined) body.term_months = patch.term;
  if (patch.goal !== undefined) body.purpose = patch.goal;
  if (patch.repaymentSource !== undefined) body.repayment_source = patch.repaymentSource;
  if (patch.neededBy !== undefined) body.needed_by = parseRuDate(patch.neededBy);
  if (patch.consents) {
    body.consents = Object.fromEntries(
      Object.entries(patch.consents).map(([key, given]) => [CONSENT_KEYS[key as keyof typeof CONSENT_KEYS], given]),
    );
  }
  return body;
}

async function upload(applicationId: string, docType: string, file: File | undefined) {
  if (!file) throw new ApiError('Выберите файл', 422);
  const form = new FormData();
  form.append('file', file);
  form.append('doc_type', docType);
  await http<Dto.DocumentOut>(`/applications/${applicationId}/documents`, { method: 'POST', form });
}

function caseOf(dto: Dto.BankApplicationDetail): ApplicationCase {
  rememberProduct(dto.product);
  const app = toApplication(dto, 0);
  const score = dto.score;
  const riskClass = riskOf(score?.risk_class);
  const rules: ProductRuleResult[] = (dto.rules ?? []).map((r) => ({
    rule: RULE_LABEL[r.code] ?? r.code,
    value: r.value,
    threshold: r.threshold,
    passed: r.passed,
  }));
  const passed = rules.filter((r) => r.passed).length;
  const outcome = outcomeOf(dto.recommendation) ?? 'request';
  const checks: SourceCheck[] = (dto.checks ?? []).map((c) => ({
    id: SOURCE_ID[c.source] ?? 'egrul',
    name: c.source_label,
    status: CHECK_STATUS[c.status],
    summary: c.status === 'ok' ? 'Ответ получен' : c.status === 'warn' ? 'Есть замечания' : 'Источник не ответил',
    time: `${(c.response_time_ms / 1000).toFixed(1).replace('.', ',')} с${c.attempts > 1 ? ` × ${c.attempts}` : ''}`,
    details: Object.entries(c.response ?? {})
      .filter(([, value]) => value !== null && typeof value !== 'object')
      .slice(0, 6)
      .map(([term, value]) => ({ term, details: String(value) })),
  }));
  const company = dto.company;
  const who = company.name;
  const documents: CaseDocument[] = (dto.documents ?? []).map((d) => ({
    id: String(d.id),
    name: REQUESTABLE_DOCUMENTS[d.doc_type]?.title ?? d.filename,
    meta: `${d.filename.split('.').pop()?.toUpperCase() ?? 'PDF'} · ${formatSize(d.size_bytes)}`,
    status: d.status === 'accepted' ? 'Принят' : d.status === 'rejected' ? 'Нужно заменить' : 'Загружен',
    tone: d.status === 'accepted' ? 'success' : d.status === 'rejected' ? 'danger' : 'info',
    who,
    when: formatStamp(d.uploaded_at),
  }));
  return {
    application: app,
    cashFlow: 0,
    recommendation: {
      outcome,
      text: dto.recommendation_reason ?? 'Конвейер ещё не дал рекомендацию — решение за специалистом.',
      amount: app.amount,
      term: app.term,
      share: 0,
    },
    scoring:
      score && riskClass
        ? {
            score: score.score,
            riskClass,
            riskLabel: RISK_LABEL[riskClass] ?? '',
            pd: '—',
            model: score.model_version,
            calculatedAt: formatStamp(score.created_at),
            factors: (score.factors ?? []).map((f) => ({
              label: String(f.label ?? f.name ?? f.code ?? 'Фактор'),
              value: Number(f.value ?? f.weight ?? 0),
            })),
          }
        : null,
    rules,
    rulesSummary: !rules.length
      ? {
          tone: 'warning',
          title: 'Правила ещё не проверены',
          text: 'Конвейер не прогнал правила продукта по этой заявке.',
        }
      : passed === rules.length
        ? { tone: 'success', title: 'Итог правил: можно одобрить', text: 'Все правила продукта пройдены.' }
        : {
            tone: 'danger',
            title: `Итог правил: ${passed} из ${rules.length} пройдены`,
            text: 'Проверьте непройденные правила перед решением.',
          },
    checks,
    checksAt: checks.length ? formatStamp(dto.checks![0].checked_at) : '—',
    client: {
      rows: [
        { term: 'Название', details: company.name },
        { term: 'ИНН / ОГРН', details: `${company.inn} / ${company.ogrn}` },
        {
          term: 'Регистрация',
          details: company.registration_date ? formatDay(company.registration_date, { year: true }) : '—',
        },
        { term: 'ОКВЭД', details: company.okved ?? '—' },
        { term: 'Адрес', details: company.address ?? '—' },
        { term: 'Телефон', details: company.phone ?? '—' },
      ],
      director: [{ term: 'ФИО', details: company.director ?? '—' }],
      turnover: [],
      turnoverStats: [],
      obligations: [],
    },
    history: [...(dto.history ?? [])]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((h, index) => ({
        id: `h-${index}`,
        time: formatStamp(h.created_at),
        what: h.to_label,
        detail: h.comment ? `${h.from_label} → ${h.to_label} · ${h.comment}` : `${h.from_label} → ${h.to_label}`,
        actor: h.actor_type === 'system' ? 'Система' : h.actor_type === 'client' ? 'Клиент' : 'Сотрудник',
      })),
    documents,
    documentsComplete: app.documents.filter((d) => d.required).every((d) => d.status === 'ok'),
    decided: DECIDED.includes(dto.status) || dto.status === 'withdrawn',
  };
}

export const httpApplicationApi = {
  listForCompany: async (_companyId: string): Promise<Application[]> => {
    const list = await http<Dto.ApplicationList>('/applications', { query: { limit: 200 } });
    return Promise.all(list.items.map((item) => loadDetail(String(item.id))));
  },
  get: loadDetail,
  createDraft: async (_companyId: string, input: DraftInput) => {
    const body: Dto.ApplicationCreate = {
      product_id: await productApiId(input.productId),
      amount: input.amount,
      term_months: input.term,
      purpose: input.goal?.trim() || 'Финансирование бизнеса',
      needed_by: input.neededBy ? parseRuDate(input.neededBy) : null,
      repayment_source: input.repaymentSource ?? null,
    };
    const app = await detailFrom(http<Dto.ApplicationDetail>('/applications', { method: 'POST', body }));
    draftSteps.set(app.id, 1);
    return { ...app, draftStep: 1 } as Application;
  },
  updateDraft: async (id: string, patch: DraftPatch) => {
    if (patch.draftStep !== undefined) draftSteps.set(id, patch.draftStep);
    const body = draftBody(patch);
    if (!Object.keys(body).length) return loadDetail(id);
    return detailFrom(http<Dto.ApplicationDetail>(`/applications/${id}`, { method: 'PATCH', body }));
  },
  uploadDocument: async ({ applicationId, documentId, file }: UploadInput) => {
    const current = await loadDetail(applicationId);
    const slot =
      current.documents.find((d) => d.id === documentId) ??
      current.documents.find((d) => d.required && (d.status === 'missing' || d.status === 'error')) ??
      current.documents.find((d) => d.status === 'missing' || d.status === 'error');
    await upload(applicationId, slot && !slot.id.startsWith('file-') ? slot.id : 'other', file);
    return loadDetail(applicationId);
  },
  removeDocument: async (_applicationId: string, _documentId: string): Promise<Application> => {
    throw new ApiError('Удалить загруженный файл пока нельзя — загрузите новый, банк возьмёт последний', 409);
  },
  submit: (id: string) => detailFrom(http(`/applications/${id}/submit`, { method: 'POST' })),
  withdraw: (id: string) => detailFrom(http(`/applications/${id}/withdraw`, { method: 'POST', body: {} })),
  acceptOffer: async (id: string) => {
    const dto = await http<Dto.ApplicationDetail>(`/applications/${id}`);
    if (dto.status === 'signing') return detailFrom(Promise.resolve(dto));
    return detailFrom(http(`/applications/${id}/accept`, { method: 'POST' }));
  },
  declineOffer: (id: string) => detailFrom(http(`/applications/${id}/decline`, { method: 'POST', body: {} })),
  uploadRequestedDocument: async ({ applicationId, documentId, file }: UploadInput) => {
    const current = await loadDetail(applicationId);
    const requested =
      current.decision?.requestedDocs?.find((d) => d.id === documentId) ??
      current.decision?.requestedDocs?.find((d) => d.status === 'missing' || d.status === 'error');
    await upload(applicationId, requested?.id ?? 'other', file);
    return loadDetail(applicationId);
  },
  respondToRequest: (id: string, _comment: string) =>
    detailFrom(http(`/applications/${id}/resubmit`, { method: 'POST' })),
  signingDocuments: async (id: string): Promise<SigningFile[]> => {
    const app = await loadDetail(id);
    const d = app.decision;
    if (!d) throw new ApiError('Решения по заявке ещё нет', 409);
    return [
      { id: 'contract', title: 'Кредитный договор', meta: 'PDF · формируется при подписании' },
      { id: 'schedule', title: 'График платежей', meta: `PDF · ${d.term} платежей по ${formatMoney(d.payment)}` },
      {
        id: 'statement',
        title: 'Заявление на выдачу',
        meta: `PDF · зачисление на расчётный счёт · ${formatMonths(d.term)}`,
      },
    ];
  },
  sign: async (id: string, code: string) => {
    const dto = await http<Dto.ApplicationDetail>(`/applications/${id}`);
    if (dto.status === 'approved' || dto.status === 'counter_offer') {
      await http(`/applications/${id}/accept`, { method: 'POST' });
    }
    return detailFrom(http(`/applications/${id}/sign`, { method: 'POST', body: { code } }));
  },

  queue: async (): Promise<QueueItem[]> => {
    const response = await http<Dto.BankQueueResponse>('/bank/applications', { query: { limit: 200 } });
    if (response.items.some((i) => !productCodes.has(i.product_id)))
      (await fetchProductDtos()).forEach(rememberProduct);
    return response.items.map(toQueueItem);
  },
  getCase: async (id: string) => caseOf(await http<Dto.BankApplicationDetail>(`/bank/applications/${id}`)),
  takeInWork: async (id: string) =>
    caseOf(await http<Dto.BankApplicationDetail>(`/bank/applications/${id}/take`, { method: 'POST' })).application,
  decide: async (input: DecisionInput) => {
    const body: Dto.DecisionRequest = {
      outcome: input.outcome,
      amount: input.outcome === 'counter' || input.outcome === 'approve' ? input.amount : null,
      term_months: input.outcome === 'counter' || input.outcome === 'approve' ? input.term : null,
      rate: input.outcome === 'counter' || input.outcome === 'approve' ? input.rate : null,
      requested_documents: input.outcome === 'request' ? input.requestedDocs : [],
      client_message: input.outcome === 'request' || input.outcome === 'decline' ? input.message || null : null,
      decline_reason: input.outcome === 'decline' ? input.declineReason || null : null,
      internal_comment: input.comment || null,
    };
    const dto = await http<Dto.BankApplicationDetail>(`/bank/applications/${input.applicationId}/decision`, {
      method: 'POST',
      body,
    });
    return caseOf(dto).application;
  },
};
