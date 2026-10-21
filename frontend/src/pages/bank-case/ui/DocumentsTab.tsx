import { useState } from 'react';
import { Alert, Badge, Button, CellStack, Section, Skeleton, Table, Td, Text, Th, Tr } from '@/shared/ui';
import { useCaseData } from './useCaseData';
import styles from './tabs.module.css';

export function DocumentsTab() {
  const { documents, documentsComplete } = useCaseData();
  const [selected, setSelected] = useState(documents[0]?.id);
  const current = documents.find((d) => d.id === selected) ?? documents[0];
  return (
    <>
      {documentsComplete ? (
        <Alert tone="success" title="Комплект полный">
          Обязательные документы загружены и прошли автоматическую проверку.
        </Alert>
      ) : (
        <Alert tone="warning" title="Комплект неполный">
          Не хватает обязательных документов — можно запросить их у клиента в панели решения.
        </Alert>
      )}
      <Table caption="Документы заявки">
        <thead>
          <tr>
            <Th>Документ</Th>
            <Th>Статус</Th>
            <Th>Загрузил</Th>
            <Th srOnly>Предпросмотр</Th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <Tr key={doc.id} tone={doc.id === current?.id ? 'new' : 'default'}>
              <Td>
                <CellStack main={doc.name} sub={doc.meta} />
              </Td>
              <Td>
                <Badge tone={doc.tone}>{doc.status}</Badge>
              </Td>
              <Td nowrap>
                <CellStack main={doc.who} sub={doc.when} strong={false} />
              </Td>
              <Td align="right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(doc.id)}
                  aria-pressed={doc.id === current?.id}
                >
                  Открыть
                </Button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      {current ? (
        <Section
          title={current.name}
          gap={3}
          aside={
            <Text as="span" variant="body-sm" tone="secondary">
              {current.meta}
            </Text>
          }
        >
          <div className={styles.preview} role="img" aria-label={`Предпросмотр: ${current.name}`}>
            <Skeleton width="45%" height={12} still />
            <Skeleton width="30%" height={10} still />
            <span className={styles.gap} />
            <Skeleton height={8} still />
            <Skeleton width="92%" height={8} still />
            <Skeleton width="96%" height={8} still />
            <Skeleton width="60%" height={8} still />
            <Text as="span" variant="body-sm" tone="secondary" className={styles.previewCaption}>
              Предпросмотр, страница 1
            </Text>
          </div>
        </Section>
      ) : null}
    </>
  );
}
