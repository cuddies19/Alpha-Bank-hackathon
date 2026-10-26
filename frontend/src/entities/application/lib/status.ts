import { daysFromNowLabel } from '@/shared/lib';
import type { Tone } from '@/shared/ui';
import type { Application, ApplicationStatus, DecisionOutcome, RiskClass } from '../model/types';

interface StatusView {
  label: string;
  tone: Tone;
}

const CLIENT_STATUS: Record<ApplicationStatus, StatusView> = {
  draft: { label: 'Черновик', tone: 'neutral' },
  submitted: { label: 'Заявка отправлена', tone: 'info' },
  completeness_check: { label: 'Проверяем данные', tone: 'info' },
  enrichment: { label: 'Запрашиваем сведения', tone: 'info' },
  scoring: { label: 'Оцениваем заявку', tone: 'info' },
  rules: { label: 'Оцениваем заявку', tone: 'info' },
  manual_review: { label: 'Рассматривает специалист', tone: 'info' },
  needs_info: { label: 'Нужны документы', tone: 'warning' },
  counter_offer: { label: 'Предложение банка', tone: 'warning' },
  approved: { label: 'Одобрено', tone: 'success' },
  rejected: { label: 'Отказ', tone: 'danger' },
  issued: { label: 'Деньги зачислены', tone: 'success' },
};

export function clientStatus(app: Pick<Application, 'status' | 'closedReason'>): StatusView {
  if (app.closedReason) return { label: 'Закрыта', tone: 'neutral' };
  return CLIENT_STATUS[app.status];
}

const BANK_STATUS: Partial<Record<ApplicationStatus, StatusView>> = {
  manual_review: { label: 'Ручное рассмотрение', tone: 'info' },
  needs_info: { label: 'Ждёт клиента', tone: 'warning' },
  counter_offer: { label: 'Встречное предложение', tone: 'warning' },
  approved: { label: 'Одобрено', tone: 'success' },
  rejected: { label: 'Отказ', tone: 'danger' },
  issued: { label: 'Выдано', tone: 'success' },
};

export function bankStatus(app: Pick<Application, 'status' | 'closedReason'>): StatusView {
  if (app.closedReason) return { label: 'Закрыта клиентом', tone: 'neutral' };
  return BANK_STATUS[app.status] ?? { label: 'В конвейере', tone: 'info' };
}

export const PIPELINE_STATUSES: ApplicationStatus[] = [
  'submitted',
  'completeness_check',
  'enrichment',
  'scoring',
  'rules',
];

export function isProcessing(status: ApplicationStatus) {
  return PIPELINE_STATUSES.includes(status);
}

export function isActive(app: Pick<Application, 'status'>) {
  return app.status !== 'draft' && app.status !== 'issued' && app.status !== 'rejected';
}

export function isFinished(app: Pick<Application, 'status'>) {
  return app.status === 'issued' || app.status === 'rejected';
}

export const OUTCOME_LABEL: Record<DecisionOutcome, string> = {
  approve: 'Одобрить',
  counter: 'Встречное предложение',
  request: 'Запросить данные',
  decline: 'Отказать',
};

export const OUTCOME_RESULT: Record<DecisionOutcome, string> = {
  approve: 'Одобрено',
  counter: 'Встречное предложение',
  request: 'Запрошены данные',
  decline: 'Отказ',
};

export const RISK_TONE: Record<RiskClass, Tone> = { A: 'success', B: 'info', C: 'warning', D: 'warning', E: 'danger' };

export function recommendationLabel(app: Pick<Application, 'recommendation' | 'sourceIssue'>) {
  if (app.sourceIssue) return 'Нет кредитной истории';
  return app.recommendation ? OUTCOME_LABEL[app.recommendation] : '—';
}

export function clientTodo(app: Application): string {
  if (app.closedReason) return '—';
  switch (app.status) {
    case 'draft':
      return `Заполнить шаг ${app.draftStep ?? 1} и отправить`;
    case 'needs_info':
      return `Загрузить документы до ${app.decision?.deadline ?? daysFromNowLabel(7)}`;
    case 'counter_offer':
      return `Принять или отказаться до ${app.decision?.validUntil ?? daysFromNowLabel(7)}`;
    case 'approved':
      return 'Подписать документы';
    case 'issued':
    case 'rejected':
      return '—';
    default:
      return 'Ничего — ждём решение банка';
  }
}
