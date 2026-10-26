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

const SLOT_DOC_TYPE: Record<string, string> = {
  bs: 'financial_statements',
  stmt: 'other_bank_statement',
  supply: 'supply_contract',
};

export function backendDocType(idOrTitle: string): string {
  if (SLOT_DOC_TYPE[idOrTitle]) return SLOT_DOC_TYPE[idOrTitle];
  if (/отч[её]тност/i.test(idOrTitle)) return 'financial_statements';
  if (/выписк.*(друг|другом)/i.test(idOrTitle)) return 'other_bank_statement';
  if (/договор/i.test(idOrTitle)) return 'supply_contract';
  return idOrTitle;
}

export function slotForDocType(docType: string): string | undefined {
  return Object.entries(SLOT_DOC_TYPE).find(([, type]) => type === docType)?.[0];
}
