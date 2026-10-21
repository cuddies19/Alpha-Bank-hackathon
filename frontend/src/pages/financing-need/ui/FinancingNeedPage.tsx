import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FINANCING_GOALS } from '@/entities/product';
import { routes } from '@/shared/config';
import {
  AssistantMark,
  Badge,
  Button,
  Chip,
  Cluster,
  Columns,
  Grid,
  Heading,
  Icon,
  OrDivider,
  PageContainer,
  PageHeader,
  Section,
  Stack,
  Textarea,
} from '@/shared/ui';
import { NeedSummary } from '@/widgets/need-summary';
import styles from './FinancingNeedPage.module.css';

const SUGGESTIONS = [
  'Закупить товар к сезону',
  'Не хватает на зарплату до поступления выручки',
  'Купить оборудование',
  'Выиграли тендер',
];

export function FinancingNeedPage() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const toDialog = (task: string) => navigate(routes.client.financingDialog(), { state: { task } });

  return (
    <PageContainer>
      <PageHeader
        title="Для чего нужны деньги?"
        description="Расскажите о задаче словами бизнеса — подберём продукт и посчитаем платёж по данным вашего счёта."
      />
      <Columns
        mainBasis={400}
        sideLabel="Что поняли о задаче"
        roomy
        main={
          <>
            <Section
              title={
                <Cluster gap={3} as="span">
                  <AssistantMark />
                  Описать своими словами
                </Cluster>
              }
            >
              <Textarea
                label="Задача бизнеса"
                hideLabel
                large
                placeholder="Например: нужно закупить товар к распродаже, а выплата от маркетплейса придёт позже"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Cluster>
                {SUGGESTIONS.map((s) => (
                  <Chip key={s} onClick={() => toDialog(s)}>
                    {s}
                  </Chip>
                ))}
              </Cluster>
              <Cluster>
                <Button iconLeft="arrow-up" disabled={!text.trim()} onClick={() => toDialog(text.trim())}>
                  Отправить ассистенту
                </Button>
              </Cluster>
            </Section>
            <OrDivider />
            <Stack as="section" gap={4} aria-labelledby="goal-title">
              <Heading id="goal-title">Выбрать цель</Heading>
              <Grid min={190}>
                {FINANCING_GOALS.map((goal) => (
                  <Link key={goal.id} className={styles.goal} to={`${routes.client.financingGoal()}?goal=${goal.id}`}>
                    <span className={styles.goalIcon}>
                      <Icon name={goal.icon} size={24} />
                    </span>
                    <span className="body-strong">{goal.title}</span>
                    <span className={`body-sm ${styles.secondary}`}>{goal.text}</span>
                    {goal.soon ? <Badge>{goal.soon}</Badge> : null}
                  </Link>
                ))}
              </Grid>
            </Stack>
          </>
        }
        side={
          <NeedSummary
            rows={[{ term: 'Цель' }, { term: 'Сумма' }, { term: 'Срок' }, { term: 'Когда нужны деньги' }]}
            action={
              <Button variant="primary" fullWidth disabled>
                Показать варианты
              </Button>
            }
            hint="Опишите задачу или выберите цель — после этого покажем подходящие продукты."
          />
        }
      />
    </PageContainer>
  );
}
