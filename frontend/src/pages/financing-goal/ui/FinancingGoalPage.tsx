import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { FINANCING_GOALS, needToSearch } from '@/entities/product';
import { routes } from '@/shared/config';
import { formatMoney, formatMonths, parseMoney, plural } from '@/shared/lib';
import {
  Button,
  ButtonLink,
  Card,
  Chip,
  Cluster,
  Columns,
  Heading,
  Icon,
  PageContainer,
  PageHeader,
  Section,
  Slider,
  Text,
  TextField,
} from '@/shared/ui';
import { NeedSummary } from '@/widgets/need-summary';
import styles from './FinancingGoalPage.module.css';

const AMOUNT = { min: 500000, max: 5000000, step: 100000 };
const WHEN = ['До 1 ноября', 'В течение ноября', 'Не срочно'];
const TERMS = [6, 12, 18, 24];
const SOURCES = ['Выручка с маркетплейсов', 'Оплата по контракту', 'Текущая выручка'];
const QUESTIONS = 5;

interface Answers {
  amount: number;
  when: string;
  term: number;
  source: string;
  pledge: boolean;
}

export function FinancingGoalPage() {
  const [params] = useSearchParams();
  const initialGoal = FINANCING_GOALS.find((g) => g.id === params.get('goal'))?.id ?? 'turnover';
  const [goalId, setGoalId] = useState(initialGoal);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    amount: 3000000,
    when: WHEN[0],
    term: 18,
    source: SOURCES[0],
    pledge: false,
  });
  const set = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }));
  const goal = FINANCING_GOALS.find((g) => g.id === goalId)!;
  const done = step >= QUESTIONS;
  const left = QUESTIONS - 1 - step;

  const titles = [
    'Сколько нужно?',
    'Когда нужны деньги?',
    'На какой срок?',
    'Из чего планируете вернуть?',
    'Есть ли залог?',
  ];
  const values = [
    formatMoney(answers.amount),
    answers.when,
    formatMonths(answers.term),
    answers.source,
    answers.pledge ? 'Да' : 'Нет',
  ];

  const chips = <T,>(options: T[], current: T, label: (v: T) => string, pick: (v: T) => void, icon?: 'calendar') => (
    <Cluster>
      {options.map((option) => (
        <Chip key={label(option)} icon={icon} selected={option === current} onClick={() => pick(option)}>
          {label(option)}
        </Chip>
      ))}
    </Cluster>
  );

  const questions: ReactNode[] = [
    <>
      <Slider
        label="Сумма"
        valueSize="lg"
        value={answers.amount}
        {...AMOUNT}
        onChange={(amount) => set({ amount })}
        format={(v) => formatMoney(v)}
      />
      <TextField
        className={styles.amountField}
        label="Или введите точную сумму"
        format="money"
        value={formatMoney(answers.amount, { currency: false })}
        onChange={(e) => set({ amount: parseMoney(e.target.value) })}
      />
    </>,
    chips(
      WHEN,
      answers.when,
      (v) => v,
      (when) => set({ when }),
      'calendar',
    ),
    <>
      {chips(TERMS, answers.term, formatMonths, (term) => set({ term }))}
      <Text variant="body-sm" tone="secondary">
        Для закупок партиями обычно берут 12–18 месяцев.
      </Text>
    </>,
    chips(
      SOURCES,
      answers.source,
      (v) => v,
      (source) => set({ source }),
    ),
    <>
      {chips(
        [true, false],
        answers.pledge,
        (v) => (v ? 'Да' : 'Нет'),
        (pledge) => set({ pledge }),
      )}
      <Text variant="body-sm" tone="secondary">
        Залог не обязателен для сумм до 5 000 000 ₽.
      </Text>
    </>,
  ];

  const offersUrl = `${routes.client.offers()}?${needToSearch({
    goal: goal.title,
    amount: answers.amount,
    term: answers.term,
    neededBy: answers.when,
    repaymentSource: answers.source,
  })}`;

  return (
    <PageContainer>
      <PageHeader
        title="Для чего нужны деньги?"
        back={{ to: routes.client.financing(), children: 'Описать задачу словами' }}
      />
      <Columns
        mainBasis={400}
        sideLabel="Что поняли о задаче"
        main={
          <>
            <Section gap={3}>
              <span className="label" id="goal-label">
                Цель
              </span>
              <Cluster role="group" aria-labelledby="goal-label">
                {FINANCING_GOALS.map((g) => (
                  <Chip key={g.id} selected={g.id === goalId} onClick={() => setGoalId(g.id)}>
                    {g.title}
                  </Chip>
                ))}
              </Cluster>
            </Section>
            {titles.slice(0, Math.min(step, QUESTIONS)).map((title, i) => (
              <Card key={title} padding="sm" className={styles.answer}>
                <span className={styles.answerIcon}>
                  <Icon name="check-circle" />
                </span>
                <span className={`body ${styles.answerTitle}`}>{title}</span>
                <Text as="span" variant="body-strong" numeric>
                  {values[i]}
                </Text>
                <Button variant="ghost" size="sm" onClick={() => setStep(i)}>
                  Изменить
                </Button>
              </Card>
            ))}
            <Section gap={5} aria-live="polite">
              {done ? (
                <>
                  <Heading>Всё понятно</Heading>
                  <Text tone="secondary">Проверьте сводку справа и откройте варианты.</Text>
                </>
              ) : (
                <>
                  <Text variant="caption" tone="secondary">
                    Вопрос {step + 1} из {QUESTIONS}
                  </Text>
                  <Heading>{titles[step]}</Heading>
                  {questions[step]}
                  <Cluster gap={4}>
                    <Button iconRight="chevron-right" onClick={() => setStep(step + 1)}>
                      Дальше
                    </Button>
                    <Text as="span" variant="body-sm" tone="secondary">
                      {left > 0
                        ? `Потом ещё ${left} ${plural(left, ['вопрос', 'вопроса', 'вопросов'])}`
                        : 'Последний вопрос'}
                    </Text>
                  </Cluster>
                </>
              )}
            </Section>
          </>
        }
        side={
          <NeedSummary
            rows={[
              { term: 'Цель', value: goal.title },
              { term: 'Сумма', value: step > 0 ? values[0] : undefined },
              { term: 'Когда', value: step > 1 ? values[1] : undefined },
              { term: 'Срок', value: step > 2 ? values[2] : undefined },
              { term: 'Возврат', value: step > 3 ? values[3] : undefined },
              { term: 'Залог', value: step > 4 ? values[4] : undefined },
            ]}
            action={
              done ? (
                <ButtonLink variant="primary" fullWidth to={offersUrl}>
                  Показать варианты
                </ButtonLink>
              ) : (
                <Button variant="primary" fullWidth disabled>
                  Показать варианты
                </Button>
              )
            }
            hint={done ? undefined : 'Ответьте на оставшиеся вопросы — кнопка станет активной.'}
          />
        }
      />
    </PageContainer>
  );
}
