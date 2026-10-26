import { useRef, useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import {
  ApplicationStateNotice,
  useApplication,
  useSubmitApplication,
  useUpdateDraft,
  type Application,
  type DraftPatch,
} from '@/entities/application';
import { PRODUCT_ACCUSATIVE } from '@/entities/product';
import { APPLICATION_FORM_STEPS, routes, type ApplicationFormStep } from '@/shared/config';
import {
  Alert,
  AsyncContent,
  Button,
  ButtonLink,
  Card,
  Columns,
  ErrorState,
  Note,
  PageContainer,
  PageHeader,
  Section,
  StepList,
  Stepper,
} from '@/shared/ui';
import { ApplicationSummary } from './ApplicationSummary';
import { FormFooter } from './FormFooter';
import { CompanyStep } from './steps/CompanyStep';
import { FinanceStep } from './steps/FinanceStep';
import { ParametersStep, type StepProps } from './steps/ParametersStep';
import { ReviewStep } from './steps/ReviewStep';

const STEPS = [
  { label: 'Параметры', description: 'Сумма, срок и цель' },
  { label: 'Компания', description: 'Из ЕГРЮЛ' },
  { label: 'Финансы и документы', description: 'Из выписки по счёту' },
  { label: 'Проверка и отправка' },
];

const STEP_VIEW: Record<ApplicationFormStep, (props: StepProps) => ReactNode> = {
  parameters: ParametersStep,
  company: CompanyStep,
  finance: FinanceStep,
  review: ReviewStep,
};

function isStep(value: string | undefined): value is ApplicationFormStep {
  return APPLICATION_FORM_STEPS.includes(value as ApplicationFormStep);
}

export function ApplicationFormPage() {
  const { id = '', step } = useParams();
  const application = useApplication(id);
  if (!isStep(step)) return <Navigate to={routes.client.applicationForm(id)} replace />;
  return (
    <PageContainer spacing="tight">
      <AsyncContent query={application}>
        {(app) =>
          app.status === 'draft' ? (
            <Form key={`${app.id}:${step}`} app={app} step={step} />
          ) : (
            <ApplicationStateNotice
              applicationId={app.id}
              title="Заявка уже отправлена"
              description="Изменить отправленную заявку нельзя. Её статус — на странице заявки."
            />
          )
        }
      </AsyncContent>
    </PageContainer>
  );
}

function Form({ app, step }: { app: Application; step: ApplicationFormStep }) {
  const navigate = useNavigate();
  const update = useUpdateDraft(app.id);
  const submit = useSubmitApplication({
    onSuccess: () => navigate(routes.client.applicationSent(app.id), { replace: true }),
  });
  const pending = useRef<DraftPatch>({});
  const [stepError, setStepError] = useState<string | null>(null);

  const index = APPLICATION_FORM_STEPS.indexOf(step);
  const prev = APPLICATION_FORM_STEPS[index - 1];
  const next = APPLICATION_FORM_STEPS[index + 1];
  const StepView = STEP_VIEW[step];

  const requiredMissing = app.documents.filter((d) => d.required && d.status !== 'ok').length;
  const consentsMissing = Object.values(app.consents).filter((v) => !v).length;
  const blocker =
    stepError ??
    (step === 'finance' && requiredMissing
      ? `Не хватает ${requiredMissing} обязательного документа`
      : step === 'review' && consentsMissing
        ? 'Отметьте недостающие согласия'
        : null);

  const goNext = () => {
    if (!next) return;
    update.mutate(
      { ...pending.current, draftStep: Math.max(app.draftStep ?? 1, index + 2) },
      { onSuccess: () => navigate(routes.client.applicationForm(app.id, next)) },
    );
  };

  const send = () => submit.mutate(app.id);

  const state = submit.isPending ? 'sending' : update.isPending ? 'saving' : update.isError ? 'offline' : 'saved';

  return (
    <>
      <PageHeader
        title={`Заявка на ${PRODUCT_ACCUSATIVE[app.productId] ?? app.productName}`}
        description={`№ ${app.number} · черновик`}
      />
      <Card>
        <Stepper steps={STEPS} current={index} />
      </Card>
      <Columns
        main={
          <>
            <StepView
              app={app}
              onChange={(patch, error) => {
                pending.current = { ...pending.current, ...patch };
                setStepError(error);
              }}
              onSave={(patch) => update.mutate(patch)}
            />
            {submit.isError ? <ErrorState error={submit.error} title="Не удалось отправить заявку" /> : null}
            <FormFooter state={state} savedAt={app.draftSavedAt} blocker={blocker ?? undefined}>
              {prev ? (
                <ButtonLink to={routes.client.applicationForm(app.id, prev)}>Назад</ButtonLink>
              ) : (
                <ButtonLink to={routes.client.offers()}>Назад</ButtonLink>
              )}
              {next ? (
                <Button variant="primary" disabled={Boolean(blocker)} loading={update.isPending} onClick={goNext}>
                  Продолжить
                </Button>
              ) : (
                <Button variant="primary" disabled={Boolean(blocker)} loading={submit.isPending} onClick={send}>
                  {submit.isPending ? 'Отправляем' : 'Отправить заявку'}
                </Button>
              )}
            </FormFooter>
          </>
        }
        side={<StepAside app={app} step={step} />}
      />
    </>
  );
}

function StepAside({ app, step }: { app: Application; step: ApplicationFormStep }) {
  switch (step) {
    case 'parameters':
      return <ApplicationSummary app={app} rows={['product', 'amount', 'term', 'rate', 'payment']} meter />;
    case 'company':
      return (
        <>
          <ApplicationSummary app={app} rows={['product', 'amount', 'term', 'payment']} />
          <Alert tone="assistant" title="Реквизиты вводить не нужно">
            Взяли их из ЕГРЮЛ по ИНН компании. Если что-то устарело — нажмите «Данные неверны».
          </Alert>
        </>
      );
    case 'finance':
      return (
        <>
          <ApplicationSummary app={app} rows={['product', 'amount', 'documents']} />
          <Alert tone="assistant" title="Часть выручки, похоже, идёт на другой счёт">
            Выписка из другого банка поможет банку увидеть всю выручку — тогда сумма может быть выше.
          </Alert>
        </>
      );
    case 'review':
      return (
        <Section title="Что будет дальше">
          <StepList
            items={[
              'Проверим данные и документы',
              'Запросим сведения в ЕГРЮЛ, ФНС и бюро кредитных историй',
              'Примем решение — обычно до 2 часов',
            ]}
          />
          <Note>Решение принимает банк. Сообщим о нём здесь, в кабинете.</Note>
        </Section>
      );
  }
}
