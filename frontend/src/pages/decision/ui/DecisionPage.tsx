import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { ApplicationStateNotice, isProcessing, useApplication, type Application } from '@/entities/application';
import { routes } from '@/shared/config';
import { AsyncContent, PageContainer } from '@/shared/ui';
import { ApprovedView } from './ApprovedView';
import { CounterView } from './CounterView';
import { DeclineView } from './DeclineView';
import { RequestedDocsView } from './RequestedDocsView';

export function DecisionPage() {
  const { id = '' } = useParams();
  const application = useApplication(id);
  const [answeredId, setAnsweredId] = useState<string | null>(null);
  return (
    <PageContainer width="narrow" spacing="tight">
      <AsyncContent query={application}>
        {(app) => (
          <DecisionSwitch app={app} answered={answeredId === app.id} onAnswered={() => setAnsweredId(app.id)} />
        )}
      </AsyncContent>
    </PageContainer>
  );
}

function DecisionSwitch({
  app,
  answered,
  onAnswered,
}: {
  app: Application;
  answered: boolean;
  onAnswered: () => void;
}) {
  const rechecking =
    Boolean(app.recheckingDocuments) || (app.decision?.outcome === 'request' && isProcessing(app.status));
  if (answered || rechecking || app.status === 'needs_info') {
    return <RequestedDocsView key={app.id} app={app} answered={answered || rechecking} onAnswered={onAnswered} />;
  }
  if (app.status === 'issued') return <Navigate to={routes.client.issued(app.id)} replace />;
  const decision = app.decision;
  if (decision && !app.closedReason) {
    if (app.status === 'counter_offer') return <CounterView key={app.id} app={app} decision={decision} />;
    if (app.status === 'approved') return <ApprovedView app={app} decision={decision} />;
    if (app.status === 'rejected') return <DeclineView app={app} decision={decision} />;
  }
  return (
    <ApplicationStateNotice
      applicationId={app.id}
      title={app.closedReason ? 'Заявка закрыта' : 'Решения пока нет'}
      description={
        app.closedReason
          ? 'Вы закрыли эту заявку. Новую можно подать в любой момент — данные компании подставим снова.'
          : 'Банк ещё рассматривает заявку. Решение придёт сюда, в кабинет.'
      }
    />
  );
}
