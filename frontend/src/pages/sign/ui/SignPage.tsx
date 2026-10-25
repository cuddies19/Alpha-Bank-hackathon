import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import {
  ApplicationStateNotice,
  useApplication,
  useSignApplication,
  useSigningDocuments,
  type Application,
} from '@/entities/application';
import type { SigningDocument } from '@/entities/document';
import { routes } from '@/shared/config';
import { todayLabel, formatMoney, formatMonths, formatPercent } from '@/shared/lib';
import {
  Alert,
  Amount,
  AsyncContent,
  Button,
  Callout,
  CardSkeleton,
  Checkbox,
  Cluster,
  DescriptionList,
  Drawer,
  FileIcon,
  Note,
  OtpInput,
  PageContainer,
  PageHeader,
  Section,
  Stack,
  Text,
} from '@/shared/ui';
import styles from './SignPage.module.css';

const DEMO_CODE = '482913';

export function SignPage() {
  const { id = '' } = useParams();
  const application = useApplication(id);
  return (
    <PageContainer width="narrow" spacing="tight">
      <AsyncContent query={application}>
        {(app) =>
          app.status === 'issued' ? (
            <Navigate to={routes.client.issued(app.id)} replace />
          ) : app.status !== 'approved' || !app.decision ? (
            <ApplicationStateNotice
              applicationId={app.id}
              title="Подписывать пока нечего"
              description="Документы появятся здесь, когда банк одобрит заявку и вы примете условия."
            />
          ) : (
            <Sign key={app.id} app={app} />
          )
        }
      </AsyncContent>
    </PageContainer>
  );
}

function Sign({ app }: { app: Application }) {
  const navigate = useNavigate();
  const decision = app.decision!;
  const documents = useSigningDocuments(app.id);
  const sign = useSignApplication(app.id, { onSuccess: () => navigate(routes.client.issued(app.id)) });
  const [agree, setAgree] = useState(false);
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<SigningDocument | null>(null);
  const complete = code.length === 6;
  const ready = agree && complete;

  return (
    <>
      <PageHeader
        title="Подписание документов"
        description={
          <>
            {app.productName} · <Amount>{formatMoney(decision.amount)}</Amount> · {formatMonths(decision.term)} ·{' '}
            {formatPercent(decision.rate)}
          </>
        }
      />
      <Section title="Документы" gap={2}>
        <AsyncContent query={documents} skeleton={<CardSkeleton lines={3} />}>
          {(list) => (
            <ul>
              {list.map((doc) => (
                <li key={doc.id} className={styles.doc}>
                  <FileIcon />
                  <span className={styles.docText}>
                    <span className="body-strong">{doc.title}</span>
                    <Text as="span" variant="body-sm" tone="secondary">
                      {doc.meta}
                    </Text>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setPreview(doc)}>
                    Открыть
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </AsyncContent>
      </Section>
      <Section gap={5}>
        <Checkbox checked={agree} onChange={setAgree}>
          Ознакомился с условиями кредитного договора и графиком платежей
        </Checkbox>
        <Stack gap={3}>
          <span className="label" id="otp-label">
            Код подтверждения
          </span>
          <OtpInput
            value={code}
            onChange={(value) => {
              setCode(value);
              sign.reset();
            }}
            labelledBy="otp-label"
          />
          <Callout
            icon="shield"
            variant="dashed"
            action={
              <Button variant="ghost" size="sm" onClick={() => setCode(DEMO_CODE)}>
                Подставить
              </Button>
            }
          >
            Демо: код подтверждения <b className="tabular">482 913</b>. Код показан здесь вместо SMS: весь путь остаётся
            в кабинете.
          </Callout>
        </Stack>
        {sign.isError ? (
          <Alert tone="danger" title="Не получилось подписать">
            {sign.error.message}
          </Alert>
        ) : null}
        <Cluster gap={4}>
          <Button
            variant="primary"
            size="lg"
            disabled={!ready}
            loading={sign.isPending}
            onClick={() => sign.mutate(code)}
          >
            Подписать
          </Button>
          {!ready ? (
            <Text as="span" variant="body-sm" tone="secondary">
              {!agree ? 'Отметьте, что ознакомились с условиями' : 'Введите код из 6 цифр'}
            </Text>
          ) : null}
        </Cluster>
      </Section>
      <Note>Подписание смоделировано: юридической силы нет.</Note>

      <Drawer
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title}
        subtitle={preview?.meta}
        closeLabel="Закрыть предпросмотр"
        width="lg"
        footer={
          <>
            <Button iconLeft="arrow-down">Скачать PDF</Button>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Закрыть
            </Button>
          </>
        }
      >
        <div className={styles.preview}>
          <p className="body-strong">Кредитный договор № {app.number}-Д</p>
          <Text variant="body-sm" tone="secondary">
            г. Москва · {todayLabel({ year: true })}
          </Text>
          <p className="body">
            Банк открывает заёмщику {app.companyName} {app.productName.toLowerCase()} с лимитом{' '}
            {formatMoney(decision.amount)} на {formatMonths(decision.term)} под {formatPercent(decision.rate)} годовых.
          </p>
          <p className="body">
            Заёмщик берёт деньги частями в пределах лимита и гасит их ежемесячными платежами по графику — первый платёж{' '}
            {decision.firstPayment} 2026.
          </p>
          <p className="body">Досрочное погашение — без комиссии, в любой день через кабинет.</p>
          <Text variant="body-sm" tone="secondary">
            Страница 1 из 6
          </Text>
        </div>
        <DescriptionList
          variant="rows"
          items={[
            { term: 'Лимит', details: formatMoney(decision.amount) },
            { term: 'Срок', details: formatMonths(decision.term) },
            { term: 'Ставка', details: formatPercent(decision.rate) },
            { term: 'Платёж', details: formatMoney(decision.payment) },
          ]}
        />
      </Drawer>
    </>
  );
}
