import { useParams } from 'react-router';
import { ApplicationStateNotice, useApplication } from '@/entities/application';
import { useCompanyProfile } from '@/entities/company';
import { useCompanyId } from '@/entities/session';
import { routes } from '@/shared/config';
import { formatMoney } from '@/shared/lib';
import {
  Amount,
  AsyncContent,
  ButtonLink,
  Card,
  Cluster,
  DescriptionList,
  IconCircle,
  Note,
  PageContainer,
  Stack,
  Text,
} from '@/shared/ui';

export function IssuedPage() {
  const { id = '' } = useParams();
  const application = useApplication(id);
  const profile = useCompanyProfile(useCompanyId());
  return (
    <PageContainer width="narrow" spacing="roomyTop">
      <AsyncContent query={application}>
        {(app) =>
          app.status !== 'issued' || !app.decision ? (
            <ApplicationStateNotice
              applicationId={app.id}
              title="Деньги ещё не выданы"
              description="Сначала банк примет решение, а вы подпишете документы. Статус — на странице заявки."
            />
          ) : (
            <Card padding="lg" gap={6}>
              <IconCircle />
              <Stack gap={2}>
                <Text variant="body-lg" tone="secondary">
                  Деньги зачислены
                </Text>
                <h1 className="display">
                  <Amount>{formatMoney(app.decision.amount)}</Amount> на счёте
                </h1>
              </Stack>
              <DescriptionList
                divided
                items={[
                  {
                    term: 'Счёт зачисления',
                    details: `•• ${profile.data?.company.accountMask ?? '····'}`,
                    valueClassName: 'amount-md',
                  },
                  { term: 'Первый платёж', details: app.decision.firstPayment ?? '—', valueClassName: 'amount-md' },
                  {
                    term: 'Сумма платежа',
                    details: formatMoney(app.decision.payment),
                    valueClassName: 'amount-md tabular',
                  },
                  { term: 'Договор', details: `№ ${app.id}-Д`, valueClassName: 'amount-md' },
                ]}
              />
              <Cluster gap={3}>
                <ButtonLink variant="primary" size="lg" to={routes.client.loans()}>
                  Открыть график платежей
                </ButtonLink>
                <ButtonLink size="lg" to={routes.client.home()}>
                  На главную
                </ButtonLink>
              </Cluster>
              <Note>Выдача смоделирована, реального перевода нет.</Note>
            </Card>
          )
        }
      </AsyncContent>
    </PageContainer>
  );
}
