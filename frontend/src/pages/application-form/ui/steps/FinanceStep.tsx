import { useYearTurnover } from '@/entities/account';
import { useRemoveDocument, useUploadDocument, type ApplicationDocument } from '@/entities/application';
import { formatMoney } from '@/shared/lib';
import {
  AsyncContent,
  Badge,
  BarChart,
  CardSkeleton,
  DescriptionList,
  DocumentUpload,
  ErrorState,
  Icon,
  Section,
  Stack,
  Text,
  type IconName,
  type Tone,
  type UploadedDoc,
} from '@/shared/ui';
import type { StepProps } from './ParametersStep';
import styles from './steps.module.css';

const DOC_VIEW: Record<ApplicationDocument['status'], { tone: Tone; word: string; icon: IconName }> = {
  ok: { tone: 'success', word: 'Принят', icon: 'check-circle' },
  checking: { tone: 'info', word: 'Проверяем', icon: 'clock' },
  uploading: { tone: 'neutral', word: 'Загружается', icon: 'upload' },
  error: { tone: 'danger', word: 'Нужно заменить', icon: 'alert' },
  missing: { tone: 'neutral', word: 'Не загружен', icon: 'document' },
};

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;

export function FinanceStep({ app }: StepProps) {
  const turnover = useYearTurnover(app.companyId);
  const upload = useUploadDocument();
  const remove = useRemoveDocument(app.id);

  const uploaded: UploadedDoc[] = app.documents
    .filter((d) => d.fileName && d.status !== 'missing')
    .map((d) => ({
      id: d.id,
      name: d.fileName!,
      size: d.size,
      status: d.status as UploadedDoc['status'],
      progress: d.progress,
      message: d.message,
    }));

  const onFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      await upload
        .mutateAsync({ applicationId: app.id, name: file.name, size: formatSize(file.size) })
        .catch(() => undefined);
    }
  };

  return (
    <>
      <AsyncContent query={turnover} skeleton={<CardSkeleton lines={4} />}>
        {(data) => (
          <>
            <Section title="Обороты за 12 месяцев" aside={<Badge icon="document">Из выписки по счёту</Badge>}>
              <div className={styles.turnover}>
                <Stack gap={1}>
                  <Text as="span" variant="label" tone="secondary">
                    Поступления, {data.period}
                  </Text>
                  <Text as="span" variant="amount-lg" numeric>
                    {formatMoney(data.totalIncome)}
                  </Text>
                </Stack>
                <BarChart
                  className={styles.sparkline}
                  variant="compact"
                  height={80}
                  max={4.5}
                  series={[{ label: 'Поступления', color: 'var(--ink)' }]}
                  groups={data.months.map((m) => ({ label: m.label, values: [m.income] }))}
                  xLabels={['ноя', 'фев', 'май', 'авг', 'окт']}
                  ariaLabel="Поступления по месяцам: пик в ноябре и декабре, спад летом, рост к октябрю"
                />
              </div>
            </Section>
            <Section title="Действующие кредиты" gap={3} aside={<Badge icon="document">Из выписки по счёту</Badge>}>
              {data.existingLoans.length ? (
                <DescriptionList
                  variant="rows"
                  items={data.existingLoans.map((loan) => ({
                    term: loan.title,
                    details: `остаток ${formatMoney(loan.rest)} · ${formatMoney(loan.payment)} в месяц`,
                  }))}
                />
              ) : (
                <Text tone="secondary">Действующих кредитов нет.</Text>
              )}
              <Text variant="body-sm" tone="secondary">
                Банк сверит данные с кредитной историей — вводить вручную не нужно.
              </Text>
            </Section>
          </>
        )}
      </AsyncContent>
      <Section title="Документы" gap={5}>
        <ul className={styles.docs}>
          {app.documents.map((doc) => {
            const view = DOC_VIEW[doc.status];
            const word = doc.status === 'missing' && !doc.required ? 'Необязательно' : view.word;
            const tone = doc.status === 'missing' && doc.required ? 'warning' : view.tone;
            return (
              <li key={doc.id} className={styles.doc}>
                <span className={styles[`icon_${tone}`]}>
                  <Icon name={view.icon} />
                </span>
                <span className={styles.docText}>
                  <span className="body-strong">{doc.title}</span>
                  <Text as="span" variant="body-sm" tone="secondary">
                    {doc.note}
                  </Text>
                </span>
                <Badge tone={tone} icon={doc.status === 'missing' ? false : undefined}>
                  {word}
                </Badge>
              </li>
            );
          })}
        </ul>
        <DocumentUpload
          files={uploaded}
          onFiles={(files) => void onFiles(files)}
          onRemove={(id) => remove.mutate(id)}
          hint="PDF, JPG или PNG до 20 МБ. Проверим файл сразу после загрузки"
        />
        {upload.isError ? <ErrorState error={upload.error} title="Файл не загрузился" /> : null}
      </Section>
    </>
  );
}
