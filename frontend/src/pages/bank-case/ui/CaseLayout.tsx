import { Outlet, useParams } from 'react-router';
import { useApplicationCase } from '@/entities/application';
import { useSession } from '@/entities/session';
import type { CaseTab } from '@/shared/config';
import { AsyncContent, Columns, PageContainer, PageSkeleton } from '@/shared/ui';
import { CaseHeader } from '@/widgets/case-header';
import { DecisionPanel } from '@/widgets/decision-panel';

export function CaseLayout() {
  const { id = '' } = useParams();
  const caseQuery = useApplicationCase(id);
  const analyst = useSession().persona?.shortName ?? '';
  return (
    <AsyncContent
      query={caseQuery}
      skeleton={
        <PageContainer>
          <PageSkeleton tiles={3} />
        </PageContainer>
      }
    >
      {(data) => {
        const attention: CaseTab[] = data.checks.some((c) => c.status === 'fail') ? ['checks'] : [];
        return (
          <PageContainer spacing="tight">
            <CaseHeader application={data.application} analyst={analyst} attention={attention} />
            <Columns
              fixedSide
              sideLabel="Решение по заявке"
              main={<Outlet context={data} />}
              side={<DecisionPanel caseData={data} />}
            />
          </PageContainer>
        );
      }}
    </AsyncContent>
  );
}
