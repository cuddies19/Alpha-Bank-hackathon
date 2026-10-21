import { Link } from 'react-router';
import { CheckStatusIcon, OUTCOME_RESULT } from '@/entities/application';
import { routes } from '@/shared/config';
import { formatMoney, formatMonths, formatPercent } from '@/shared/lib';
import { Badge, ButtonLink, DescriptionList, Section, SourceTag, Text, type Tone } from '@/shared/ui';
import { useCaseData } from './useCaseData';
import styles from './tabs.module.css';

const OUTCOME_TONE: Record<string, Tone> = {
  approve: 'success',
  counter: 'warning',
  request: 'info',
  decline: 'danger',
};

export function SummaryTab() {
  const data = useCaseData();
  const app = data.application;
  const passed = data.rules.filter((r) => r.passed).length;
  const ok = data.checks.filter((c) => c.status === 'ok').length;
  const warn = data.checks.length - ok;

  return (
    <>
      <Section
        title="Рекомендация системы"
        aside={
          <Badge tone={OUTCOME_TONE[data.recommendation.outcome]}>{OUTCOME_RESULT[data.recommendation.outcome]}</Badge>
        }
      >
        <Text variant="body-lg">{data.recommendation.text}</Text>
        <div className={styles.tiles}>
          <Link className={styles.tile} to={routes.bank.application(app.id, 'risk')}>
            <Text as="span" variant="body-sm" tone="secondary">
              Скоринг
            </Text>
            <span className="body-strong">
              {data.scoring ? `${data.scoring.score} из 1000 · класс ${data.scoring.riskClass}` : 'нет данных'}
            </span>
          </Link>
          <Link className={styles.tile} to={routes.bank.application(app.id, 'risk')}>
            <Text as="span" variant="body-sm" tone="secondary">
              Правила продукта
            </Text>
            <span className="body-strong">
              {passed} из {data.rules.length} пройдены
            </span>
          </Link>
          <Link className={styles.tile} to={routes.bank.application(app.id, 'checks')}>
            <Text as="span" variant="body-sm" tone="secondary">
              Источники
            </Text>
            <span className="body-strong">
              {ok} ок{warn ? ` · ${warn} внимание` : ''}
            </span>
          </Link>
        </div>
        <Text variant="body-sm" tone="secondary">
          Скоринг и правила — подсказка. Решение принимает аналитик.
        </Text>
      </Section>
      <Section title="Параметры заявки">
        <DescriptionList
          items={[
            { term: 'Продукт', details: app.productName },
            { term: 'Сумма', details: formatMoney(app.amount), valueClassName: 'tabular' },
            { term: 'Срок', details: formatMonths(app.term) },
            { term: 'Ставка', details: formatPercent(app.rate) },
            { term: 'Платёж', details: formatMoney(app.payment), valueClassName: 'tabular' },
            { term: 'Деньги нужны', details: app.neededBy },
            { term: 'Источник возврата', details: app.repaymentSource },
            { term: 'Залог', details: app.pledge ? 'Да' : 'Нет' },
          ]}
        />
      </Section>
      {app.quote ? (
        <Section title="Цель словами клиента" gap={3} aside={<SourceTag ai>Из диалога с ассистентом</SourceTag>}>
          <blockquote className="body-lg">«{app.quote}»</blockquote>
          <Text variant="body-sm" tone="secondary">
            {app.goal}
          </Text>
        </Section>
      ) : null}
      <Section
        title="Проверки в источниках"
        gap={2}
        aside={
          <ButtonLink variant="link" to={routes.bank.application(app.id, 'checks')}>
            Подробнее
          </ButtonLink>
        }
      >
        <DescriptionList
          variant="rows"
          items={data.checks.map((c) => ({
            term: c.name,
            termIcon: <CheckStatusIcon status={c.status} />,
            details: `${c.summary} · ${c.time}`,
            regular: true,
          }))}
        />
      </Section>
    </>
  );
}
