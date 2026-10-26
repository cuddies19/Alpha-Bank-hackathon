import type {
  Application,
  ApplicationCase,
  CaseDocument,
  ProductRuleResult,
  RiskClass,
  SourceCheck,
} from '@/entities/application';
import { formatMoney, formatMonths, formatMonthsLong, paymentShare } from '@/shared/lib';
import { YEAR_TURNOVER } from './data/account';
import { DOM_I_UYUT_CHECKS, DOM_I_UYUT_FACTORS, DOM_I_UYUT_HISTORY } from './data/bank';
import { COMPANIES } from './data/companies';
import { PRODUCTS } from './data/products';
import { db } from './db';
import { SHARE_LIMIT, comfortAmount, isInPipeline } from './pipeline';

const SCORE: Record<RiskClass, { score: number; label: string; pd: string }> = {
  A: { score: 790, label: 'низкий риск', pd: '1,9%' },
  B: { score: 640, label: 'умеренный риск', pd: '4,8%' },
  C: { score: 590, label: 'повышенный риск', pd: '8,6%' },
  D: { score: 480, label: 'высокий риск', pd: '15,2%' },
  E: { score: 330, label: 'очень высокий риск', pd: '31,0%' },
};

function turnoverFor(app: Application) {
  const detailed = YEAR_TURNOVER[app.companyId];
  if (detailed) return detailed.months;
  const scale = app.cashFlow / 610000;
  return YEAR_TURNOVER['dom-i-uyut'].months.map((m) => ({
    label: m.label,
    income: +(m.income * scale).toFixed(2),
    outcome: +(m.outcome * scale).toFixed(2),
  }));
}

const BKI_FAILED: SourceCheck = {
  id: 'bki',
  name: 'Бюро кредитных историй',
  status: 'fail',
  summary: 'Не ответило за 10 секунд, 3 попытки',
  time: '10 с × 3',
  details: [{ term: 'Что делать', details: 'Запросите повторно или проверьте вручную' }],
};

function genericChecks(app: Application, company: (typeof COMPANIES)[number]): SourceCheck[] {
  const bkiFailed = Boolean(app.sourceIssue);
  return [
    {
      id: 'egrul',
      name: 'ЕГРЮЛ / ЕГРИП',
      status: 'ok',
      summary: 'Компания действует, руководитель совпадает с заявкой',
      time: '0,8 с',
      details: [
        { term: 'Статус', details: 'Действующее' },
        { term: 'Зарегистрировано', details: company.registeredAt },
        { term: 'ОКВЭД', details: company.okved },
        { term: 'Руководитель', details: company.directorShort },
      ],
    },
    {
      id: 'fns',
      name: 'ФНС «Прозрачный бизнес»',
      status: 'ok',
      summary: 'Налоговой задолженности нет',
      time: '1,1 с',
      details: [
        { term: 'Налоговая задолженность', details: 'Нет' },
        { term: 'Недостоверный адрес', details: 'Нет' },
        { term: 'Среднесписочная численность', details: String(company.employees) },
      ],
    },
    bkiFailed
      ? BKI_FAILED
      : {
          id: 'bki',
          name: 'Бюро кредитных историй',
          status: app.riskClass === 'E' ? 'fail' : 'ok',
          summary: app.riskClass === 'E' ? 'Просрочка 74 дня за последний год' : 'Просрочек нет',
          time: '1,4 с',
          details: [
            {
              term: 'Просрочки за 24 месяца',
              details: app.riskClass === 'E' ? '1, 74 дня, погашена в марте 2026' : 'Нет',
            },
            { term: 'Согласие клиента', details: app.consents.bki ? `Подписано ${app.consents.bki}` : 'Нет' },
          ],
        },
    {
      id: 'statement',
      name: 'Выписка по счёту',
      status: 'ok',
      summary: 'Поток стабильный',
      time: '0,4 с',
      details: [{ term: 'Средний чистый поток', details: `${formatMoney(app.cashFlow)} в месяц` }],
    },
  ];
}

function rulesFor(app: Application, riskClass: RiskClass | undefined): ProductRuleResult[] {
  const product = PRODUCTS.find((p) => p.id === app.productId);
  const share = paymentShare(app.payment, app.cashFlow);
  const inLimit =
    !product?.limitMin || (app.amount >= product.limitMin && app.amount <= (product.limitMax ?? Infinity));
  return [
    {
      rule: 'Сумма в лимите продукта',
      value: formatMoney(app.amount),
      threshold: product?.limitMin
        ? `${formatMoney(product.limitMin, { currency: false })} – ${formatMoney(product.limitMax ?? 0)}`
        : '—',
      passed: inLimit,
    },
    { rule: 'Возраст бизнеса', value: '28 месяцев', threshold: 'от 12 месяцев', passed: true },
    { rule: 'Нет налоговой задолженности', value: 'Нет долга', threshold: 'Нет долга', passed: true },
    {
      rule: 'Класс риска',
      value: riskClass ?? 'нет данных',
      threshold: 'не ниже C',
      passed: !!riskClass && riskClass <= 'C',
    },
    {
      rule: 'Доля платежа в потоке',
      value: `${share}%`,
      threshold: `не выше ${SHARE_LIMIT}%`,
      passed: share <= SHARE_LIMIT,
    },
  ];
}

function documentsFor(app: Application, mask: string): CaseDocument[] {
  const who = app.companyName;
  const uploaded: CaseDocument[] = app.documents
    .filter((d) => d.fileName)
    .map((d) => ({
      id: d.id,
      name: d.title,
      meta: `${d.fileName?.split('.').pop()?.toUpperCase() ?? 'PDF'} · ${d.required ? 'обязательный' : 'необязательный'}`,
      status: d.status === 'ok' ? 'Принят' : d.status === 'error' ? 'Нужно заменить' : 'Проверяем',
      tone: d.status === 'ok' ? 'success' : d.status === 'error' ? 'danger' : 'info',
      who,
      when: app.submittedAt ?? app.createdAt,
    }));
  return [
    ...uploaded,
    {
      id: 'statement',
      name: `Выписка по счёту •• ${mask}`,
      meta: 'Автоматически из банка · 12 месяцев',
      status: 'Принят',
      tone: 'success',
      who: 'Система',
      when: app.submittedAt ?? app.createdAt,
    },
    {
      id: 'consent-bki',
      name: 'Согласие на запрос в БКИ',
      meta: 'Подписано в кабинете',
      status: app.consents.bki ? 'Подписано' : 'Нет',
      tone: app.consents.bki ? 'success' : 'warning',
      who,
      when: app.consents.bki ?? '—',
    },
    {
      id: 'consent-pd',
      name: 'Согласие на обработку данных и анализ счёта',
      meta: 'Подписано в кабинете',
      status: app.consents.pd ? 'Подписано' : 'Нет',
      tone: app.consents.pd ? 'success' : 'warning',
      who,
      when: app.consents.pd ?? '—',
    },
  ];
}

export function buildCase(app: Application): ApplicationCase {
  const company = COMPANIES.find((c) => c.id === app.companyId) ?? COMPANIES[0];
  const isDomIUyut = app.companyId === 'dom-i-uyut' && app.productId === 'credit-line';
  const riskClass = app.sourceIssue ? undefined : app.riskClass;
  const share = paymentShare(app.payment, app.cashFlow);
  const outcome = app.recommendation ?? (riskClass ? 'approve' : 'request');
  const counter = outcome === 'counter' ? comfortAmount(app) : app.amount;
  const counterShare = outcome === 'counter' ? 26 : share;
  const rules = rulesFor(app, riskClass);
  const passed = rules.filter((r) => r.passed).length;
  const history = db.audit
    .filter((e) => e.applicationId === app.id)
    .map((e) => ({
      id: e.id,
      time: e.time,
      what: e.action,
      detail: e.change,
      actor: e.actor === 'system' ? 'Система' : e.actor === 'client' ? 'Клиент' : 'Сотрудник',
    })) as ApplicationCase['history'];
  const turnover = turnoverFor(app);
  const totalIncome =
    YEAR_TURNOVER[app.companyId]?.totalIncome ?? Math.round(turnover.reduce((s, m) => s + m.income, 0) * 1000000);

  const recommendationText =
    outcome === 'counter'
      ? `${formatMoney(counter)} на ${formatMonths(app.term)} — доля платежа ${share}% выше порога ${SHARE_LIMIT}%.`
      : outcome === 'request'
        ? app.sourceIssue
          ? 'Кредитная история не пришла — проверьте вручную или запросите повторно.'
          : 'Не хватает документов, чтобы увидеть всю выручку.'
        : outcome === 'decline'
          ? 'Стоп-правило: просрочка больше 60 дней за 12 месяцев.'
          : `${formatMoney(app.amount)} на ${formatMonths(app.term)} — все правила продукта пройдены.`;

  return {
    application: app,
    cashFlow: app.cashFlow,
    recommendation: { outcome, text: recommendationText, amount: counter, term: app.term, share: counterShare },
    scoring: riskClass
      ? {
          score: SCORE[riskClass].score,
          riskClass,
          riskLabel: SCORE[riskClass].label,
          pd: SCORE[riskClass].pd,
          model: 'scorecard v1.2',
          calculatedAt: app.timeline.scored ?? app.submittedAt ?? '—',
          factors: isDomIUyut
            ? DOM_I_UYUT_FACTORS
            : [
                { label: 'Стабильный оборот 12 месяцев', value: 42 },
                { label: 'Нет просрочек', value: riskClass === 'E' ? -48 : 30 },
                { label: `Долговая нагрузка ${share}% потока`, value: share > SHARE_LIMIT ? -38 : -10 },
                { label: `Возраст бизнеса: ${company.age}`, value: 8 },
              ],
        }
      : null,
    rules,
    rulesSummary:
      passed === rules.length
        ? { tone: 'success', title: 'Итог правил: можно одобрить', text: 'Все правила продукта пройдены.' }
        : outcome === 'counter'
          ? {
              tone: 'warning',
              title: 'Итог правил: встречное предложение',
              text: `Подобрана сумма, при которой платёж ${counterShare}% потока: ${formatMoney(counter)} на ${formatMonthsLong(app.term)}. Остальные правила пройдены.`,
            }
          : {
              tone: 'danger',
              title: `Итог правил: ${passed} из ${rules.length} пройдены`,
              text: 'Проверьте непройденные правила перед решением.',
            },
    checks: isDomIUyut
      ? DOM_I_UYUT_CHECKS.map((check) => (check.id === 'bki' && app.sourceIssue ? BKI_FAILED : check))
      : genericChecks(app, company),
    checksAt: app.timeline.enriched ? `24 октября, ${app.timeline.enriched}` : (app.submittedAt ?? '—'),
    client: {
      rows: [
        { term: 'Название', details: company.shortName },
        { term: 'ИНН / ОГРН', details: `${company.inn} / ${company.ogrn}` },
        { term: 'Регистрация', details: company.registeredAt },
        { term: 'Возраст бизнеса', details: company.age },
        { term: 'ОКВЭД', details: `${company.okved} — ${company.okvedTitle.toLowerCase()}` },
        { term: 'Сотрудники', details: `${company.employees}, среднесписочная численность` },
        { term: 'Каналы продаж', details: company.salesChannels ?? '—' },
        { term: 'Счёт в банке', details: `•• ${company.accountMask}, ${company.accountSince}` },
      ],
      director: [
        { term: 'ФИО', details: company.director },
        {
          term: 'Должность',
          details: company.directorShare
            ? `${company.directorPosition[0].toUpperCase()}${company.directorPosition.slice(1)}, ${company.directorShare}`
            : company.directorPosition,
        },
        { term: 'Паспорт', details: company.passportMasked },
        { term: 'Дата рождения', details: company.birthDateMasked },
      ],
      turnover,
      turnoverStats: [
        { term: 'Поступления за 12 мес.', details: formatMoney(totalIncome) },
        { term: 'Средний чистый поток', details: `${formatMoney(app.cashFlow)} в месяц` },
        isDomIUyut
          ? { term: 'Сезонность', details: 'Высокая: пик в 2,2 раза выше спада', tone: 'warning' }
          : { term: 'Сезонность', details: 'Умеренная' },
      ],
      obligations: (YEAR_TURNOVER[app.companyId]?.existingLoans ?? []).map((loan) => ({
        creditor: 'Другой банк',
        kind: 'Кредит на развитие',
        rest: loan.rest,
        payment: loan.payment,
        until: 'март 2027',
        source: 'БКИ, выписка',
      })),
    },
    history: history.length ? history : isDomIUyut ? DOM_I_UYUT_HISTORY : [],
    documents: documentsFor(app, company.accountMask),
    documentsComplete: app.documents.filter((d) => d.required).every((d) => d.status === 'ok'),
    decided: !isInPipeline(app.status) && app.status !== 'manual_review',
  };
}
