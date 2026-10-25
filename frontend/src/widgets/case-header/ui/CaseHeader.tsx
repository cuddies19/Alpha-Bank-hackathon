import { BankStatusBadge, SlaBadge, useTakeInWork, type Application } from '@/entities/application';
import { CASE_TABS, USE_API, routes, type CaseTab } from '@/shared/config';
import { formatMoney, formatMonths } from '@/shared/lib';
import { Amount, BackLink, Button, Cluster, Stack, TabBar, TabLink } from '@/shared/ui';
import styles from './CaseHeader.module.css';

const TAB_LABEL: Record<CaseTab, string> = {
  summary: 'Сводка',
  client: 'Клиент',
  checks: 'Внешние проверки',
  risk: 'Оценка риска',
  documents: 'Документы',
  history: 'История',
};

export interface CaseHeaderProps {
  application: Application;
  analyst: string;
  attention?: CaseTab[];
}

export function CaseHeader({ application: app, analyst, attention = [] }: CaseHeaderProps) {
  const takeInWork = useTakeInWork();
  const mine = app.assignee === analyst;
  const reviewing = app.status === 'manual_review' || (USE_API && app.status === 'submitted');
  return (
    <div className={styles.head}>
      <BackLink to={routes.bank.queue()}>Очередь заявок</BackLink>
      <div className={styles.row}>
        <Stack gap={1}>
          <Cluster gap={3}>
            <h1 className="title-2">{app.companyName}</h1>
            <BankStatusBadge application={app} />
          </Cluster>
          <p className={`body ${styles.meta}`}>
            ИНН {app.inn} · заявка № {app.number} · {app.productName.toLowerCase()}{' '}
            <Amount className={styles.amount}>{formatMoney(app.amount)}</Amount> на {formatMonths(app.term)} · подана{' '}
            {app.submittedAt}
          </p>
        </Stack>
        {reviewing ? (
          <Cluster gap={3}>
            {app.sla ? <SlaBadge text={app.sla.text} level={app.sla.level} prefix="осталось" /> : null}
            {mine ? (
              <Button disabled>В работе у вас</Button>
            ) : (
              <Button loading={takeInWork.isPending} onClick={() => takeInWork.mutate(app.id)}>
                Взять в работу
              </Button>
            )}
          </Cluster>
        ) : null}
      </div>
      <TabBar as="nav" label="Разделы заявки" flush>
        {CASE_TABS.map((tab) => (
          <TabLink key={tab} to={routes.bank.application(app.id, tab)} end attention={attention.includes(tab)}>
            {TAB_LABEL[tab]}
          </TabLink>
        ))}
      </TabBar>
    </div>
  );
}
