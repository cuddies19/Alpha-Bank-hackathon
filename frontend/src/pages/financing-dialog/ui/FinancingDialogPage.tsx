import { useState } from 'react';
import { useLocation } from 'react-router';
import { needToSearch, parseNeedText, useRecommendation, type FinancingNeed } from '@/entities/product';
import { useCompanyId } from '@/entities/session';
import { USE_API, routes } from '@/shared/config';
import { formatMoney, parseMoney } from '@/shared/lib';
import {
  AsyncContent,
  Badge,
  Button,
  ButtonLink,
  Chip,
  Cluster,
  FieldLabel,
  Grid,
  PageContainer,
  PageHeader,
  Section,
  SourceTag,
  Stack,
  TextField,
} from '@/shared/ui';

const SOURCES = ['Выручка с маркетплейсов', 'Оплата по контракту', 'Текущая выручка'];

export function FinancingDialogPage() {
  const companyId = useCompanyId();
  const recommendation = useRecommendation(companyId);
  return (
    <PageContainer>
      <PageHeader
        title="Для чего нужны деньги?"
        description="Ассистент уточнил задачу. Проверьте, всё ли верно, — любое поле можно поправить."
      />
      <AsyncContent query={recommendation}>{(data) => <NeedForm need={data.need} />}</AsyncContent>
    </PageContainer>
  );
}

function NeedForm({ need }: { need: FinancingNeed }) {
  const location = useLocation();
  const task = (location.state as { task?: string } | null)?.task;
  const fromTask = USE_API && task ? parseNeedText(task) : null;
  const [goal, setGoal] = useState(fromTask ? task! : need.goal);
  const [amount, setAmount] = useState(fromTask ? (fromTask.amount ?? 0) : need.amount);
  const [neededBy, setNeededBy] = useState(fromTask ? '' : need.neededBy);
  const [term, setTerm] = useState(String(fromTask ? (fromTask.term ?? 12) : need.term));
  const [source, setSource] = useState(fromTask ? SOURCES[2] : need.repaymentSource);
  const [pledge, setPledge] = useState(need.pledge);
  const complete = Boolean(goal && amount > 0 && Number(term) > 0);
  const offersUrl = `${routes.client.offers()}?${needToSearch({
    goal,
    amount,
    term: Number(term) || need.term,
    neededBy,
    repaymentSource: source,
  })}`;

  return (
    <>
      <Section gap={3}>
        <SourceTag ai>Ваша задача из диалога</SourceTag>
        <blockquote className="body-lg">«{task ?? (USE_API ? goal : need.quote)}»</blockquote>
      </Section>
      <Section
        title="Что поняли о задаче"
        gap={5}
        aside={
          complete ? (
            <Badge tone="success">Всё для подбора есть</Badge>
          ) : (
            <Badge tone="warning">Не хватает данных</Badge>
          )
        }
      >
        <Grid min={280} gap={5}>
          <TextField label="Цель" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <TextField
            label="Сумма"
            format="money"
            value={formatMoney(amount, { currency: false })}
            onChange={(e) => setAmount(parseMoney(e.target.value))}
          />
          <TextField label="Когда нужны деньги" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
          <TextField
            label="На какой срок"
            suffix="мес."
            inputMode="numeric"
            value={term}
            onChange={(e) => setTerm(e.target.value.replace(/\D/g, ''))}
            hint={fromTask ? undefined : need.termHint}
          />
        </Grid>
        <Stack gap={2}>
          <FieldLabel id="source-label">Из чего планируете вернуть</FieldLabel>
          <Cluster role="group" aria-labelledby="source-label">
            {SOURCES.map((s) => (
              <Chip key={s} selected={source === s} onClick={() => setSource(s)}>
                {s}
              </Chip>
            ))}
          </Cluster>
        </Stack>
        <Stack gap={2}>
          <FieldLabel id="pledge-label">Есть ли залог</FieldLabel>
          <Cluster role="group" aria-labelledby="pledge-label">
            <Chip selected={pledge} onClick={() => setPledge(true)}>
              Да
            </Chip>
            <Chip selected={!pledge} onClick={() => setPledge(false)}>
              Нет
            </Chip>
          </Cluster>
        </Stack>
      </Section>
      <Cluster gap={3}>
        {complete ? (
          <ButtonLink variant="primary" size="lg" to={offersUrl}>
            Показать варианты
          </ButtonLink>
        ) : (
          <Button variant="primary" size="lg" disabled>
            Показать варианты
          </Button>
        )}
        <ButtonLink variant="ghost" to={routes.client.financing()}>
          Начать заново
        </ButtonLink>
      </Cluster>
    </>
  );
}
