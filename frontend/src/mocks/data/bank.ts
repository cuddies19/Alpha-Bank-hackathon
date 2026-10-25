import type { CaseHistoryEntry, ScoringFactor, SourceCheck } from '@/entities/application';
import type { MockAuditEvent } from '../db';
import type { PipelineStats, Source } from '@/entities/integration';

export const ANALYST = 'О. Кравцова';

export function seedSources(): Source[] {
  return [
    {
      id: 'egrul',
      name: 'ЕГРЮЛ / ЕГРИП',
      state: 'up',
      responseTime: '0,8 с',
      errorsPerHour: 0,
      lastSuccess: 'сегодня, 11:20',
      fallbackRule: 'Заявка ждёт до 3 попыток, затем — ручная проверка',
    },
    {
      id: 'fns',
      name: 'ФНС «Прозрачный бизнес»',
      state: 'up',
      responseTime: '1,2 с',
      errorsPerHour: 0,
      lastSuccess: 'сегодня, 11:19',
      fallbackRule: 'Ручная проверка налоговой задолженности',
    },
    {
      id: 'bki',
      name: 'Бюро кредитных историй',
      state: 'up',
      responseTime: '1,4 с',
      errorsPerHour: 0,
      lastSuccess: 'сегодня, 11:20',
      fallbackRule: 'Заявка уходит на ручную проверку',
    },
    {
      id: 'statement',
      name: 'Выписка по счёту',
      state: 'up',
      responseTime: '0,4 с',
      errorsPerHour: 0,
      lastSuccess: 'сегодня, 11:20',
      fallbackRule: 'Клиенту предлагают загрузить выписку файлом',
    },
    {
      id: 'scoring',
      name: 'Сервис оценки',
      state: 'slow',
      responseTime: '2,9 с',
      errorsPerHour: 1,
      lastSuccess: 'сегодня, 11:18',
      fallbackRule: 'Правила продукта без балла, ручная проверка',
    },
  ];
}

export const DOM_I_UYUT_CHECKS: SourceCheck[] = [
  {
    id: 'egrul',
    name: 'ЕГРЮЛ / ЕГРИП',
    status: 'ok',
    summary: 'Компания действует, руководитель совпадает с заявкой',
    time: '0,8 с',
    details: [
      { term: 'Статус', details: 'Действующее' },
      { term: 'Зарегистрировано', details: '12 июня 2024 года' },
      { term: 'ОКВЭД', details: '47.91' },
      { term: 'Руководитель', details: 'Соколов И. А.' },
    ],
  },
  {
    id: 'fns',
    name: 'ФНС «Прозрачный бизнес»',
    status: 'ok',
    summary: 'Налоговой задолженности нет',
    time: '1,2 с',
    details: [
      { term: 'Налоговая задолженность', details: 'Нет' },
      { term: 'Недостоверный адрес', details: 'Нет' },
      { term: 'Доходы за 2025 год', details: '44 800 000 ₽' },
      { term: 'Среднесписочная численность', details: '6' },
    ],
  },
  {
    id: 'bki',
    name: 'Бюро кредитных историй',
    status: 'ok',
    summary: '1 действующий кредит, просрочек нет',
    time: '1,4 с',
    details: [
      { term: 'Действующие кредиты', details: '1 в другом банке: остаток 450 000 ₽, платёж 38 000 ₽ в месяц' },
      { term: 'Просрочки за 24 месяца', details: 'Нет' },
      { term: 'Запросы истории за 30 дней', details: '2' },
      { term: 'Согласие клиента', details: 'Подписано 24 октября, 10:50' },
    ],
  },
  {
    id: 'statement',
    name: 'Выписка по счёту',
    status: 'warn',
    summary: 'Поток стабильный, но сезонность высокая',
    time: '0,4 с',
    details: [
      { term: 'Средний чистый поток', details: '610 000 ₽ в месяц' },
      { term: 'Сезонность', details: 'Высокая: пик в 2,2 раза выше спада' },
      { term: 'Поступления за 12 мес.', details: '33 210 000 ₽' },
      { term: 'Второй счёт', details: 'Выписка загружена клиентом, принята' },
    ],
    note: {
      title: 'Расхождение с ФНС объяснимо',
      text: 'Доходы по ФНС выше поступлений на счёт на 11,6 млн ₽ — часть выручки идёт на второй счёт.',
    },
  },
];

export const DOM_I_UYUT_FACTORS: ScoringFactor[] = [
  { label: 'Стабильный оборот 12 месяцев', value: 48 },
  { label: 'Нет просрочек', value: 35 },
  { label: 'Долговая нагрузка 32% потока', value: -41 },
  { label: 'Возраст бизнеса 2 года', value: -12 },
  { label: 'Высокая сезонность выручки', value: -9 },
];

export const DOM_I_UYUT_HISTORY: CaseHistoryEntry[] = [
  {
    id: 'h1',
    time: '11:05:31',
    what: 'Передана на ручное рассмотрение',
    detail: 'Правило «доля платежа не выше 30%» не пройдено: 32%',
    actor: 'Система',
  },
  {
    id: 'h2',
    time: '11:05:30',
    what: 'Правила продукта',
    detail: '4 из 5 пройдены, рекомендация — встречное предложение 2 400 000 ₽',
    actor: 'Система',
  },
  { id: 'h3', time: '11:05:29', what: 'Скоринг', detail: 'scorecard v1.2: 640, класс B', actor: 'Система' },
  {
    id: 'h4',
    time: '10:58:04',
    what: 'Ответ бюро кредитных историй',
    detail: '1,4 с · 1 действующий кредит, просрочек нет',
    actor: 'Система',
  },
  {
    id: 'h5',
    time: '10:58:03',
    what: 'Ответ ФНС «Прозрачный бизнес»',
    detail: '1,2 с · задолженности нет',
    actor: 'Система',
  },
  { id: 'h6', time: '10:58:02', what: 'Ответ ЕГРЮЛ', detail: '0,8 с · компания действует', actor: 'Система' },
  {
    id: 'h7',
    time: '10:52:40',
    what: 'Проверка полноты пройдена',
    detail: 'Обязательные документы и согласия на месте',
    actor: 'Система',
  },
  { id: 'h8', time: '10:51:14', what: 'Заявка отправлена', detail: 'Черновик → Подана', actor: 'Клиент' },
  {
    id: 'h9',
    time: '10:50:02',
    what: 'Подписано согласие на запрос в БКИ',
    detail: 'Подсказка ассистента на шаге 4',
    actor: 'Клиент',
  },
  {
    id: 'h10',
    time: '10:42:10',
    what: 'Черновик создан из подбора',
    detail: 'Поля перенесены из диалога с ассистентом',
    actor: 'Клиент',
  },
];

export function seedAudit(): MockAuditEvent[] {
  return [
    {
      id: 'a5',
      time: '11:18:55',
      who: 'Система',
      role: 'Конвейер',
      actor: 'system',
      applicationId: '2026-10-0144',
      action: 'Источник не ответил',
      change: 'БКИ: 3 попытки по 10 с → ручная проверка',
    },
    {
      id: 'a8',
      time: '11:02:17',
      who: 'Система',
      role: 'Мониторинг',
      actor: 'system',
      applicationId: '—',
      action: 'Сбой источника',
      change: 'БКИ: работает → не отвечает',
    },
    {
      id: 'a12',
      time: '10:31:22',
      who: 'Система',
      role: 'Конвейер',
      actor: 'system',
      applicationId: '2026-10-0139',
      action: 'Авторешение',
      change: 'Оценка → Одобрено',
    },
    {
      id: 'a13',
      time: '10:12:45',
      who: 'Система',
      role: 'Правила',
      actor: 'system',
      applicationId: '2026-10-0140',
      action: 'Стоп-правило',
      change: 'Оценка → Отказ: просрочка больше 60 дней',
    },
    {
      id: 'a14',
      time: '09:40:12',
      who: ANALYST,
      role: 'Сотрудник',
      actor: 'staff',
      applicationId: '2026-10-0141',
      action: 'Запрошены документы',
      change: 'Ручное рассмотрение → Нужны данные',
    },
  ];
}

export const PIPELINE_STATS: PipelineStats = {
  period: '18–24 октября',
  metrics: {
    applications: 128,
    applicationsDelta: '+9%',
    autoShare: '64%',
    autoHint: '70 из 109 решений',
    avgTime: '2 ч 40 мин',
    avgTimeDelta: '−25 мин',
    waitingClient: 9,
  },
  funnel: [
    { label: 'Подано', value: 128 },
    { label: 'Проверка полноты', value: 121 },
    { label: 'Источники', value: 117 },
    { label: 'Оценка', value: 115 },
    { label: 'Решение', value: 109 },
    { label: 'Выдано', value: 61 },
  ],
  funnelNote: '7 заявок отсеяны на проверке полноты: не хватало согласий или обязательных документов.',
  outcomes: [
    { label: 'Одобрено', value: 58 },
    { label: 'Встречное', value: 17 },
    { label: 'Дозапрос', value: 16 },
    { label: 'Отказ', value: 18 },
  ],
  declineReasons: [
    { label: 'Просрочка больше 60 дней', value: 7 },
    { label: 'Налоговая задолженность', value: 5 },
    { label: 'Бизнесу меньше 12 месяцев', value: 4 },
    { label: 'Класс риска ниже C', value: 2 },
  ],
  requestReasons: [
    { label: 'Нет бухгалтерской отчётности', value: 8 },
    { label: 'Нет выписки из другого банка', value: 5 },
    { label: 'Нечитаемый документ', value: 3 },
  ],
};

export const CREDIT_RULES = [
  {
    rule: 'Доля платежа в чистом потоке',
    threshold: 'не выше 30%',
    kind: 'Подбор условий',
    onFail: 'Встречное предложение с меньшей суммой',
  },
  { rule: 'Минимальный класс риска', threshold: 'C', kind: 'Стоп-правило', onFail: 'Отказ' },
  {
    rule: 'Возраст бизнеса',
    threshold: 'от 12 месяцев',
    kind: 'Стоп-правило',
    onFail: 'Отказ, альтернатива — овердрафт',
  },
  {
    rule: 'Просрочка в кредитной истории',
    threshold: 'не больше 60 дней за 12 мес.',
    kind: 'Стоп-правило',
    onFail: 'Отказ с планом улучшения',
  },
  { rule: 'Налоговая задолженность', threshold: 'нет', kind: 'Стоп-правило', onFail: 'Отказ' },
  {
    rule: 'Комплект документов',
    threshold: 'полный для формы бизнеса',
    kind: 'Проверка полноты',
    onFail: 'Дозапрос у клиента',
  },
  {
    rule: 'Автоматическое решение',
    threshold: 'класс A–B, все правила пройдены, сумма до 1 000 000 ₽',
    kind: 'Маршрутизация',
    onFail: 'Ручное рассмотрение',
  },
  {
    rule: 'Источник не ответил',
    threshold: '3 попытки по 10 с',
    kind: 'Отказоустойчивость',
    onFail: 'Ручное рассмотрение с меткой',
  },
];
