import { RiskClassBadge, SlaBadge, recommendationLabel, type QueueItem } from '@/entities/application';
import { formatMoney } from '@/shared/lib';
import { Badge, ButtonLink, Cluster, DescriptionList, ExpandableCard, Text } from '@/shared/ui';

export interface QueueCardProps {
  application: QueueItem;
  stage: string;
  to: string;
}

export function QueueCard({ application: app, stage, to }: QueueCardProps) {
  return (
    <ExpandableCard
      tone={app.isNew ? 'highlighted' : app.bankStage === 'decided' ? 'muted' : 'default'}
      title={app.companyName}
      aside={
        <Text as="span" variant="body-strong" numeric>
          {formatMoney(app.amount)}
        </Text>
      }
      meta={`№ ${app.id} · ${app.productName}`}
      footer={
        <Cluster gap={3}>
          {app.sla ? <SlaBadge text={app.sla.text} level={app.sla.level} /> : null}
          <Text as="span" variant="body-sm" tone="secondary">
            {stage}
          </Text>
        </Cluster>
      }
    >
      <DescriptionList
        variant="rows"
        items={[
          { term: 'ИНН', details: app.inn },
          { term: 'Класс риска', details: <RiskClassBadge riskClass={app.sourceIssue ? undefined : app.riskClass} /> },
          { term: 'Рекомендация', details: recommendationLabel(app) },
        ]}
      />
      {app.tags?.length ? (
        <Cluster>
          {app.tags.map((tag) => (
            <Badge key={tag.label} tone={tag.tone} icon={tag.icon}>
              {tag.label}
            </Badge>
          ))}
        </Cluster>
      ) : null}
      <ButtonLink to={to} fullWidth>
        Открыть заявку
      </ButtonLink>
    </ExpandableCard>
  );
}
