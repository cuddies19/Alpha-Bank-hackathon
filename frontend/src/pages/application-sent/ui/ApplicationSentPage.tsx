import { useParams } from 'react-router';
import { useApplication } from '@/entities/application';
import { routes } from '@/shared/config';
import { formatMoney } from '@/shared/lib';
import {
  Amount,
  AsyncContent,
  ButtonLink,
  Callout,
  Card,
  Cluster,
  Heading,
  IconCircle,
  PageContainer,
  Stack,
  StepList,
  Text,
} from '@/shared/ui';

export function ApplicationSentPage() {
  const { id = '' } = useParams();
  const application = useApplication(id);
  return (
    <PageContainer width="narrow" spacing="roomyTop">
      <AsyncContent query={application}>
        {(app) => (
          <Card padding="lg" gap={6}>
            <IconCircle />
            <Stack gap={2}>
              <h1 className="title-1">Заявка отправлена</h1>
              <Text variant="body-lg" tone="secondary">
                {app.productName} · <Amount>{formatMoney(app.amount)}</Amount> · № {app.id}
              </Text>
            </Stack>
            <Stack gap={3}>
              <Heading>Что будет дальше</Heading>
              <StepList
                size="sm"
                centered
                items={[
                  'Проверим данные и документы',
                  'Запросим сведения в ЕГРЮЛ, ФНС и бюро кредитных историй',
                  'Примем решение',
                ]}
              />
            </Stack>
            <Callout icon="clock">
              <b>Обычно до 2 часов.</b> Сообщим о решении здесь, в кабинете.
            </Callout>
            <Cluster gap={3}>
              <ButtonLink variant="primary" size="lg" to={routes.client.application(app.id)}>
                Следить за заявкой
              </ButtonLink>
              <ButtonLink variant="ghost" size="lg" to={routes.client.home()}>
                На главную
              </ButtonLink>
            </Cluster>
          </Card>
        )}
      </AsyncContent>
    </PageContainer>
  );
}
