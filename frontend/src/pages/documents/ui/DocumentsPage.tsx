import { useState } from 'react';
import { useCompanyApplications, useUploadDocument } from '@/entities/application';
import { useClientDocuments, useUploadClientDocument, type ClientDocument } from '@/entities/document';
import { useCompanyId } from '@/entities/session';
import { plural } from '@/shared/lib';
import {
  AsyncContent,
  Badge,
  Button,
  CellStack,
  Cluster,
  DocumentUpload,
  EmptyState,
  FileIcon,
  PageContainer,
  PageHeader,
  Section,
  Select,
  Spacer,
  Stack,
  Table,
  TableSkeleton,
  Td,
  Text,
  Th,
  useToast,
} from '@/shared/ui';

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;

export function DocumentsPage() {
  const companyId = useCompanyId();
  const documents = useClientDocuments(companyId);
  const applications = useCompanyApplications(companyId);
  const uploadExtra = useUploadClientDocument(companyId);
  const replace = useUploadDocument();
  const toast = useToast();
  const [filter, setFilter] = useState('all');

  const appOptions = [
    { value: 'all', label: 'Все заявки' },
    ...(applications.data ?? []).map((a) => ({
      value: a.id,
      label: `№ ${a.number} · ${a.status === 'draft' ? 'черновик' : a.productName.toLowerCase()}`,
    })),
  ];
  const targetApp = filter === 'all' ? applications.data?.[0]?.id : filter;
  const numberOf = (id: string) => applications.data?.find((a) => a.id === id)?.number ?? id;
  const targetNumber = targetApp ? numberOf(targetApp) : '';

  const onFiles = (files: FileList) => {
    if (!targetApp) return;
    for (const file of Array.from(files)) {
      uploadExtra.mutate(
        { applicationId: targetApp, name: file.name, size: formatSize(file.size), file },
        {
          onSuccess: () =>
            toast.show({ title: 'Документ загружен', description: `${file.name} · заявка № ${targetNumber}` }),
        },
      );
    }
  };

  const onReplace = (doc: ClientDocument) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !doc.documentId) return;
      replace.mutate({
        applicationId: doc.applicationId,
        documentId: doc.documentId,
        name: file.name,
        size: formatSize(file.size),
        file,
      });
    };
    input.click();
  };

  return (
    <PageContainer spacing="tight">
      <PageHeader title="Документы" />
      <Section title="Загрузить документ" gap={3}>
        <Text variant="body-sm" tone="secondary">
          Проверим файл сразу после загрузки и привяжем к{' '}
          {filter === 'all' ? 'последней заявке' : `заявке № ${numberOf(filter)}`}.
        </Text>
        <DocumentUpload label="Перетащите файл или выберите на компьютере" onFiles={onFiles} />
      </Section>
      <AsyncContent query={documents} skeleton={<TableSkeleton />}>
        {(list) => {
          const rows = filter === 'all' ? list : list.filter((d) => d.applicationId === filter);
          return (
            <Stack gap={4}>
              <Cluster>
                <Select label="Заявка" inline size="sm" value={filter} onChange={setFilter} options={appOptions} />
                <Spacer />
                <Text as="span" variant="body-sm" tone="secondary">
                  {rows.length} {plural(rows.length, ['документ', 'документа', 'документов'])}
                </Text>
              </Cluster>
              {rows.length ? (
                <Table caption="Документы">
                  <thead>
                    <tr>
                      <Th>Документ</Th>
                      <Th>Заявка</Th>
                      <Th>Дата</Th>
                      <Th>Статус</Th>
                      <Th srOnly>Действия</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((doc) => (
                      <tr key={doc.id}>
                        <Td>
                          <Cluster gap={3} nowrap>
                            <FileIcon />
                            <span>
                              <CellStack main={doc.name} sub={doc.meta} />
                            </span>
                          </Cluster>
                        </Td>
                        <Td nowrap>№ {numberOf(doc.applicationId)}</Td>
                        <Td nowrap>{doc.date}</Td>
                        <Td>
                          <Badge tone={doc.tone}>{doc.status}</Badge>
                        </Td>
                        <Td nowrap align="right">
                          <Cluster gap={1} nowrap justify="end">
                            <Button variant="ghost" size="sm">
                              Открыть
                            </Button>
                            <Button variant="ghost" size="sm" iconLeft="arrow-down">
                              Скачать
                            </Button>
                            {doc.replaceable ? (
                              <Button size="sm" iconLeft="upload" onClick={() => onReplace(doc)}>
                                Заменить
                              </Button>
                            ) : null}
                          </Cluster>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Section>
                  <EmptyState
                    title="Документов пока нет"
                    description="Здесь появятся документы, которые вы загрузите к заявке, и подписанные договоры."
                  />
                </Section>
              )}
            </Stack>
          );
        }}
      </AsyncContent>
    </PageContainer>
  );
}
