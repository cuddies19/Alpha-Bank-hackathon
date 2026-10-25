import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useCreateDraft } from '@/entities/application';
import { useRecommendation, type Offer, type Recommendation } from '@/entities/product';
import { useCompanyId } from '@/entities/session';
import { routes } from '@/shared/config';
import {
  annuityPayment,
  formatApproxMoney,
  formatMoney,
  formatMonths,
  formatPercent,
  overpayment,
  paymentShare,
} from '@/shared/lib';
import {
  Alert,
  AsyncContent,
  Button,
  DescriptionList,
  Disclosure,
  ErrorState,
  Heading,
  PageContainer,
  PageHeader,
  PaymentLoadMeter,
  ProductCard,
  RowHeader,
  Section,
  Slider,
  Stack,
  Table,
  Td,
  Text,
  Th,
} from '@/shared/ui';
import styles from './OffersPage.module.css';

const AMOUNT = { min: 500_000, max: 5_000_000, step: 100_000 };
const TERM = { min: 6, max: 36, step: 1 };

export function OffersPage() {
  const companyId = useCompanyId();
  const recommendation = useRecommendation(companyId);
  return (
    <PageContainer>
      <AsyncContent query={recommendation}>{(data) => <Offers data={data} companyId={companyId} />}</AsyncContent>
    </PageContainer>
  );
}

function Offers({ data, companyId }: { data: Recommendation; companyId: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [amount, setAmount] = useState(() => Number(params.get('amount')) || data.need.amount);
  const [term, setTerm] = useState(() => Number(params.get('term')) || data.need.term);
  const createDraft = useCreateDraft(companyId, {
    onSuccess: (draft) => navigate(routes.client.applicationForm(draft.id)),
  });
  const [line, loan] = data.offers as [Offer, Offer];

  const linePayment = annuityPayment({ principal: amount, ratePct: line.rate, months: term, roundTo: 100 });
  const loanPayment = annuityPayment({ principal: loan.amount, ratePct: loan.rate, months: loan.term, roundTo: 100 });
  const comfortPayment = annuityPayment({
    principal: data.comfortAmount,
    ratePct: line.rate,
    months: term,
    roundTo: 100,
  });
  const recalculated = amount === data.comfortAmount;

  const apply = (offer: Offer, offerAmount: number, offerTerm: number) =>
    createDraft.mutate({
      productId: offer.productId,
      amount: offerAmount,
      term: offerTerm,
      goal: data.need.goal,
      neededBy: data.need.neededBy,
      repaymentSource: data.need.repaymentSource,
    });

  const params3 = (rate: number, months: number, payment: number) => [
    { label: 'Срок', value: formatMonths(months) },
    { label: 'Ставка', value: formatPercent(rate) },
    { label: 'Платёж', value: formatApproxMoney(payment) },
  ];

  return (
    <>
      <PageHeader
        title="Варианты под закупку к распродаже"
        back={{ to: routes.client.financingDialog(), children: 'Изменить задачу' }}
        description={`${data.need.goal} · около ${formatMoney(data.need.amount)} · деньги нужны ${data.need.neededBy.toLowerCase()} · возврат из выручки маркетплейсов`}
      />
      {createDraft.isError ? <ErrorState error={createDraft.error} title="Не удалось создать заявку" /> : null}
      <div className={styles.offers}>
        <Stack gap={4}>
          <ProductCard
            recommended
            name={line.name}
            purpose={line.purpose}
            amountLabel={line.amountLabel}
            amount={formatMoney(amount)}
            params={params3(line.rate, term, linePayment)}
            reasons={line.reasons}
            actions={
              <>
                <Button variant="primary" loading={createDraft.isPending} onClick={() => apply(line, amount, term)}>
                  Оформить заявку
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Сравнить продукты
                </Button>
              </>
            }
          >
            <PaymentLoadMeter payment={linePayment} cashFlow={data.cashFlow} />
          </ProductCard>
          {recalculated ? (
            <Alert
              tone="assistant"
              title="Сумма пересчитана"
              action={
                <Button variant="ghost" size="sm" onClick={() => setAmount(data.need.amount)}>
                  Вернуть {formatMoney(data.need.amount)}
                </Button>
              }
            >
              <p>
                Платёж {formatMoney(linePayment)} — {paymentShare(linePayment, data.cashFlow)}% потока. Если партия всё
                же дороже, верните исходную сумму.
              </p>
            </Alert>
          ) : (
            <Alert
              tone="assistant"
              title="Можно взять меньше и платить комфортно"
              action={
                <Button size="sm" onClick={() => setAmount(data.comfortAmount)}>
                  Пересчитать на {formatMoney(data.comfortAmount)}
                </Button>
              }
            >
              <p>
                При {formatMoney(data.comfortAmount)} платёж будет {formatMoney(comfortPayment)} —{' '}
                {paymentShare(comfortPayment, data.cashFlow)}% потока, комфортная нагрузка. Разницу можно добрать из
                лимита позже.
              </p>
            </Alert>
          )}
        </Stack>
        <ProductCard
          name={loan.name}
          purpose={loan.purpose}
          amountLabel={loan.amountLabel}
          amount={formatMoney(loan.amount)}
          params={params3(loan.rate, loan.term, loanPayment)}
          reasons={loan.reasons}
          reasonsTitle={loan.reasonsTitle}
          actions={
            <Button
              variant="ghost"
              disabled={createDraft.isPending}
              onClick={() => apply(loan, loan.amount, loan.term)}
            >
              Выбрать этот вариант
            </Button>
          }
        >
          <PaymentLoadMeter payment={loanPayment} cashFlow={data.cashFlow} />
        </ProductCard>
      </div>

      <Section>
        <Disclosure
          defaultOpen
          summary={
            <Stack gap={0}>
              <Heading>Калькулятор кредитной линии</Heading>
              <Text variant="body-sm" tone="secondary">
                Двигайте сумму и срок — платёж и нагрузка пересчитаются сразу
              </Text>
            </Stack>
          }
        >
          <div className={styles.calculator}>
            <Stack gap={6}>
              <Slider label="Сумма" value={amount} {...AMOUNT} onChange={setAmount} format={(v) => formatMoney(v)} />
              <Slider label="Срок" value={term} {...TERM} onChange={setTerm} format={formatMonths} />
            </Stack>
            <Stack gap={5}>
              <DescriptionList
                items={[
                  { term: 'Платёж в месяц', details: formatMoney(linePayment), valueClassName: 'amount-lg tabular' },
                  {
                    term: 'Переплата за срок',
                    details: formatMoney(
                      Math.round(overpayment({ principal: amount, ratePct: line.rate, months: term, roundTo: 100 })),
                    ),
                    valueClassName: 'amount-lg tabular',
                  },
                  { term: 'Ставка', details: formatPercent(line.rate), valueClassName: 'amount-lg tabular' },
                ]}
              />
              <PaymentLoadMeter payment={linePayment} cashFlow={data.cashFlow} />
            </Stack>
          </div>
        </Disclosure>
      </Section>

      <Section>
        <Disclosure summary={<Heading>Почему не другой продукт?</Heading>}>
          <DescriptionList
            variant="rows"
            items={data.alternatives.map((a) => ({ term: a.product, details: a.reason, regular: true }))}
          />
        </Disclosure>
      </Section>

      <Stack as="section" gap={4} id="compare" className={styles.compare} aria-labelledby="compare-title">
        <Heading id="compare-title" variant="title-2">
          Сравнить продукты
        </Heading>
        <Table plain caption="Сравнение продуктов">
          <thead>
            <tr>
              <Th srOnly>Параметр</Th>
              {data.comparisonColumns.map((column) => (
                <Th key={column}>{column}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.comparison.map((row) => (
              <tr key={row.param}>
                <RowHeader>{row.param}</RowHeader>
                {row.values.map((value, i) => (
                  <Td key={i} nowrap={/₽/.test(value)}>
                    {value}
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        <Text variant="body-sm" tone="secondary">
          Условия — предварительная оценка по данным вашего счёта. Решение принимает банк.
        </Text>
      </Stack>
    </>
  );
}
