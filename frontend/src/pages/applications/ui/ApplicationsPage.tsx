import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ApplicationCard,
  ApplicationStatusBadge,
  clientTodo,
  isActive,
  isFinished,
  useCompanyApplications,
  type Application,
} from '@/entities/application';
import { useCompanyId } from '@/entities/session';
import { APPLICATION_FORM_STEPS, routes } from '@/shared/config';
import { formatMoney } from '@/shared/lib';
import {
  AsyncContent,
  ButtonLink,
  Card,
  CardList,
  EmptyState,
  IconButtonLink,
  PageContainer,
  PageHeader,
  RowLink,
  TabBar,
  TabButton,
  Table,
  TableSkeleton,
  Td,
  Th,
  Tr,
} from '@/shared/ui';

type Filter = 'active' | 'drafts' | 'done';

const FILTERS: Array<{ id: Filter; label: string; match: (a: Application) => boolean; empty: [string, string] }> = [
  {
    id: 'active',
    label: 'Активные',
    match: isActive,
    empty: ['Активных заявок нет', 'Опишите задачу — подберём продукт и посчитаем платёж до подачи заявки.'],
  },
  {
    id: 'drafts',
    label: 'Черновики',
    match: (a) => a.status === 'draft',
    empty: ['Черновиков нет', 'Черновик появится, когда вы начнёте заявку из подбора.'],
  },
  {
    id: 'done',
    label: 'Завершённые',
    match: isFinished,
    empty: ['Завершённых заявок пока нет', 'Здесь появятся заявки, по которым выданы деньги или работа закончена.'],
  },
];

function linkFor(app: Application) {
  if (app.status === 'draft') {
    return routes.client.applicationForm(app.id, APPLICATION_FORM_STEPS[Math.min(3, (app.draftStep ?? 1) - 1)]);
  }
  if (app.status === 'issued') return routes.client.issued(app.id);
  return routes.client.application(app.id);
}

export function ApplicationsPage() {
  const companyId = useCompanyId();
  const applications = useCompanyApplications(companyId);
  const [filter, setFilter] = useState<Filter>('active');
  const navigate = useNavigate();

  return (
    <PageContainer spacing="tight">
      <PageHeader
        title="Мои заявки"
        actions={
          <ButtonLink variant="primary" to={routes.client.financing()}>
            Подобрать финансирование
          </ButtonLink>
        }
      />
      <AsyncContent query={applications} skeleton={<TableSkeleton />}>
        {(list) => {
          const current = FILTERS.find((f) => f.id === filter)!;
          const rows = list.filter(current.match);
          return (
            <>
              <TabBar label="Фильтр заявок">
                {FILTERS.map((f) => (
                  <TabButton
                    key={f.id}
                    active={f.id === filter}
                    count={list.filter(f.match).length}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </TabButton>
                ))}
              </TabBar>
              {rows.length ? (
                <>
                  <CardList>
                    {rows.map((app) => (
                      <ApplicationCard key={app.id} application={app} to={linkFor(app)} />
                    ))}
                  </CardList>
                  <Table caption={current.label} desktopOnly>
                    <thead>
                      <tr>
                        <Th>Номер</Th>
                        <Th>Продукт</Th>
                        <Th align="right">Сумма</Th>
                        <Th>Подана</Th>
                        <Th>Статус</Th>
                        <Th>Что от вас нужно</Th>
                        <Th srOnly>Открыть</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((app) => (
                        <Tr key={app.id} onClick={() => navigate(linkFor(app))}>
                          <Td nowrap>
                            <RowLink to={linkFor(app)}>№ {app.id}</RowLink>
                          </Td>
                          <Td>{app.productName}</Td>
                          <Td align="right">{formatMoney(app.amount)}</Td>
                          <Td nowrap>{app.submittedAt?.split(',')[0] ?? '—'}</Td>
                          <Td>
                            <ApplicationStatusBadge application={app} />
                          </Td>
                          <Td tone="secondary">{clientTodo(app)}</Td>
                          <Td shrink>
                            <IconButtonLink
                              to={linkFor(app)}
                              icon="chevron-right"
                              label={`Открыть заявку № ${app.id}`}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              ) : (
                <Card>
                  <EmptyState
                    title={current.empty[0]}
                    description={current.empty[1]}
                    action={
                      filter === 'active' ? (
                        <ButtonLink variant="primary" to={routes.client.financing()}>
                          Подобрать финансирование
                        </ButtonLink>
                      ) : undefined
                    }
                  />
                </Card>
              )}
            </>
          );
        }}
      </AsyncContent>
    </PageContainer>
  );
}
