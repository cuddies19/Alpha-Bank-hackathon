import { useLoans, type Loan } from '@/entities/loan';
import { useCompanyId } from '@/entities/session';
import { routes } from '@/shared/config';
import { formatMoney, formatPercent } from '@/shared/lib';
import {
  Alert,
  AsyncContent,
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Heading,
  PageContainer,
  PageHeader,
  Progress,
  Section,
  Stack,
  Text,
  useToast,
} from '@/shared/ui';
import { PaymentSchedule } from '@/widgets/payment-schedule';
import styles from './LoansPage.module.css';

export function LoansPage() {
  const companyId = useCompanyId();
  const loans = useLoans(companyId);
  return (
    <PageContainer spacing="tight">
      <PageHeader title="Мои кредиты" />
      <AsyncContent query={loans}>
        {(list) =>
          list.length ? (
            list.map((loan) => <LoanCard key={loan.id} loan={loan} />)
          ) : (
            <Card>
              <EmptyState
                icon="wallet"
                title="Кредитов пока нет"
                description="Когда банк выдаст деньги, здесь появятся остаток долга, ближайший платёж и график."
                action={<ButtonLink to={routes.client.applications()}>Мои заявки</ButtonLink>}
              />
            </Card>
          )
        }
      </AsyncContent>
    </PageContainer>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
  const toast = useToast();
  const [year, month, day] = loan.firstPaymentDate.split('-').map(Number);
  return (
    <>
      {loan.insight ? (
        <Alert
          tone="assistant"
          title={loan.insight.title}
          action={
            <Button
              size="sm"
              onClick={() =>
                toast.show({
                  tone: 'info',
                  title: 'Досрочное погашение — на следующем этапе',
                  description: 'В демо платёж не проводится',
                })
              }
            >
              Внести досрочно
            </Button>
          }
        >
          <p>{loan.insight.text}</p>
        </Alert>
      ) : null}
      <Section
        title={loan.productName}
        subtitle={`Договор ${loan.contract} от ${loan.signedAt} · ${formatPercent(loan.rate)} · до ${loan.until}`}
        aside={<Badge tone="success">Действует</Badge>}
        gap={5}
      >
        <div className={styles.figures}>
          <Stack gap={1}>
            <Text as="span" variant="label" tone="secondary">
              Остаток долга
            </Text>
            <Text as="span" variant="amount-xl" numeric>
              {formatMoney(loan.rest)}
            </Text>
          </Stack>
          <Stack gap={1}>
            <Text as="span" variant="label" tone="secondary">
              Ближайший платёж
            </Text>
            <Text as="span" variant="amount-lg" numeric>
              {formatMoney(loan.payment)}
            </Text>
            <Text as="span" variant="body-sm" tone="secondary">
              {loan.nextPaymentDate}, {loan.nextPaymentIn}
            </Text>
          </Stack>
          <Stack gap={2}>
            <Text as="span" variant="label" tone="secondary">
              Погашено
            </Text>
            <Progress
              value={loan.paidCount}
              max={loan.term}
              label={`Погашено ${loan.paidCount} из ${loan.term} платежей`}
            />
            <Text as="span" variant="body-sm" tone="secondary">
              {loan.paidCount} из {loan.term} платежей
            </Text>
          </Stack>
        </div>
        <div className={styles.schedule}>
          <Heading level={3} variant="body-strong">
            График платежей
          </Heading>
          <PaymentSchedule
            principal={loan.principal}
            ratePct={loan.rate}
            months={loan.term}
            firstDate={new Date(year, month - 1, day)}
            roundTo={100}
            preview={6}
            withStatus
          />
        </div>
      </Section>
    </>
  );
}
