import type { ReactNode } from 'react';
import { DescriptionList, Section, Text } from '@/shared/ui';

export interface NeedSummaryRow {
  term: string;
  value?: string;
}

export interface NeedSummaryProps {
  rows: NeedSummaryRow[];
  action: ReactNode;
  hint?: ReactNode;
}

export function NeedSummary({ rows, action, hint }: NeedSummaryProps) {
  return (
    <Section title="Что поняли о задаче">
      <DescriptionList
        variant="rows"
        items={rows.map((row) =>
          row.value
            ? { term: row.term, details: row.value }
            : { term: row.term, details: '—', regular: true, tone: 'secondary' },
        )}
      />
      {action}
      {hint ? (
        <Text variant="body-sm" tone="secondary">
          {hint}
        </Text>
      ) : null}
    </Section>
  );
}
