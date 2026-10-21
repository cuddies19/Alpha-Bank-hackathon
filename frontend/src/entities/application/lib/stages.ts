import { formatMoney, formatMonthsLong, paymentShare } from '@/shared/lib';
import type { StageStatus, TrackerStage } from '@/shared/ui';
import type { Application, ApplicationStatus } from '../model/types';

const SHARE_LIMIT = 30;

type StageKey = 'submitted' | 'checked' | 'enriched' | 'scored' | 'review' | 'decided' | 'signed' | 'issued';

interface StageDraft {
  key: StageKey;
  title: string;
  time?: string;
  hint?: string;
  note?: string;
  doneNote?: string;
}

const CURRENT_STAGE: Record<ApplicationStatus, StageKey | null> = {
  draft: 'submitted',
  submitted: 'checked',
  completeness_check: 'checked',
  enrichment: 'enriched',
  scoring: 'scored',
  rules: 'scored',
  manual_review: 'review',
  needs_info: 'review',
  counter_offer: 'decided',
  rejected: 'decided',
  approved: 'signed',
  issued: null,
};

function needsInfoStages(app: Application): TrackerStage[] {
  return [
    { title: 'Заявка отправлена', status: 'done', time: app.timeline.submitted },
    { title: 'Рассматривает специалист', status: 'done', time: app.timeline.review },
    {
      title: 'Нужны документы',
      status: 'attention',
      time: `до ${app.decision?.deadline ?? '30 октября'}`,
      description: 'Без отчётности и выписки банк не увидит всю выручку и долги компании.',
    },
    { title: 'Решение', status: 'pending' },
  ];
}

export function buildClientStages(app: Application): TrackerStage[] {
  if (app.status === 'needs_info') return needsInfoStages(app);

  const t = app.timeline;
  const decision = app.decision;
  const share = paymentShare(app.payment, app.cashFlow);
  const auto = decision?.decidedBy === 'auto';

  const drafts: StageDraft[] = [
    { key: 'submitted', title: 'Заявка отправлена', time: t.submitted },
    { key: 'checked', title: 'Проверяем данные', time: t.checked, hint: 'обычно до минуты' },
    {
      key: 'enriched',
      title: 'Запрашиваем сведения',
      time: t.enriched,
      hint: 'обычно до 10 минут',
      note: 'ЕГРЮЛ — получено, ФНС — получено, кредитная история — ждём ответа',
      doneNote: app.sourceIssue
        ? 'ЕГРЮЛ и ФНС ответили. Бюро кредитных историй не ответило — передали специалисту'
        : 'ЕГРЮЛ, ФНС «Прозрачный бизнес», кредитная история',
    },
    { key: 'scored', title: 'Оцениваем заявку', time: t.scored, hint: 'обычно до 5 минут' },
  ];
  if (!auto) {
    drafts.push({
      key: 'review',
      title: 'Рассматривает специалист',
      time: t.review,
      hint: app.sourceIssue ? 'обычно до 2 часов' : 'обычно до 1 часа',
      note: app.sourceIssue
        ? 'Специалист запросит кредитную историю повторно или проверит вручную.'
        : share > SHARE_LIMIT
          ? `Платёж на ${formatMoney(app.amount)} — заметная часть денежного потока, поэтому заявку смотрит специалист. Решение придёт сюда.`
          : 'Специалист проверит, комфортен ли платёж для бизнеса.',
    });
  }
  drafts.push(
    {
      key: 'decided',
      title: 'Решение',
      time: t.decided,
      hint: app.status === 'counter_offer' ? `до ${decision?.validUntil ?? '31 октября'}` : undefined,
      note:
        app.status === 'counter_offer' && decision
          ? `Банк предлагает ${formatMoney(decision.amount)} на ${formatMonthsLong(decision.term)}. Примите предложение или откажитесь.`
          : app.closedReason
            ? 'Заявка закрыта по вашему решению.'
            : 'Банк не смог одобрить заявку — посмотрите, что можно сделать.',
    },
    {
      key: 'signed',
      title: 'Подписание',
      time: t.signed,
      hint: 'в кабинете',
      note: 'Подпишите документы — деньги придут сразу.',
    },
    { key: 'issued', title: 'Деньги на счёте', time: t.issued },
  );

  const currentKey = CURRENT_STAGE[app.status];
  const currentIndex = currentKey ? drafts.findIndex((s) => s.key === currentKey) : drafts.length;

  return drafts.map((stage, i): TrackerStage => {
    let status: StageStatus = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'pending';
    if (status === 'current' && app.status === 'rejected') status = 'failed';
    if (status === 'current' && app.status === 'approved') status = 'attention';
    if (status === 'done') {
      return { title: stage.title, status, time: stage.time, description: stage.doneNote };
    }
    return {
      title: stage.title,
      status,
      time: stage.hint,
      description: status === 'pending' ? undefined : stage.note,
    };
  });
}
