import { routes } from '@/shared/config';
import { ButtonLink, Card, EmptyState } from '@/shared/ui';

export interface ApplicationStateNoticeProps {
  applicationId: string;
  title: string;
  description: string;
}

export function ApplicationStateNotice({ applicationId, title, description }: ApplicationStateNoticeProps) {
  return (
    <Card>
      <EmptyState
        icon="info"
        title={title}
        description={description}
        action={<ButtonLink to={routes.client.application(applicationId)}>Открыть заявку</ButtonLink>}
      />
    </Card>
  );
}
