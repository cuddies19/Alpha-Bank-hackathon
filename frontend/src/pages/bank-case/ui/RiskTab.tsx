import { RiskClassBadge, ScoreFactors, ScoreScale } from '@/entities/application';
import { Alert, Badge, EmptyState, Heading, Section, Stack, Table, Td, Text, Th } from '@/shared/ui';
import { useCaseData } from './useCaseData';
import styles from './tabs.module.css';

export function RiskTab() {
  const { scoring, rules, rulesSummary, application, checks } = useCaseData();
  const bkiFailed = checks.some((c) => c.id === 'bki' && c.status === 'fail');
  const noScoreReason = bkiFailed
    ? 'Кредитная история не пришла — без неё модель не считает балл. Правила продукта проверены без него.'
    : rules.length
      ? 'Модель не посчитала балл по этой заявке. Правила продукта проверены без него.'
      : 'Заявка ещё не прошла автоматическую проверку — балл появится после неё.';
  return (
    <>
      <Section
        title="Скоринг"
        gap={5}
        aside={
          scoring ? (
            <Text as="span" variant="body-sm" tone="secondary">
              Модель {scoring.model} · {scoring.calculatedAt}
            </Text>
          ) : undefined
        }
      >
        {scoring ? (
          <>
            <div className={styles.score}>
              <Text as="span" variant="amount-xl" numeric>
                {scoring.score}
              </Text>
              <RiskClassBadge
                riskClass={scoring.riskClass}
                label={`Класс ${scoring.riskClass} · ${scoring.riskLabel}`}
                className={styles.riskBadge}
              />
              {scoring.pd !== '—' ? (
                <Text as="span" variant="body-sm" tone="secondary">
                  PD на 12 мес. — {scoring.pd}
                </Text>
              ) : null}
            </div>
            <ScoreScale score={scoring.score} riskClass={scoring.riskClass} />
            {scoring.factors.length ? (
              <Stack gap={3} className={styles.divided}>
                <Heading level={3} variant="body-strong">
                  Факторы и их вклад в балл
                </Heading>
                <ScoreFactors factors={scoring.factors} />
              </Stack>
            ) : null}
            <Text variant="body-sm" tone="secondary">
              Балл — оценка вероятности дефолта. Он не принимает решение, а входит в правила продукта как один из
              порогов.
            </Text>
          </>
        ) : (
          <EmptyState compact icon="alert" title="Балла нет" description={noScoreReason} />
        )}
      </Section>
      <Section title={`Кредитные правила продукта «${application.productName}»`}>
        <Table plain flat caption="Кредитные правила">
          <thead>
            <tr>
              <Th>Правило</Th>
              <Th>Значение</Th>
              <Th>Порог</Th>
              <Th>Результат</Th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.rule}>
                <Td>{rule.rule}</Td>
                <Td nowrap strong={!rule.passed}>
                  {rule.value}
                </Td>
                <Td tone="secondary">{rule.threshold}</Td>
                <Td nowrap>
                  <Badge tone={rule.passed ? 'success' : 'danger'}>{rule.passed ? 'Да' : 'Нет'}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Alert tone={rulesSummary.tone} title={rulesSummary.title}>
          {rulesSummary.text}
        </Alert>
      </Section>
    </>
  );
}
