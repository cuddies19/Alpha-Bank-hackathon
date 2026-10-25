import { Fragment, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  RiskClassBadge,
  SlaBadge,
  recommendationLabel,
  useApplicationQueue,
  type QueueItem,
} from '@/entities/application';
import { useSession } from '@/entities/session';
import { routes } from '@/shared/config';
import { cx, todayLabel, formatMoney } from '@/shared/lib';
import {
  AsyncContent,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardList,
  CellStack,
  Chip,
  Cluster,
  DescriptionList,
  EmptyState,
  IconButton,
  PageContainer,
  PageHeader,
  Pager,
  SearchField,
  Select,
  SortButton,
  Spacer,
  Table,
  TableSkeleton,
  Td,
  Th,
  Tr,
} from '@/shared/ui';
import { QueueCard } from './QueueCard';
import styles from './QueuePage.module.css';

const PAGE_SIZE = 10;

type Stage = 'all' | 'new' | QueueItem['bankStage'];
type SortKey = 'sla' | 'id';

const COUNTERS: Array<{ id: Exclude<Stage, 'all'>; label: string; match: (a: QueueItem) => boolean }> = [
  { id: 'new', label: 'Новые', match: (a) => Boolean(a.isNew) },
  { id: 'pipeline', label: 'В конвейере', match: (a) => a.bankStage === 'pipeline' },
  { id: 'manual', label: 'Ручное рассмотрение', match: (a) => a.bankStage === 'manual' },
  { id: 'client', label: 'Ждут клиента', match: (a) => a.bankStage === 'client' },
  { id: 'decided', label: 'Решение принято сегодня', match: (a) => a.bankStage === 'decided' },
];

const STAGE_LABEL: Record<QueueItem['bankStage'], string> = {
  pipeline: 'В конвейере',
  manual: 'Ручное рассмотрение',
  client: 'Ждёт клиента',
  decided: 'Решение принято',
};

const SLA_ORDER = { late: 0, warn: 1, ok: 2 } as const;

function caseLink(app: QueueItem) {
  if (app.sourceIssue) return routes.bank.application(app.id, 'checks');
  if (app.status === 'needs_info') return routes.bank.application(app.id, 'documents');
  return routes.bank.application(app.id);
}

export function QueuePage() {
  const queue = useApplicationQueue();
  const analyst = useSession().persona?.shortName;
  const [params, setParams] = useSearchParams();
  const [stage, setStage] = useState<Stage>('all');
  const [mine, setMine] = useState(false);
  const [product, setProduct] = useState('all');
  const [risk, setRisk] = useState('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'sla', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const query = params.get('q') ?? '';

  const setQuery = (q: string) => {
    setPage(1);
    setParams(q ? { q } : {}, { replace: true });
  };

  const rows = useMemo(() => {
    const list = queue.data ?? [];
    const q = query.trim().toLowerCase();
    const filtered = list.filter(
      (a) =>
        (stage === 'all' || COUNTERS.find((c) => c.id === stage)!.match(a)) &&
        (!mine || a.assignee === analyst) &&
        (product === 'all' || a.productId === product) &&
        (risk === 'all' || a.riskClass === risk) &&
        (!q || a.number.includes(q) || a.inn.includes(q) || a.companyName.toLowerCase().includes(q)),
    );
    const factor = sort.dir === 'asc' ? 1 : -1;
    return filtered.sort((a, b) => {
      if (sort.key === 'id') return a.number.localeCompare(b.number) * factor;
      const sa = a.bankStage === 'decided' ? 3 : SLA_ORDER[a.sla?.level ?? 'ok'];
      const sb = b.bankStage === 'decided' ? 3 : SLA_ORDER[b.sla?.level ?? 'ok'];
      return (sa - sb) * factor;
    });
  }, [queue.data, stage, mine, analyst, product, risk, query, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  const reset = () => {
    setStage('all');
    setMine(false);
    setProduct('all');
    setRisk('all');
    setQuery('');
  };

  return (
    <PageContainer spacing="tight">
      <PageHeader title="Очередь заявок" description={`${todayLabel()} · обновляется автоматически`} />
      <AsyncContent query={queue} skeleton={<TableSkeleton rows={5} />}>
        {(list) => (
          <>
            <div className={styles.counters}>
              {COUNTERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={cx(styles.counter, stage === c.id && styles.counterOn)}
                  aria-pressed={stage === c.id}
                  onClick={() => {
                    setPage(1);
                    setStage(stage === c.id ? 'all' : c.id);
                  }}
                >
                  <span className="amount-lg tabular">{list.filter(c.match).length}</span>
                  <span className="body-sm">{c.label}</span>
                </button>
              ))}
            </div>
            <Cluster>
              <Select
                label="Продукт"
                inline
                size="sm"
                value={product}
                onChange={setProduct}
                options={[
                  { value: 'all', label: 'все' },
                  { value: 'credit-line', label: 'Кредитная линия' },
                  { value: 'loan', label: 'Кредит на любые цели' },
                  { value: 'overdraft', label: 'Овердрафт' },
                ]}
              />
              <Select
                label="Класс риска"
                inline
                size="sm"
                value={risk}
                onChange={setRisk}
                options={[
                  { value: 'all', label: 'A–E' },
                  ...['A', 'B', 'C', 'D', 'E'].map((c) => ({ value: c, label: c })),
                ]}
              />
              <Chip selected={mine} onClick={() => setMine((v) => !v)}>
                Мои заявки
              </Chip>
              <Spacer />
              <SearchField
                size="sm"
                label="Поиск в очереди"
                placeholder="ИНН или номер заявки"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Cluster>
            {visible.length ? (
              <>
                <CardList>
                  {visible.map((app) => (
                    <QueueCard key={app.id} application={app} stage={STAGE_LABEL[app.bankStage]} to={caseLink(app)} />
                  ))}
                  {pages > 1 ? (
                    <Pager summary={`${rows.length} заявок`} page={current} pages={pages} onChange={setPage} />
                  ) : null}
                </CardList>
                <Table
                  desktopOnly
                  dense
                  caption="Очередь заявок"
                  footer={
                    <Pager
                      summary={`Показаны ${(current - 1) * PAGE_SIZE + 1}–${(current - 1) * PAGE_SIZE + visible.length} из ${rows.length}`}
                      page={current}
                      pages={pages}
                      onChange={setPage}
                    />
                  }
                >
                  <thead>
                    <tr>
                      <Th>
                        <SortButton active={sort.key === 'id'} direction={sort.dir} onClick={() => toggleSort('id')}>
                          Заявка
                        </SortButton>
                      </Th>
                      <Th>Компания</Th>
                      <Th>Продукт</Th>
                      <Th>
                        <SortButton active={sort.key === 'sla'} direction={sort.dir} onClick={() => toggleSort('sla')}>
                          SLA
                        </SortButton>
                      </Th>
                      <Th srOnly>Подробнее</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((app) => {
                      const open = openId === app.id;
                      const toggle = () => setOpenId(open ? null : app.id);
                      return (
                        <Fragment key={app.id}>
                          <Tr
                            tone={app.isNew ? 'new' : app.bankStage === 'decided' ? 'muted' : 'default'}
                            selected={open}
                            onClick={toggle}
                          >
                            <Td nowrap strong>
                              {app.number}
                            </Td>
                            <Td>
                              <CellStack main={app.companyName} sub={`ИНН ${app.inn}`} />
                            </Td>
                            <Td>{app.productName}</Td>
                            <Td nowrap>{app.sla ? <SlaBadge text={app.sla.text} level={app.sla.level} /> : null}</Td>
                            <Td shrink>
                              <IconButton
                                icon="chevron-down"
                                size="sm"
                                tone="secondary"
                                label={`${open ? 'Свернуть' : 'Подробнее о'} заявке ${app.number}`}
                                aria-expanded={open}
                                aria-controls={`queue-details-${app.id}`}
                                className={cx(styles.toggle, open && styles.toggleOpen)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggle();
                                }}
                              />
                            </Td>
                          </Tr>
                          {open ? (
                            <tr id={`queue-details-${app.id}`}>
                              <Td colSpan={5} className={styles.detailsCell}>
                                <div className={styles.details}>
                                  <DescriptionList
                                    items={[
                                      { term: 'Сумма', details: formatMoney(app.amount), valueClassName: 'tabular' },
                                      {
                                        term: 'Класс риска',
                                        details: (
                                          <RiskClassBadge riskClass={app.sourceIssue ? undefined : app.riskClass} />
                                        ),
                                      },
                                      { term: 'Рекомендация системы', details: recommendationLabel(app) },
                                      { term: 'Этап', details: STAGE_LABEL[app.bankStage] },
                                    ]}
                                  />
                                  <Cluster justify="between">
                                    <Cluster>
                                      {app.tags?.map((tag) => (
                                        <Badge key={tag.label} tone={tag.tone} icon={tag.icon}>
                                          {tag.label}
                                        </Badge>
                                      ))}
                                    </Cluster>
                                    <ButtonLink
                                      variant="primary"
                                      size="sm"
                                      to={caseLink(app)}
                                      iconRight="chevron-right"
                                    >
                                      Открыть заявку
                                    </ButtonLink>
                                  </Cluster>
                                </div>
                              </Td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </Table>
              </>
            ) : (
              <Card>
                <EmptyState
                  icon="check-circle"
                  title="Очередь разобрана"
                  description="На этом этапе заявок нет. Новые появятся здесь автоматически."
                  action={<Button onClick={reset}>Показать все заявки</Button>}
                />
              </Card>
            )}
          </>
        )}
      </AsyncContent>
    </PageContainer>
  );
}
