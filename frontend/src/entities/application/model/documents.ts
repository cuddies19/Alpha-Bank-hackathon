import type { ApplicationDocument } from './types';

export const REQUESTABLE_DOCUMENTS: Record<string, { title: string; note: string }> = {
  bs: { title: 'Бухгалтерская отчётность за 2025 год', note: 'Чтобы увидеть выручку и долги компании целиком' },
  stmt: { title: 'Выписка из другого банка за 6 месяцев', note: 'Без неё банк не увидит часть выручки' },
  supply: { title: 'Договор поставки', note: 'Подтверждает цель кредита' },
  other: { title: 'Другой документ', note: 'Подробности — в сообщении специалиста' },
};

export function documentChecklist(companyType: 'ООО' | 'ИП'): ApplicationDocument[] {
  return [
    {
      id: 'bs',
      title: 'Бухгалтерская отчётность за 2025 год',
      note: companyType === 'ООО' ? 'Обязательно для ООО' : 'Желательно, если ведёте отчётность',
      required: companyType === 'ООО',
      status: 'missing',
    },
    {
      id: 'stmt',
      title: 'Выписка из другого банка за 6 месяцев',
      note: 'Желательно, если есть второй счёт',
      required: false,
      status: 'missing',
    },
    {
      id: 'supply',
      title: 'Договор поставки',
      note: 'Желательно: подтверждает цель кредита',
      required: false,
      status: 'missing',
    },
  ];
}
