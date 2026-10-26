import { formatMoney, plural } from '@/shared/lib';
import { BarChart, DescriptionList, Legend, Note, Section, Table, Td, Th } from '@/shared/ui';
import { useCaseData } from './useCaseData';

const SERIES = [
  { label: 'Поступления', color: 'var(--ink)' },
  { label: 'Списания', color: 'var(--line-strong)' },
];

export function ClientTab() {
  const { client } = useCaseData();
  const max = Math.ceil(Math.max(...client.turnover.map((m) => m.income), 0.1) * 1.1);
  const months = client.turnover.length;
  return (
    <>
      <Section title="Компания">
        <DescriptionList items={client.rows} />
      </Section>
      <Section title="Руководитель">
        <DescriptionList items={client.director} />
        <Note icon="shield">Персональные данные скрыты. Полный просмотр записывается в журнал аудита.</Note>
      </Section>
      <Section
        title={`Обороты по счёту за ${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`}
        aside={<Legend items={SERIES} />}
      >
        <BarChart
          variant="compact"
          series={SERIES}
          max={max}
          groups={client.turnover.map((m) => ({ label: m.label, values: [m.income, m.outcome] }))}
          ariaLabel={`Поступления и списания по месяцам за последние ${months} мес.`}
        />
        <DescriptionList items={client.turnoverStats} />
      </Section>
      <Section title="Действующие обязательства" gap={3}>
        {client.obligations.length ? (
          <Table plain flat caption="Действующие обязательства">
            <thead>
              <tr>
                <Th>Кредитор</Th>
                <Th>Вид</Th>
                <Th align="right">Остаток</Th>
                <Th align="right">Платёж в месяц</Th>
                <Th>До</Th>
                <Th>Источник</Th>
              </tr>
            </thead>
            <tbody>
              {client.obligations.map((o) => (
                <tr key={o.creditor + o.kind}>
                  <Td>{o.creditor}</Td>
                  <Td>{o.kind}</Td>
                  <Td align="right">{formatMoney(o.rest)}</Td>
                  <Td align="right">{formatMoney(o.payment)}</Td>
                  <Td nowrap>{o.until}</Td>
                  <Td>{o.source}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Note>Действующих кредитов нет — по данным БКИ и выписки.</Note>
        )}
      </Section>
    </>
  );
}
