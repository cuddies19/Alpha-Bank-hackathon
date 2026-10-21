import { useState } from 'react';
import { buildSchedule, formatMoney } from '@/shared/lib';
import { Badge, Button, Table, Td, Th } from '@/shared/ui';

export interface PaymentScheduleProps {
  principal: number;
  ratePct: number;
  months: number;
  firstDate: Date;
  preview?: number;
  roundTo?: number;
  withStatus?: boolean;
}

export function PaymentSchedule({
  principal,
  ratePct,
  months,
  firstDate,
  preview = 3,
  roundTo,
  withStatus,
}: PaymentScheduleProps) {
  const [full, setFull] = useState(false);
  const rows = buildSchedule({ principal, ratePct, months, firstDate, roundTo });
  const visible = full ? rows : rows.slice(0, preview);
  return (
    <>
      <Table dense flat caption="График платежей">
        <thead>
          <tr>
            <Th>№</Th>
            <Th>Дата</Th>
            <Th align="right">Платёж</Th>
            <Th align="right">Основной долг</Th>
            <Th align="right">Проценты</Th>
            <Th align="right">Остаток</Th>
            {withStatus ? <Th>Статус</Th> : null}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.index}>
              <Td>{row.index}</Td>
              <Td nowrap>{row.date}</Td>
              <Td align="right">{formatMoney(row.payment)}</Td>
              <Td align="right">{formatMoney(row.principal)}</Td>
              <Td align="right">{formatMoney(row.interest)}</Td>
              <Td align="right">{formatMoney(row.rest)}</Td>
              {withStatus ? (
                <Td>
                  {row.index === 1 ? (
                    <Badge tone="info" icon="calendar">
                      Ближайший
                    </Badge>
                  ) : (
                    <Badge icon={false}>По графику</Badge>
                  )}
                </Td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length > preview ? (
        <div>
          <Button variant="ghost" iconRight="chevron-right" onClick={() => setFull((v) => !v)}>
            {full ? 'Свернуть график' : `Показать весь график, ${rows.length} платежей`}
          </Button>
        </div>
      ) : null}
    </>
  );
}
