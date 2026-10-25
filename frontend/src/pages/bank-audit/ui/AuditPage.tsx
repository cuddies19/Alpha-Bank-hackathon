import { useMemo, useState } from 'react';
import { useAuditLog, type AuditActor, type AuditEvent } from '@/entities/audit';
import { plural } from '@/shared/lib';
import {
  AsyncContent,
  Button,
  CardList,
  CellStack,
  Chip,
  Cluster,
  ExpandableCard,
  PageContainer,
  PageHeader,
  Pager,
  Select,
  Spacer,
  Table,
  TableSkeleton,
  Td,
  Text,
  Th,
  Tr,
} from '@/shared/ui';
import { AuditDrawer, AuditFields } from './AuditDetails';
import styles from './AuditPage.module.css';

const ACTORS: Array<{ id: 'all' | AuditActor; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'system', label: 'Система' },
  { id: 'staff', label: 'Сотрудник' },
  { id: 'client', label: 'Клиент' },
];
const PAGE_SIZE = 15;

function downloadCsv(rows: AuditEvent[]) {
  const header = ['Время', 'Кто', 'Роль', 'Заявка', 'Действие', 'Подробности'];
  const lines = rows.map((r) => [r.time, r.who, r.role, r.applicationId, r.action, r.change]);
  const csv = [header, ...lines].map((cells) => cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'audit-2026-10-24.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function AuditPage() {
  const audit = useAuditLog();
  const [actor, setActor] = useState<'all' | AuditActor>('all');
  const [applicationId, setApplicationId] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const applications = useMemo(
    () => [...new Set((audit.data ?? []).map((e) => e.applicationId).filter((id) => id !== '—'))].sort(),
    [audit.data],
  );
  const rows = (audit.data ?? []).filter(
    (e) => (actor === 'all' || e.actor === actor) && (applicationId === 'all' || e.applicationId === applicationId),
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = rows.find((e) => e.id === selectedId);
  const summary = `${rows.length} ${plural(rows.length, ['событие', 'события', 'событий'])} в журнале`;

  return (
    <PageContainer spacing="tight">
      <PageHeader
        title="Журнал аудита"
        description="Каждое действие системы, сотрудника и клиента. Персональные данные скрыты."
      />
      <Cluster>
        <Select
          label="Заявка"
          inline
          size="sm"
          value={applicationId}
          onChange={(id) => {
            setPage(1);
            setApplicationId(id);
          }}
          options={[{ value: 'all', label: 'все' }, ...applications.map((id) => ({ value: id, label: id }))]}
        />
        <Text as="span" variant="label" tone="secondary" id="actor-label">
          Участник
        </Text>
        <Cluster role="group" aria-labelledby="actor-label">
          {ACTORS.map((a) => (
            <Chip
              key={a.id}
              selected={actor === a.id}
              onClick={() => {
                setPage(1);
                setActor(a.id);
              }}
            >
              {a.label}
            </Chip>
          ))}
        </Cluster>
        <Spacer />
        <Button size="sm" iconLeft="arrow-down" disabled={!rows.length} onClick={() => downloadCsv(rows)}>
          Выгрузить CSV
        </Button>
      </Cluster>
      <AsyncContent query={audit} skeleton={<TableSkeleton rows={6} />}>
        {() => {
          const toggle = (id: string) => setSelectedId((current) => (current === id ? null : id));
          const table = (
            <Table
              desktopOnly
              dense
              caption="Журнал аудита"
              footer={<Pager summary={summary} page={current} pages={pages} onChange={setPage} />}
            >
              <thead>
                <tr>
                  <Th>Время</Th>
                  <Th>Кто</Th>
                  <Th>Заявка</Th>
                  <Th>Действие</Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => (
                  <Tr key={e.id} selected={e.id === selectedId} onClick={() => toggle(e.id)}>
                    <Td nowrap className="tabular">
                      {e.time}
                    </Td>
                    <Td nowrap>
                      <CellStack main={e.who} sub={e.role} strong={false} />
                    </Td>
                    <Td nowrap>{e.applicationId}</Td>
                    <Td>
                      <button
                        type="button"
                        className={styles.rowButton}
                        aria-pressed={e.id === selectedId}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggle(e.id);
                        }}
                      >
                        {e.action}
                      </button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          );
          return (
            <>
              <CardList>
                {visible.map((e) => (
                  <ExpandableCard
                    key={e.id}
                    title={e.action}
                    aside={
                      <Text as="span" variant="body-sm" tone="secondary" numeric>
                        {e.time}
                      </Text>
                    }
                    meta={`${e.who} · ${e.role}${e.applicationId !== '—' ? ` · № ${e.applicationId}` : ''}`}
                  >
                    <AuditFields event={e} />
                  </ExpandableCard>
                ))}
                {pages > 1 ? <Pager summary={summary} page={current} pages={pages} onChange={setPage} /> : null}
              </CardList>
              {table}
              <AuditDrawer event={selected} onClose={() => setSelectedId(null)} />
            </>
          );
        }}
      </AsyncContent>
    </PageContainer>
  );
}
