import type { Application } from '@/entities/application';
import { formatApproxMoney, formatMoney, formatMonths, formatPercent } from '@/shared/lib';
import { DescriptionList, PaymentLoadMeter, Section, type DescriptionItem } from '@/shared/ui';

type Row = 'product' | 'amount' | 'term' | 'rate' | 'payment' | 'documents';

export function ApplicationSummary({ app, rows, meter }: { app: Application; rows: Row[]; meter?: boolean }) {
  const required = app.documents.filter((d) => d.required);
  const all: Record<Row, DescriptionItem> = {
    product: { term: 'Продукт', details: app.productName },
    amount: { term: 'Сумма', details: formatMoney(app.amount) },
    term: { term: 'Срок', details: formatMonths(app.term) },
    rate: { term: 'Ставка', details: `от ${formatPercent(app.rate)}` },
    payment: { term: 'Платёж', details: formatApproxMoney(app.payment) },
    documents: {
      term: 'Документы',
      details: `${required.filter((d) => d.status === 'ok').length} из ${required.length} обязательных`,
    },
  };
  return (
    <Section title="Ваша заявка">
      <DescriptionList variant="rows" items={rows.map((r) => all[r])} />
      {meter ? <PaymentLoadMeter payment={app.payment} cashFlow={app.cashFlow} /> : null}
    </Section>
  );
}
