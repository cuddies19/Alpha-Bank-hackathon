import { useState } from 'react';
import {
  buildClientStages,
  useRespondToRequest,
  useUploadRequestedDocument,
  type Application,
  type RequestedDocument,
} from '@/entities/application';
import { routes } from '@/shared/config';
import { formatMoney, formatMonths, daysFromNowLabel } from '@/shared/lib';
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Cluster,
  DOC_STATUS,
  DocumentUpload,
  ErrorState,
  Icon,
  Note,
  PageHeader,
  Section,
  StatusTracker,
  Text,
  Textarea,
  type UploadedDoc,
} from '@/shared/ui';
import styles from './DecisionPage.module.css';

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;

function docBadge(doc: RequestedDocument) {
  if (doc.status === 'missing') return <Badge icon={false}>Не загружен</Badge>;
  const view = DOC_STATUS[doc.status];
  return (
    <Badge tone={view.tone} icon={doc.status === 'uploading' ? false : undefined}>
      {view.word}
    </Badge>
  );
}

export interface RequestedDocsViewProps {
  app: Application;
  answered: boolean;
  onAnswered: () => void;
}

export function RequestedDocsView({ app, answered, onAnswered }: RequestedDocsViewProps) {
  const upload = useUploadRequestedDocument();
  const respond = useRespondToRequest(app.id, { onSuccess: onAnswered });
  const [comment, setComment] = useState('');
  const docs = app.decision?.requestedDocs ?? [];
  const ready = docs.length > 0 && docs.every((d) => d.status === 'ok');

  const files: UploadedDoc[] = docs
    .filter((d) => d.fileName && d.status !== 'missing')
    .map((d) => ({
      id: d.id,
      name: d.fileName!,
      size: d.size,
      status: d.status as UploadedDoc['status'],
      progress: d.progress,
    }));

  const onFiles = async (list: File[]) => {
    for (const file of Array.from(list)) {
      await upload
        .mutateAsync({ applicationId: app.id, name: file.name, size: formatSize(file.size), file })
        .catch(() => undefined);
    }
  };

  return (
    <>
      <PageHeader
        titleVariant="display"
        title={answered ? 'Документы отправлены' : 'Банку нужны ещё документы'}
        descriptionSize="body-lg"
        description={answered ? undefined : app.decision?.message}
        eyebrow={
          <Cluster gap={3}>
            <Text as="span" variant="body-sm" tone="secondary">
              Заявка № {app.number} · {app.productName.toLowerCase()} {formatMoney(app.amount)} на{' '}
              {formatMonths(app.term)}
            </Text>
          </Cluster>
        }
      />
      {answered ? (
        <>
          <Alert tone="success" title="Документы отправлены">
            Заявка вернулась на рассмотрение — обычно до 2 часов. Сообщим о решении здесь, в кабинете.
          </Alert>
          <Section title="Где заявка">
            <StatusTracker stages={buildClientStages(app)} />
            <Cluster>
              <ButtonLink to={routes.client.application(app.id)}>Открыть заявку</ButtonLink>
            </Cluster>
          </Section>
        </>
      ) : (
        <>
          <Section title="Что загрузить">
            <ul>
              {docs.map((doc) => (
                <li key={doc.id} className={styles.docRow}>
                  <span className={styles.docIcon}>
                    <Icon name="document" />
                  </span>
                  <span className={styles.docText}>
                    <span className="body-strong">{doc.title}</span>
                    <Text as="span" variant="body-sm" tone="secondary">
                      {doc.note}
                    </Text>
                  </span>
                  {docBadge(doc)}
                </li>
              ))}
            </ul>
            <DocumentUpload files={files} onFiles={(list) => void onFiles(list)} />
            {upload.isError ? <ErrorState error={upload.error} title="Файл не загрузился" /> : null}
          </Section>
          <Section>
            <Textarea
              label="Комментарий для специалиста"
              placeholder="Например: второй счёт открыт в марте, выписка за весь период"
              hint="Необязательно"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Cluster gap={4}>
              <Button
                variant="primary"
                size="lg"
                disabled={!ready}
                loading={respond.isPending}
                onClick={() => respond.mutate(comment)}
              >
                Отправить на повторное рассмотрение
              </Button>
              <Note icon="calendar" tone="warning" center>
                Ответьте до {app.decision?.deadline ?? daysFromNowLabel(7)}, иначе заявка закроется
              </Note>
            </Cluster>
            {respond.isError ? <ErrorState error={respond.error} title="Не удалось отправить документы" /> : null}
          </Section>
        </>
      )}
    </>
  );
}
