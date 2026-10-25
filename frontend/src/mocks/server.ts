import type {
  Application,
  ApplicationStatus,
  Decision,
  DecisionInput,
  DraftInput,
  RequestedDocument,
} from '@/entities/application';
import type { AccountSummary } from '@/entities/account';
import type { AuditEvent } from '@/entities/audit';
import type { CompanyProfile, ConsentId, NotificationPrefId } from '@/entities/company';
import type { ClientDocument, SigningDocument } from '@/entities/document';
import type { SourceState } from '@/entities/integration';
import type { Loan } from '@/entities/loan';
import type { Persona, PersonaId } from '@/entities/session';
import { ApiError } from '@/shared/api';
import { annuityPayment, formatApproxMoney, formatMoney, formatMonths, paymentShare } from '@/shared/lib';
import { ACCOUNT_SUMMARIES, YEAR_TURNOVER } from './data/account';
import { IGOR_COUNTER_DECISION, igorDecided, igorDraft } from './data/applications';
import { ANALYST, CREDIT_RULES, PIPELINE_STATS } from './data/bank';
import { COMPANIES, CONSENT_TEXTS } from './data/companies';
import { DEMO_PASSWORD, PERSONAS } from './data/personas';
import { PRODUCTS, RECOMMENDATION } from './data/products';
import { buildCase } from './cases';
import { db, notificationsFor, prefsFor, resetDb, save, type DemoSettings, type MockAuditEvent } from './db';
import { advance, isInPipeline, REVIEW_SLA_MS, submit } from './pipeline';
import { clock, clockSeconds, stamp, uid } from './time';

const UPLOAD_MS = 900;
const CHECK_MS = 2_600;
export const SIGN_CODE = '482913';

function find(id: string): Application {
  const app = db.applications.find((a) => a.id === id);
  if (!app) throw new ApiError('Заявка не найдена', 404);
  return app;
}

function company(companyId: string) {
  const c = COMPANIES.find((x) => x.id === companyId);
  if (!c) throw new ApiError('Компания не найдена', 404);
  return c;
}

function refreshUpload<T extends { status: string; progress?: number }>(key: string, doc: T, now: number) {
  const started = db.uploads[key];
  if (started === undefined || (doc.status !== 'uploading' && doc.status !== 'checking')) return;
  const elapsed = now - started;
  if (elapsed < UPLOAD_MS) {
    doc.status = 'uploading';
    doc.progress = Math.min(95, Math.round(20 + (elapsed / UPLOAD_MS) * 75));
  } else if (elapsed < CHECK_MS) {
    doc.status = 'checking';
    doc.progress = undefined;
  } else {
    doc.status = 'ok';
    doc.progress = undefined;
    delete db.uploads[key];
  }
}

function refresh(app: Application, now = Date.now()) {
  advance(app, now);
  app.documents.forEach((d) => refreshUpload(`${app.id}:${d.id}`, d, now));
  app.decision?.requestedDocs?.forEach((d) => refreshUpload(`${app.id}:req:${d.id}`, d, now));
  return app;
}

function refreshAll() {
  const now = Date.now();
  db.applications.forEach((a) => refresh(a, now));
  save();
}

export function listPersonas(): Persona[] {
  return PERSONAS;
}

export function login(loginName: string, password: string): Persona {
  const persona = PERSONAS.find((p) => p.login === loginName.trim());
  if (!persona || password !== DEMO_PASSWORD) {
    throw new ApiError(
      /[а-яё]/i.test(loginName) ? 'Похоже, включена русская раскладка' : 'Неверный логин или пароль',
      401,
    );
  }
  return persona;
}

export function getPersona(id: PersonaId): Persona {
  const persona = PERSONAS.find((p) => p.id === id);
  if (!persona) throw new ApiError('Сессия истекла', 401);
  return persona;
}

export type DemoScenario = 'igor-after-decision';

export function applyScenario(scenario: DemoScenario) {
  if (scenario === 'igor-after-decision') {
    db.applications = db.applications.filter((a) => a.id !== '2026-10-0142');
    db.applications.unshift(igorDecided());
    db.loans['dom-i-uyut'] = (db.loans['dom-i-uyut'] ?? []).filter((l) => l.id !== '2026-10-0142');
    const list = notificationsFor('dom-i-uyut').filter((n) => !n.id.startsWith('n-0142'));
    db.notifications['dom-i-uyut'] = [
      {
        id: 'n-0142-decided',
        title: 'Решение по заявке № 2026-10-0142 готово',
        text: 'Банк предлагает 2 400 000 ₽ на 18 месяцев',
        time: '11:32',
        day: 'Сегодня, 24 октября',
        to: '/client/applications/2026-10-0142/decision',
        unread: true,
      },
      {
        id: 'n-0142-valid',
        title: 'Условия действуют до 31 октября',
        text: 'Примите предложение или откажитесь до этой даты',
        time: '11:32',
        day: 'Сегодня, 24 октября',
        to: '/client/applications/2026-10-0142/decision',
        unread: true,
      },
      {
        id: 'n-0142-review',
        title: 'Заявка перешла к специалисту',
        text: 'Обычно это занимает до часа',
        time: '11:05',
        day: 'Сегодня, 24 октября',
        to: '/client/applications/2026-10-0142',
        unread: false,
      },
      {
        id: 'n-0142-sent',
        title: 'Заявка № 2026-10-0142 отправлена',
        text: 'Решение придёт сюда, в кабинет',
        time: '10:51',
        day: 'Сегодня, 24 октября',
        to: '/client/applications/2026-10-0142',
        unread: false,
      },
      {
        id: 'n-0142-supply',
        title: 'Договор поставки нужно заменить',
        text: 'Фото обрезано: не видно страницы с подписью',
        time: '10:49',
        day: 'Сегодня, 24 октября',
        to: '/client/documents',
        unread: false,
      },
      ...list,
    ];
  }
  save();
}

export function getSettings(): DemoSettings & { sources: Array<{ id: string; name: string; down: boolean }> } {
  return {
    ...db.settings,
    sources: db.sources
      .filter((s) => s.id !== 'scoring')
      .map((s) => ({ id: s.id, name: s.name, down: s.state === 'down' })),
  };
}

export function updateSettings(patch: Partial<DemoSettings>) {
  Object.assign(db.settings, patch);
  save();
}

export function setSourceDown(id: string, down: boolean) {
  const source = db.sources.find((s) => s.id === id);
  if (!source) throw new ApiError('Источник не найден', 404);
  const nextState: SourceState = down ? 'down' : 'up';
  if (source.state === nextState) return;
  db.audit.unshift({
    id: uid('a'),
    time: clockSeconds(),
    who: 'Система',
    role: 'Мониторинг',
    actor: 'system',
    applicationId: '—',
    action: down ? 'Сбой источника' : 'Источник восстановлен',
    change: `${source.name}: ${down ? 'работает → не отвечает' : 'не отвечает → работает'}`,
  });
  source.state = nextState;
  source.responseTime = down ? '10 с, тайм-аут' : '1,0 с';
  source.errorsPerHour = down ? Math.max(source.errorsPerHour, 3) : 0;
  if (!down) source.lastSuccess = `сегодня, ${clock()}`;
  save();
}

export function reset() {
  resetDb();
}

export function getProfile(companyId: string): CompanyProfile {
  const c = company(companyId);
  const apps = db.applications.filter((a) => a.companyId === companyId);
  const revoked = db.revokedConsents[companyId] ?? [];
  const givenAt = (id: ConsentId) => apps.map((a) => a.consents[id]).find(Boolean) ?? undefined;
  return {
    company: c,
    consents: CONSENT_TEXTS.map((consent) => {
      const at = revoked.includes(consent.id) ? undefined : givenAt(consent.id);
      return {
        ...consent,
        givenAt: at,
        validUntil: at ? (consent.id === 'bki' ? '24 апреля 2027' : 'бессрочно') : undefined,
      };
    }),
    prefs: prefsFor(companyId),
    accounts: [
      { title: `Расчётный счёт •• ${c.accountMask}`, note: 'Основной', primary: true },
      ...(c.externalAccountStatement ? [{ title: 'Счёт в другом банке', note: c.externalAccountStatement }] : []),
    ],
  };
}

export function listConsentTexts() {
  return CONSENT_TEXTS;
}

export function listPrefs(companyId: string) {
  return prefsFor(companyId);
}

export function listRevokedConsents(companyId: string): ConsentId[] {
  return db.revokedConsents[companyId] ?? [];
}

export function setPref(companyId: string, prefId: NotificationPrefId, enabled: boolean) {
  const pref = prefsFor(companyId).find((p) => p.id === prefId);
  if (pref) pref.enabled = enabled;
  save();
}

export function revokeConsent(companyId: string, consentId: ConsentId) {
  const list = (db.revokedConsents[companyId] ??= []);
  if (!list.includes(consentId)) list.push(consentId);
  save();
}

export function getAccountSummary(companyId: string): AccountSummary {
  const detailed = ACCOUNT_SUMMARIES[companyId];
  if (detailed) return detailed;
  const c = company(companyId);
  const persona = PERSONAS.find((p) => p.companyId === companyId);
  const template = ACCOUNT_SUMMARIES['dom-i-uyut'];
  const app = db.applications.find((a) => a.companyId === companyId);
  const scale = (app?.cashFlow ?? 400_000) / template.netCashFlow;
  return {
    ...template,
    greetingName: persona?.name.split(' ')[0] ?? '',
    accountMask: c.accountMask,
    balance: Math.round((template.balance * scale) / 100) * 100,
    incomes30d: Math.round((template.incomes30d * scale) / 1000) * 1000,
    netCashFlow: app?.cashFlow ?? 400_000,
    loanPayments: 0,
    loanPaymentsHint: 'в месяц, кредитов нет',
    insight: undefined,
    months: template.months.map((m) => ({
      ...m,
      income: +(m.income * scale).toFixed(2),
      outcome: +(m.outcome * scale).toFixed(2),
    })),
    chartSummary: 'Поступления стабильны последние полгода.',
    events: [{ id: 'e1', text: 'Выписка по счёту обновлена', time: '10:40', icon: 'document' }],
  };
}

export function getYearTurnover(companyId: string) {
  return YEAR_TURNOVER[companyId] ?? YEAR_TURNOVER['dom-i-uyut'];
}

export function listProducts() {
  return PRODUCTS;
}

export function getRecommendation(companyId: string) {
  const app = db.applications.find((a) => a.companyId === companyId);
  return { ...RECOMMENDATION, cashFlow: app?.cashFlow ?? RECOMMENDATION.cashFlow };
}

export function listClientApplications(companyId: string): Application[] {
  refreshAll();
  return db.applications.filter((a) => a.companyId === companyId);
}

export function getApplication(id: string): Application {
  const app = refresh(find(id));
  save();
  return app;
}

export function createDraft(companyId: string, input: DraftInput): Application {
  const existing = db.applications.find(
    (a) => a.companyId === companyId && a.status === 'draft' && a.id === '2026-10-0142',
  );
  if (existing) {
    Object.assign(existing, draftParams(existing, input));
    save();
    return existing;
  }
  const c = company(companyId);
  const reference = db.applications.find((a) => a.companyId === companyId);
  const base = igorDraft(input.amount, input.term, input.productId === 'loan' ? 'loan' : 'credit-line');
  const draft: Application =
    companyId === 'dom-i-uyut' && !db.applications.some((a) => a.id === base.id)
      ? base
      : {
          ...base,
          id: `2026-10-0${150 + db.applications.length}`,
          number: `2026-10-0${150 + db.applications.length}`,
          companyId,
          companyName: c.shortName,
          inn: c.inn,
          cashFlow: reference?.cashFlow ?? base.cashFlow,
          riskClass: reference?.riskClass ?? 'B',
          quote: undefined,
          goal: RECOMMENDATION.need.goal,
        };
  Object.assign(draft, draftParams(draft, input), { createdAt: stamp(), draftSavedAt: clock() });
  db.applications.unshift(draft);
  db.audit.unshift({
    id: uid('a'),
    time: clockSeconds(),
    who: c.shortName,
    role: 'Клиент',
    actor: 'client',
    applicationId: draft.id,
    action: 'Черновик создан из подбора',
    change: 'Поля перенесены из диалога с ассистентом',
  });
  save();
  return draft;
}

function draftParams(app: Application, input: DraftInput) {
  const product = PRODUCTS.find((p) => p.id === input.productId);
  const rate = product?.rateFrom ?? app.rate;
  return {
    productId: input.productId,
    productName: product?.name ?? app.productName,
    amount: input.amount,
    term: input.term,
    rate,
    payment: annuityPayment({ principal: input.amount, ratePct: rate, months: input.term, roundTo: 100 }),
  };
}

export type DraftPatch = Partial<
  Pick<Application, 'amount' | 'term' | 'goal' | 'neededBy' | 'repaymentSource' | 'draftStep'>
> & { consents?: Partial<Record<ConsentId, boolean>>; contactName?: string; phone?: string };

export function updateDraft(id: string, patch: DraftPatch): Application {
  const app = find(id);
  if (app.status !== 'draft') throw new ApiError('Заявка уже отправлена — изменить её нельзя', 409);
  const { consents, contactName: _contact, phone: _phone, ...fields } = patch;
  Object.assign(app, fields);
  if (fields.amount !== undefined || fields.term !== undefined) {
    app.payment = annuityPayment({ principal: app.amount, ratePct: app.rate, months: app.term, roundTo: 100 });
  }
  if (consents) {
    for (const [key, given] of Object.entries(consents) as Array<[ConsentId, boolean]>) {
      app.consents[key] = given ? (app.consents[key] ?? stamp()) : null;
    }
  }
  app.draftSavedAt = clock();
  save();
  return app;
}

export interface UploadInput {
  applicationId: string;
  documentId?: string;
  name: string;
  size: string;
}

export function uploadDocument({ applicationId, documentId, name, size }: UploadInput): Application {
  const app = find(applicationId);
  const doc =
    app.documents.find((d) => d.id === documentId) ??
    app.documents.find((d) => d.required && (d.status === 'missing' || d.status === 'error')) ??
    app.documents.find((d) => d.status === 'missing' || d.status === 'error');
  if (!doc) throw new ApiError('Все документы уже загружены', 409);
  Object.assign(doc, { status: 'uploading', fileName: name, size, progress: 20, message: undefined });
  db.uploads[`${app.id}:${doc.id}`] = Date.now();
  save();
  return app;
}

export function removeDocument(applicationId: string, documentId: string): Application {
  const app = find(applicationId);
  const doc = app.documents.find((d) => d.id === documentId);
  if (doc)
    Object.assign(doc, {
      status: 'missing',
      fileName: undefined,
      size: undefined,
      progress: undefined,
      message: undefined,
    });
  delete db.uploads[`${app.id}:${documentId}`];
  save();
  return app;
}

export function submitApplication(id: string): Application {
  const app = find(id);
  if (app.status !== 'draft') throw new ApiError('Заявка уже отправлена', 409);
  const missingConsent = (['bki', 'pd', 'ops'] as ConsentId[]).find((k) => !app.consents[k]);
  if (missingConsent) throw new ApiError('Не хватает согласия — отметьте его на шаге проверки', 422);
  if (app.documents.some((d) => d.required && d.status !== 'ok')) {
    throw new ApiError('Загрузите обязательные документы', 422);
  }
  submit(app);
  save();
  return app;
}

export function uploadRequestedDocument({ applicationId, documentId, name, size }: UploadInput): Application {
  const app = find(applicationId);
  const docs = app.decision?.requestedDocs ?? [];
  const doc: RequestedDocument | undefined =
    docs.find((d) => d.id === documentId) ?? docs.find((d) => d.status === 'missing' || d.status === 'error');
  if (!doc) throw new ApiError('Все запрошенные документы уже загружены', 409);
  Object.assign(doc, { status: 'uploading', fileName: name, size, progress: 20 });
  db.uploads[`${app.id}:req:${doc.id}`] = Date.now();
  save();
  return app;
}

export function respondToRequest(id: string, comment: string): Application {
  const app = refresh(find(id));
  if (app.status !== 'needs_info') throw new ApiError('Банк не ждёт документов по этой заявке', 409);
  if (app.decision?.requestedDocs?.some((d) => d.status !== 'ok')) {
    throw new ApiError('Дождитесь, пока документы загрузятся и пройдут проверку', 422);
  }
  if (comment.trim()) {
    db.audit.unshift({
      id: uid('a'),
      time: clockSeconds(),
      who: app.companyName,
      role: 'Клиент',
      actor: 'client',
      applicationId: app.id,
      action: 'Комментарий к документам',
      change: comment.trim(),
    });
  }
  const answeredDocs = app.decision?.requestedDocs ?? [];
  app.documents = [
    ...app.documents,
    ...answeredDocs.map((d) => ({
      id: d.id,
      title: d.title,
      note: d.note,
      required: true,
      status: 'ok' as const,
      fileName: d.fileName,
      size: d.size,
    })),
  ];
  app.decision = undefined;
  submit(app);
  save();
  return app;
}

function closeByClient(id: string, reason: 'withdrawn' | 'client_declined'): Application {
  const app = find(id);
  app.status = 'rejected';
  app.closedReason = reason;
  app.events.unshift({
    id: uid('ev'),
    text: reason === 'withdrawn' ? 'Вы отозвали заявку' : 'Вы отказались от предложения банка',
    time: clock(),
    icon: 'x-circle',
  });
  db.audit.unshift({
    id: uid('a'),
    time: clockSeconds(),
    who: app.companyName,
    role: 'Клиент',
    actor: 'client',
    applicationId: app.id,
    action: reason === 'withdrawn' ? 'Заявка отозвана' : 'Отказ от предложения',
    change: `${app.status} → Закрыта клиентом`,
  });
  save();
  return app;
}

export const withdrawApplication = (id: string) => closeByClient(id, 'withdrawn');
export const declineOffer = (id: string) => closeByClient(id, 'client_declined');

export function acceptOffer(id: string): Application {
  const app = find(id);
  if (app.status !== 'counter_offer' && app.status !== 'approved')
    throw new ApiError('Предложение уже недействительно', 409);
  app.status = 'approved';
  save();
  return app;
}

export function getSigningDocuments(id: string): SigningDocument[] {
  const app = find(id);
  const d = app.decision;
  if (!d) throw new ApiError('Решения по заявке ещё нет', 409);
  const c = company(app.companyId);
  return [
    { id: 'contract', title: 'Кредитный договор', meta: 'PDF · 6 страниц' },
    {
      id: 'schedule',
      title: 'График платежей',
      meta: `PDF · 1 страница · ${d.term} платежей по ${formatMoney(d.payment)}`,
    },
    {
      id: 'statement',
      title: 'Заявление на выдачу',
      meta: `PDF · 1 страница · зачисление на счёт •• ${c.accountMask}`,
    },
  ];
}

export function signApplication(id: string, code: string): Application {
  const app = find(id);
  if (app.status !== 'approved' || !app.decision) throw new ApiError('Документы по этой заявке подписать нельзя', 409);
  if (code !== SIGN_CODE) throw new ApiError('Код не подходит. Проверьте цифры и введите ещё раз', 422);
  const d = app.decision;
  const now = Date.now();
  app.status = 'issued';
  app.timeline.signed = clock(now);
  app.timeline.issued = clock(now);
  app.events.unshift({
    id: uid('ev'),
    text: `Деньги зачислены: ${formatMoney(d.amount)}`,
    time: clock(now),
    icon: 'check-circle',
  });
  const c = company(app.companyId);
  const loan: Loan = {
    id: app.id,
    productName: app.productName,
    contract: `№ ${app.id}-Д`,
    signedAt: '24 октября',
    rate: d.rate,
    until: untilDate(d.term),
    principal: d.amount,
    rest: d.amount,
    term: d.term,
    payment: d.payment,
    nextPaymentDate: '15 ноября',
    nextPaymentIn: 'через 22 дня',
    paidCount: 0,
    firstPaymentDate: '2026-11-15',
    insight:
      app.companyId === 'dom-i-uyut'
        ? {
            title: 'Платёж 15 декабря выпадает на кассовый разрыв',
            text: 'Выплата от маркетплейса ожидается 18 декабря. Можно внести часть платежа заранее — после распродажи 11.11.',
          }
        : undefined,
  };
  db.loans[app.companyId] = [loan, ...(db.loans[app.companyId] ?? []).filter((l) => l.id !== loan.id)];
  notificationsFor(app.companyId).unshift({
    id: uid('n'),
    title: `Деньги зачислены: ${formatMoney(d.amount)}`,
    text: `На счёт •• ${c.accountMask}. Первый платёж — 15 ноября`,
    time: clock(now),
    day: 'Сегодня, 24 октября',
    to: '/client/loans',
    unread: true,
  });
  db.audit.unshift({
    id: uid('a'),
    time: clockSeconds(now),
    who: app.companyName,
    role: 'Клиент',
    actor: 'client',
    applicationId: app.id,
    action: 'Документы подписаны, деньги выданы',
    change: 'Одобрено → Деньги зачислены',
  });
  save();
  return app;
}

function untilDate(term: number) {
  const date = new Date(2026, 10 + term - 1, 15);
  const months = [
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
  ];
  return `15 ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function listLoans(companyId: string): Loan[] {
  return db.loans[companyId] ?? [];
}

export function listNotifications(companyId: string) {
  refreshAll();
  return notificationsFor(companyId);
}

export function markAllNotificationsRead(companyId: string) {
  notificationsFor(companyId).forEach((n) => (n.unread = false));
  save();
}

export function markNotificationRead(companyId: string, id: string) {
  const n = notificationsFor(companyId).find((x) => x.id === id);
  if (n) n.unread = false;
  save();
}

const DOC_STATUS_WORD = {
  ok: 'Принят',
  checking: 'Проверяем',
  uploading: 'Загружается',
  error: 'Нужно заменить',
} as const;
const DOC_STATUS_TONE = { ok: 'success', checking: 'info', uploading: 'neutral', error: 'danger' } as const;

export function listClientDocuments(companyId: string): ClientDocument[] {
  refreshAll();
  const apps = db.applications.filter((a) => a.companyId === companyId);
  const docs: ClientDocument[] = [];
  for (const app of apps) {
    const date = (app.submittedAt ?? app.createdAt).split(',')[0];
    if (app.status === 'issued') {
      docs.push(
        {
          id: `${app.id}-contract`,
          name: 'Кредитный договор',
          meta: 'PDF · 6 страниц',
          applicationId: app.id,
          date,
          status: 'Подписано',
          tone: 'success',
        },
        {
          id: `${app.id}-schedule`,
          name: 'График платежей',
          meta: 'PDF · 1 страница',
          applicationId: app.id,
          date,
          status: 'Подписано',
          tone: 'success',
        },
        {
          id: `${app.id}-issue`,
          name: 'Заявление на выдачу',
          meta: 'PDF · 1 страница',
          applicationId: app.id,
          date,
          status: 'Подписано',
          tone: 'success',
        },
      );
    }
    for (const d of app.documents) {
      if (!d.fileName || d.status === 'missing') continue;
      docs.push({
        id: `${app.id}-${d.id}`,
        name: d.title,
        meta:
          d.status === 'error'
            ? `${d.fileName.split('.').pop()?.toUpperCase()} · ${d.message ?? 'нужно заменить'}`
            : `${d.fileName.split('.').pop()?.toUpperCase()} · ${d.size ?? ''}`,
        applicationId: app.id,
        date,
        status: DOC_STATUS_WORD[d.status],
        tone: DOC_STATUS_TONE[d.status],
        replaceable: d.status === 'error',
        documentId: d.id,
      });
    }
    if (app.consents.bki) {
      docs.push({
        id: `${app.id}-bki`,
        name: 'Согласие на запрос в БКИ',
        meta: 'Подписано в кабинете',
        applicationId: app.id,
        date,
        status: 'Подписано',
        tone: 'success',
      });
    }
  }
  return [...(db.extraDocuments[companyId] ?? []), ...docs];
}

export function uploadClientDocument(
  companyId: string,
  applicationId: string,
  name: string,
  size: string,
): ClientDocument {
  const doc: ClientDocument = {
    id: uid('doc'),
    name,
    meta: `${name.split('.').pop()?.toUpperCase() ?? 'PDF'} · ${size}`,
    applicationId,
    date: '24 октября',
    status: 'Принят',
    tone: 'success',
  };
  (db.extraDocuments[companyId] ??= []).unshift(doc);
  save();
  return doc;
}

export interface QueueItem extends Application {
  bankStage: 'pipeline' | 'manual' | 'client' | 'decided';
}

function bankStage(status: ApplicationStatus): QueueItem['bankStage'] | null {
  if (status === 'draft') return null;
  if (isInPipeline(status)) return 'pipeline';
  if (status === 'manual_review') return 'manual';
  if (status === 'needs_info') return 'client';
  return 'decided';
}

function liveSla(app: Application, now: number): Application['sla'] {
  if (app.status !== 'manual_review' || !app.reviewStartedMs) return app.sla ?? { text: '—', level: 'ok' };
  const left = app.reviewStartedMs + REVIEW_SLA_MS - now;
  const minutes = Math.round(Math.abs(left) / 60_000);
  const text = `${minutes >= 60 ? `${Math.floor(minutes / 60)} ч ` : ''}${minutes % 60} мин`;
  if (left < 0) return { text: `просрочено на ${text}`, level: 'late' };
  return { text, level: left < 60 * 60_000 ? 'warn' : 'ok' };
}

export function listQueue(): QueueItem[] {
  refreshAll();
  const now = Date.now();
  return db.applications
    .map((app) => ({ app, stage: bankStage(app.status) }))
    .filter((x): x is { app: Application; stage: QueueItem['bankStage'] } => x.stage !== null)
    .map(({ app, stage }) => ({ ...app, bankStage: stage, sla: liveSla(app, now) }));
}

export function getCase(id: string) {
  const app = refresh(find(id));
  save();
  return buildCase({ ...app, sla: liveSla(app, Date.now()) });
}

export function takeInWork(id: string): Application {
  const app = find(id);
  app.assignee = ANALYST;
  app.isNew = false;
  db.audit.unshift({
    id: uid('a'),
    time: clockSeconds(),
    who: ANALYST,
    role: 'Сотрудник',
    actor: 'staff',
    applicationId: app.id,
    action: 'Взята в работу',
    change: `— → ${ANALYST}`,
  });
  save();
  return app;
}

const OUTCOME_LABEL = {
  approve: 'Одобрено',
  counter: 'Встречное предложение',
  request: 'Запрошены данные',
  decline: 'Отказ',
} as const;

const REQUESTABLE_DOCS: Record<string, { title: string; note: string }> = {
  bs: { title: 'Бухгалтерская отчётность за 2025 год', note: 'Чтобы увидеть выручку и долги компании целиком' },
  stmt: { title: 'Выписка из другого банка за 6 месяцев', note: 'Без неё банк не увидит часть выручки' },
  supply: { title: 'Договор поставки', note: 'Подтверждает цель кредита' },
  other: { title: 'Другой документ', note: 'Подробности — в сообщении специалиста' },
};

export function decide(input: DecisionInput): Application {
  const app = refresh(find(input.applicationId));
  if (app.status !== 'manual_review') throw new ApiError('Решение по заявке уже принято', 409);
  const now = Date.now();
  const payment = annuityPayment({ principal: input.amount, ratePct: input.rate, months: input.term, roundTo: 100 });
  const base = {
    decidedAt: stamp(now),
    decidedBy: ANALYST,
    firstPayment: '15 ноября',
    validUntil: '31 октября',
  };
  let decision: Decision;
  let status: ApplicationStatus;
  switch (input.outcome) {
    case 'approve':
      status = 'approved';
      decision = {
        ...base,
        outcome: 'approve',
        amount: app.amount,
        term: app.term,
        rate: app.rate,
        payment: app.payment,
        share: paymentShare(app.payment, app.cashFlow),
        reasons: [
          { text: 'Поступления по счёту стабильны все 12 месяцев' },
          { text: 'В кредитной истории нет просрочек' },
          { text: `Платёж займёт ${paymentShare(app.payment, app.cashFlow)}% денежного потока` },
        ],
      };
      break;
    case 'counter': {
      status = 'counter_offer';
      const requestedShare = paymentShare(app.payment, app.cashFlow);
      const share = paymentShare(payment, app.cashFlow);
      decision = {
        ...(app.id === '2026-10-0142' ? IGOR_COUNTER_DECISION : {}),
        ...base,
        outcome: 'counter',
        amount: input.amount,
        term: input.term,
        rate: input.rate,
        payment,
        share,
        requested: { amount: app.amount, term: app.term, payment: app.payment, share: requestedShare },
        summary: `Платёж на ${formatMoney(app.amount)} занял бы ${requestedShare}% вашего денежного потока. С этой суммой нагрузка ${share <= 30 ? 'комфортная' : 'ниже'}.`,
        reasons: [
          { text: 'Поступления по счёту стабильны все 12 месяцев' },
          { text: 'По текущим кредитам нет просрочек' },
          {
            text: `Платёж на ${formatMoney(app.amount)} — ${requestedShare}% потока, это выше комфортных 30%`,
            tone: 'warning',
          },
        ],
      };
      break;
    }
    case 'request':
      status = 'needs_info';
      decision = {
        ...base,
        outcome: 'request',
        amount: app.amount,
        term: app.term,
        rate: app.rate,
        payment: 0,
        reasons: [],
        deadline: '30 октября',
        message: input.message,
        requestedDocs: input.requestedDocs.map((id) => ({
          id,
          ...(REQUESTABLE_DOCS[id] ?? REQUESTABLE_DOCS.other),
          status: 'missing',
        })),
      };
      break;
    case 'decline':
      status = 'rejected';
      decision = {
        ...base,
        outcome: 'decline',
        amount: app.amount,
        term: app.term,
        rate: app.rate,
        payment: 0,
        declineReason: input.declineReason,
        declineDetails: input.message,
        reasons: [{ text: input.declineReason, tone: 'danger' }],
        reapplyAfter: '24 января',
      };
      break;
  }
  app.status = status;
  app.decision = decision;
  app.timeline.review = clock(now);
  app.timeline.decided = clock(now);
  app.isNew = false;
  app.assignee = ANALYST;
  const terms =
    input.outcome === 'request'
      ? `${input.requestedDocs.length} док. до 30 октября`
      : input.outcome === 'decline'
        ? input.declineReason
        : `${formatMoney(decision.amount)} на ${formatMonths(decision.term)}`;
  app.events.unshift({
    id: uid('ev'),
    text: `Банк принял решение: ${OUTCOME_LABEL[input.outcome].toLowerCase()}`,
    time: clock(now),
    icon: 'check-circle',
  });
  const to = `/client/applications/${app.id}/decision`;
  notificationsFor(app.companyId).unshift(
    ...(input.outcome === 'counter' || input.outcome === 'approve'
      ? [
          {
            id: uid('n'),
            title: 'Условия действуют до 31 октября',
            text: 'Примите предложение или откажитесь до этой даты',
            time: clock(now),
            day: 'Сегодня, 24 октября',
            to,
            unread: true,
          },
        ]
      : []),
    {
      id: uid('n'),
      title: `Решение по заявке № ${app.id} готово`,
      text:
        input.outcome === 'request'
          ? 'Банку нужны ещё документы'
          : input.outcome === 'decline'
            ? 'Посмотрите, что можно сделать'
            : `Банк предлагает ${formatMoney(decision.amount)} на ${formatMonths(decision.term)}`,
      time: clock(now),
      day: 'Сегодня, 24 октября',
      to,
      unread: true,
    },
  );
  const staff = (action: string, change: string): MockAuditEvent => ({
    id: uid('a'),
    time: clockSeconds(now),
    who: ANALYST,
    role: 'Сотрудник',
    actor: 'staff',
    applicationId: app.id,
    action,
    change,
  });
  if (input.outcome === 'counter' && input.amount !== app.amount) {
    db.audit.unshift(
      staff(
        'Изменены условия',
        `${formatMoney(app.amount)} → ${formatMoney(input.amount)}, ${formatMonths(input.term)}`,
      ),
    );
  }
  db.audit.unshift(staff('Решение принято', `Ручное рассмотрение → ${OUTCOME_LABEL[input.outcome]} · ${terms}`));
  if (input.comment.trim()) db.audit.unshift(staff('Внутренний комментарий', input.comment.trim()));
  save();
  return app;
}

export function listSources() {
  return db.sources;
}

export function getPipelineStats() {
  return PIPELINE_STATS;
}

export function listAudit(): AuditEvent[] {
  refreshAll();
  return db.audit.map((e) => {
    const [before, after] = e.change.split(' → ');
    return {
      ...e,
      kind: /^Решение/.test(e.action)
        ? ('decision' as const)
        : /^Взята/.test(e.action)
          ? ('taken' as const)
          : /^Черновик создан/.test(e.action)
            ? ('created' as const)
            : /документ/i.test(e.action)
              ? ('document' as const)
              : ('other' as const),
      applicationRef: e.applicationId === '—' ? undefined : e.applicationId,
      details:
        after !== undefined
          ? [{ label: 'Изменение', before, after }]
          : [{ label: 'Подробности', after: e.change, long: e.change.length > 60 }],
    };
  });
}

export function getRulesCatalog() {
  return { products: PRODUCTS, rules: CREDIT_RULES, version: 'версия правил 1.0 от 18 октября' };
}

export interface AssistantReply {
  text: string[];
  replies?: Array<{ label: string; to: string }>;
}

export function assistantReply(message: string): AssistantReply {
  const text = message.toLowerCase();
  if (db.settings.assistantMode === 'rules') {
    return {
      text: ['Выберите, на что нужны деньги, — так подбор будет точнее.'],
      replies: [
        { label: 'Кассовый разрыв', to: '/client/financing/goal' },
        { label: 'Пополнить оборот', to: '/client/financing/goal' },
        { label: 'Оборудование', to: '/client/financing/goal' },
      ],
    };
  }
  if (/заявк|статус|решени/.test(text)) {
    return {
      text: ['Статус заявки обновляется сам. Откройте раздел «Мои заявки» — там видно, на каком она этапе.'],
      replies: [{ label: 'Мои заявки', to: '/client/applications' }],
    };
  }
  if (/почему|сумм|платёж|платеж|нагрузк/.test(text)) {
    return {
      text: [
        `Платёж на 3 000 000 ₽ — ${formatApproxMoney(196_500)} в месяц, это 32% денежного потока: на грани.`,
        'При 2 400 000 ₽ платёж будет 157 200 ₽ — 26% потока, комфортная нагрузка.',
      ],
      replies: [{ label: 'Открыть варианты', to: '/client/financing/offers' }],
    };
  }
  return {
    text: [
      'Понимаю. По счёту видно: выручка приходит волнами раз в две недели, за год было 5 закупок партиями.',
      'Предлагаю кредитную линию: берёте нужную часть лимита и гасите с выплат маркетплейса.',
    ],
    replies: [
      { label: 'Открыть варианты', to: '/client/financing/offers' },
      { label: 'Уточнить задачу', to: '/client/financing/dialog' },
    ],
  };
}
