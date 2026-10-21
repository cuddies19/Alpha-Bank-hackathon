import type { Application, ApplicationStatus, Decision } from '@/entities/application';
import { annuityPayment, formatMoney, paymentShare } from '@/shared/lib';
import { ANALYST } from './data/bank';
import { db, notificationsFor } from './db';
import { clock, clockSeconds, stamp, uid } from './time';

const STEP_MS = { normal: 8_000, fast: 3_000 } as const;
const FLOW: ApplicationStatus[] = ['submitted', 'completeness_check', 'enrichment', 'scoring', 'rules'];

export const SHARE_LIMIT = 30;
const COUNTER_TARGET_SHARE = 26;
const AUTO_LIMIT = 1_000_000;
export const REVIEW_SLA_MS = 2 * 60 * 60 * 1000;

export function isInPipeline(status: ApplicationStatus) {
  return FLOW.includes(status);
}

function addEvent(app: Application, id: string, text: string, icon: Application['events'][number]['icon'], ms: number) {
  if (app.events.some((e) => e.id === id)) return;
  app.events.unshift({ id, text, time: clock(ms), icon });
}

function audit(app: Application, action: string, change: string, ms: number, role = 'Конвейер') {
  db.audit.unshift({
    id: uid('a'),
    time: clockSeconds(ms),
    who: 'Система',
    role,
    actor: 'system',
    applicationId: app.id,
    action,
    change,
  });
}

function notify(app: Application, id: string, title: string, text: string, to: string, unread: boolean, ms: number) {
  const list = notificationsFor(app.companyId);
  if (list.some((n) => n.id === id)) return;
  list.unshift({ id, title, text, time: clock(ms), day: 'Сегодня, 24 октября', to, unread });
}

export function comfortAmount(app: Pick<Application, 'rate' | 'term' | 'cashFlow'>): number {
  const perRuble = annuityPayment({ principal: 1_000_000, ratePct: app.rate, months: app.term }) / 1_000_000;
  const target = (app.cashFlow * COUNTER_TARGET_SHARE) / 100;
  return Math.floor(target / perRuble / 100_000) * 100_000;
}

function autoApprove(app: Application, ms: number): Decision {
  return {
    outcome: 'approve',
    decidedAt: stamp(ms),
    decidedBy: 'auto',
    amount: app.amount,
    term: app.term,
    rate: app.rate,
    payment: app.payment,
    share: paymentShare(app.payment, app.cashFlow),
    firstPayment: '15 ноября',
    validUntil: '31 октября',
    reasons: [
      { text: 'Поступления по счёту стабильны все 12 месяцев' },
      { text: 'В кредитной истории нет просрочек' },
      { text: `Платёж займёт ${paymentShare(app.payment, app.cashFlow)}% денежного потока — это комфортная нагрузка` },
    ],
  };
}

function route(app: Application, ms: number) {
  const share = paymentShare(app.payment, app.cashFlow);
  const bkiDown = db.sources.find((s) => s.id === 'bki')?.state === 'down';
  app.timeline.scored = clock(ms);
  addEvent(app, 'ev-scored', 'Оценка завершена', 'check', ms);

  if (
    !bkiDown &&
    share <= SHARE_LIMIT &&
    app.amount <= AUTO_LIMIT &&
    (app.riskClass === 'A' || app.riskClass === 'B')
  ) {
    app.status = 'approved';
    app.decision = autoApprove(app, ms);
    app.timeline.decided = clock(ms);
    app.recommendation = 'approve';
    app.tags = [{ label: 'Авторешение', tone: 'neutral', icon: false }];
    addEvent(
      app,
      'ev-decided',
      `Банк одобрил ${app.productName.toLowerCase()} ${formatMoney(app.amount)}`,
      'check-circle',
      ms,
    );
    notify(
      app,
      `n-decided-${app.id}`,
      `Банк одобрил заявку № ${app.id}`,
      'Примите условия до 31 октября',
      `/client/applications/${app.id}/decision`,
      true,
      ms,
    );
    audit(app, 'Авторешение', 'Оценка → Одобрено', ms);
    return;
  }

  app.status = 'manual_review';
  app.reviewStartedMs = ms;
  app.recommendation = bkiDown ? undefined : share > SHARE_LIMIT ? 'counter' : 'approve';
  if (bkiDown) {
    app.sourceIssue = 'Бюро кредитных историй не ответило';
    app.tags = [{ label: 'Источник недоступен', tone: 'warning', icon: 'alert' }];
  }
  app.isNew = true;
  addEvent(app, 'ev-review', 'Заявка передана специалисту банка', 'clock', ms);
  notify(
    app,
    `n-review-${app.id}`,
    'Заявка перешла к специалисту',
    'Обычно это занимает до часа',
    `/client/applications/${app.id}`,
    false,
    ms,
  );
  audit(
    app,
    'Передана на ручное рассмотрение',
    bkiDown
      ? 'БКИ не ответило → ручная проверка'
      : share > SHARE_LIMIT
        ? `Доля платежа ${share}% выше ${SHARE_LIMIT}%`
        : 'Оценка → Ручное рассмотрение',
    ms,
  );
}

export function advance(app: Application, now = Date.now()) {
  if (!app.submittedAtMs || !isInPipeline(app.status)) return;
  const step = STEP_MS[db.settings.pipelineSpeed];
  const start = app.submittedAtMs;
  const k = Math.floor((now - start) / step);
  const at = (n: number) => start + n * step;
  const bkiDown = db.sources.find((s) => s.id === 'bki')?.state === 'down';

  if (k >= 2 && !app.timeline.checked) {
    app.timeline.checked = clock(at(2));
    addEvent(app, 'ev-checked', 'Данные и документы проверены', 'check', at(2));
    audit(app, 'Проверка полноты пройдена', 'Подана → Проверка источников', at(2));
  }
  if (k >= 3 && !app.timeline.enriched) {
    app.timeline.enriched = clock(at(3));
    addEvent(
      app,
      'ev-enriched',
      bkiDown
        ? 'ЕГРЮЛ и ФНС ответили, бюро кредитных историй — нет'
        : 'Получены сведения из ЕГРЮЛ, ФНС и бюро кредитных историй',
      bkiDown ? 'alert' : 'check',
      at(3),
    );
  }
  if (k >= 5) {
    route(app, at(5));
    return;
  }
  app.status = FLOW[Math.min(k, FLOW.length - 1)];
}

export function submit(app: Application, now = Date.now()) {
  app.status = 'submitted';
  app.submittedAtMs = now;
  app.submittedAt = stamp(now);
  app.draftStep = undefined;
  app.timeline = { submitted: clock(now) };
  app.sourceIssue = undefined;
  addEvent(app, `ev-submitted-${now}`, 'Заявка отправлена', 'arrow-up', now);
  notify(
    app,
    `n-submitted-${now}`,
    `Заявка № ${app.id} отправлена`,
    'Решение придёт сюда, в кабинет',
    `/client/applications/${app.id}`,
    false,
    now,
  );
  db.audit.unshift({
    id: uid('a'),
    time: clockSeconds(now),
    who: app.companyName,
    role: 'Клиент',
    actor: 'client',
    applicationId: app.id,
    action: 'Заявка отправлена',
    change: 'Черновик → Подана',
  });
}

export { ANALYST };
