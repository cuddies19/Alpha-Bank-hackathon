import { useState } from 'react';
import type { Application, DraftPatch } from '@/entities/application';
import { useProducts } from '@/entities/product';
import { formatMoney, parseMoney } from '@/shared/lib';
import { Chip, Cluster, FieldLabel, Grid, Section, Stack, TextField } from '@/shared/ui';

const SOURCES = ['Выручка с маркетплейсов', 'Оплата по контракту', 'Текущая выручка'];

export interface StepProps {
  app: Application;
  onChange: (patch: DraftPatch, error: string | null) => void;
  onSave: (patch: DraftPatch) => void;
}

export function ParametersStep({ app, onChange }: StepProps) {
  const products = useProducts();
  const product = products.data?.find((p) => p.id === app.productId);
  const [values, setValues] = useState({
    amount: app.amount,
    term: app.term,
    neededBy: app.neededBy,
    goal: app.goal,
    repaymentSource: app.repaymentSource,
  });

  const min = product?.limitMin ?? 0;
  const max = product?.limitMax ?? Infinity;
  const termMax = product?.termMaxMonths ?? Infinity;
  const amountError =
    values.amount < min
      ? `Минимальная сумма — ${formatMoney(min)}`
      : values.amount > max
        ? `Максимальная сумма — ${formatMoney(max)}`
        : null;
  const termError = values.term < 1 || values.term > termMax ? `Срок — от 1 до ${termMax} месяцев` : null;
  const termHint = product?.termMaxMonths ? `До ${product.termMaxMonths} месяцев` : undefined;

  const update = (patch: Partial<typeof values>) => {
    const next = { ...values, ...patch };
    setValues(next);
    const nextAmountError = next.amount < min || next.amount > max;
    const nextTermError = next.term < 1 || next.term > termMax;
    onChange(next, nextAmountError || nextTermError ? 'Проверьте сумму и срок' : null);
  };

  return (
    <Section title="Параметры" gap={5}>
      <Grid min={280} gap={5}>
        <TextField label="Продукт" value={app.productName} readOnly hint="Сменить продукт можно на экране вариантов" />
        <TextField
          label="Сумма"
          format="money"
          value={formatMoney(values.amount, { currency: false })}
          onChange={(e) => update({ amount: parseMoney(e.target.value) })}
          error={amountError}
          hint={
            product?.limitMin ? `Лимит — от ${formatMoney(min, { currency: false })} до ${formatMoney(max)}` : undefined
          }
        />
        <TextField
          label="Срок"
          suffix="мес."
          inputMode="numeric"
          value={String(values.term || '')}
          onChange={(e) => update({ term: Number(e.target.value.replace(/\D/g, '')) || 0 })}
          error={termError}
          hint={termError ? undefined : termHint}
        />
        <TextField
          label="К какой дате нужны деньги"
          value={values.neededBy}
          onChange={(e) => update({ neededBy: e.target.value })}
        />
      </Grid>
      <TextField label="Цель" value={values.goal} onChange={(e) => update({ goal: e.target.value })} />
      <Stack gap={2}>
        <FieldLabel id="source-label">Источник возврата</FieldLabel>
        <Cluster role="group" aria-labelledby="source-label">
          {SOURCES.map((source) => (
            <Chip
              key={source}
              selected={values.repaymentSource === source}
              onClick={() => update({ repaymentSource: source })}
            >
              {source}
            </Chip>
          ))}
        </Cluster>
      </Stack>
    </Section>
  );
}
