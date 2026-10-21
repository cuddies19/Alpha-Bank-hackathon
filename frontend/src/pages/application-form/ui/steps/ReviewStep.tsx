import { Link } from 'react-router';
import { useCompanyProfile } from '@/entities/company';
import { routes, type ApplicationFormStep } from '@/shared/config';
import { formatMoney, formatMonths } from '@/shared/lib';
import { Alert, ConsentItem, DescriptionList, Section, type DescriptionItem } from '@/shared/ui';
import type { StepProps } from './ParametersStep';

const DOC_WORD = {
  ok: 'Принят',
  checking: 'Проверяем',
  uploading: 'Загружается',
  error: 'Нужно заменить',
  missing: 'Не загружен',
} as const;
const DOC_TONE = {
  ok: 'success',
  checking: 'info',
  uploading: 'secondary',
  error: 'danger',
  missing: 'secondary',
} as const;

function EditLink({ id, step }: { id: string; step: ApplicationFormStep }) {
  return (
    <Link className="body-strong" to={routes.client.applicationForm(id, step)}>
      Изменить
    </Link>
  );
}

export function ReviewStep({ app, onSave }: StepProps) {
  const profile = useCompanyProfile(app.companyId);
  const company = profile.data?.company;
  const consents = profile.data?.consents ?? [];
  const missing = consents.filter((c) => !app.consents[c.id]);
  const given = consents.filter((c) => app.consents[c.id]);

  const section = (title: string, step: ApplicationFormStep, items: DescriptionItem[]) => (
    <Section title={title} gap={3} aside={<EditLink id={app.id} step={step} />}>
      <DescriptionList variant="rows" items={items} />
    </Section>
  );

  return (
    <>
      {missing.length ? (
        <Alert tone="assistant" title={missing.length === 1 ? 'Не хватает одного согласия' : 'Не хватает согласий'}>
          Не отмечено {missing.map((c) => c.title[0].toLowerCase() + c.title.slice(1)).join(', ')} —{' '}
          {missing.length === 1 ? 'без него' : 'без них'} банк не сможет оценить заявку. Отметьте ниже, остальное
          готово.
        </Alert>
      ) : (
        <Alert tone="success" title="Всё готово к отправке">
          Банк проверит данные и сообщит о решении здесь, в кабинете.
        </Alert>
      )}
      {section('Параметры', 'parameters', [
        { term: 'Продукт', details: app.productName },
        { term: 'Сумма и срок', details: `${formatMoney(app.amount)} · ${formatMonths(app.term)}` },
        { term: 'Цель', details: app.goal },
        { term: 'Деньги нужны', details: app.neededBy },
        { term: 'Источник возврата', details: app.repaymentSource },
      ])}
      {section('Компания', 'company', [
        { term: 'Название', details: app.companyName },
        { term: 'ИНН', details: app.inn },
        { term: 'Руководитель', details: company?.directorShort ?? '…' },
        { term: 'Контактное лицо', details: company?.contactName ?? '…' },
      ])}
      {section(
        'Финансы и документы',
        'finance',
        app.documents.map((d) => ({
          term: d.title,
          details: d.status === 'missing' && !d.required ? 'Необязательно, можно позже' : DOC_WORD[d.status],
          tone: d.status === 'missing' && !d.required ? 'secondary' : DOC_TONE[d.status],
          regular: d.status === 'missing' && !d.required,
        })),
      )}
      <Section title="Согласия" gap={3} aside={<EditLink id={app.id} step="company" />}>
        {missing.map((consent) => (
          <ConsentItem
            key={consent.id}
            title={consent.title}
            text={consent.text}
            checked={false}
            missing
            onChange={(checked) => onSave({ consents: { [consent.id]: checked } })}
          />
        ))}
        {given.length ? (
          <DescriptionList
            variant="rows"
            items={given.map((c) => ({ term: c.shortTitle, details: `Дано ${app.consents[c.id]}`, tone: 'success' }))}
          />
        ) : null}
      </Section>
    </>
  );
}
