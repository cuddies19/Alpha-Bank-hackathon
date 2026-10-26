import { useRulesCatalog } from '@/entities/integration';
import { formatMoney, formatPercent } from '@/shared/lib';
import {
  Alert,
  AsyncContent,
  Badge,
  CardList,
  DescriptionList,
  ExpandableCard,
  Heading,
  PageContainer,
  PageHeader,
  Stack,
  Table,
  Td,
  Th,
  Tr,
} from '@/shared/ui';

export function RulesPage() {
  const catalog = useRulesCatalog();
  return (
    <PageContainer spacing="tight">
      <PageHeader
        title="Продукты и правила"
        description={catalog.data ? `Только для чтения · ${catalog.data.version}` : undefined}
      />
      <Alert tone="info" title="Значения — допущения команды">
        Пороги и условия требуют согласования с кредитным комитетом банка.
      </Alert>
      <AsyncContent query={catalog}>
        {({ products, rules }) => (
          <>
            <Stack as="section" gap={3} aria-labelledby="products-title">
              <Heading id="products-title">Каталог продуктов</Heading>
              <CardList>
                {products.map((p) => (
                  <ExpandableCard
                    key={p.id}
                    tone={p.status === 'soon' ? 'muted' : 'default'}
                    title={p.name}
                    aside={
                      p.status === 'active' ? <Badge tone="success">Активен</Badge> : <Badge icon="clock">Скоро</Badge>
                    }
                    meta={p.task}
                  >
                    <DescriptionList
                      variant="rows"
                      items={[
                        {
                          term: 'Лимит',
                          details: p.limitMin
                            ? `${formatMoney(p.limitMin, { currency: false })} – ${formatMoney(p.limitMax ?? 0)}`
                            : '—',
                        },
                        { term: 'Срок', details: p.termLabel ?? '—' },
                        { term: 'Ставка от', details: p.rateFrom ? formatPercent(p.rateFrom) : '—' },
                        { term: 'Требования', details: p.requirement ?? '—', regular: true },
                      ]}
                    />
                  </ExpandableCard>
                ))}
              </CardList>
              <Table caption="Каталог продуктов" desktopOnly>
                <thead>
                  <tr>
                    <Th>Продукт</Th>
                    <Th>Задача</Th>
                    <Th align="right">Лимит</Th>
                    <Th>Срок</Th>
                    <Th align="right">Ставка от</Th>
                    <Th>Требования</Th>
                    <Th>Статус</Th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <Tr key={p.id} tone={p.status === 'soon' ? 'muted' : 'default'}>
                      <Td strong>{p.name}</Td>
                      <Td>{p.task}</Td>
                      <Td align="right">
                        {p.limitMin
                          ? `${formatMoney(p.limitMin, { currency: false })} – ${formatMoney(p.limitMax ?? 0)}`
                          : '—'}
                      </Td>
                      <Td>{p.termLabel ?? '—'}</Td>
                      <Td align="right">{p.rateFrom ? formatPercent(p.rateFrom) : '—'}</Td>
                      <Td>{p.requirement ?? '—'}</Td>
                      <Td>
                        {p.status === 'active' ? (
                          <Badge tone="success">Активен</Badge>
                        ) : (
                          <Badge icon="clock">Скоро</Badge>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Stack>
            <Stack as="section" gap={3} aria-labelledby="rules-title">
              <Heading id="rules-title">Кредитные правила</Heading>
              <CardList>
                {rules.map((r) => (
                  <ExpandableCard key={r.rule} title={r.rule} meta={`Порог: ${r.threshold}`}>
                    <DescriptionList
                      variant="rows"
                      items={[
                        { term: 'Тип', details: r.kind },
                        { term: 'Если не пройдено', details: r.onFail, regular: true },
                      ]}
                    />
                  </ExpandableCard>
                ))}
              </CardList>
              <Table caption="Кредитные правила" desktopOnly>
                <thead>
                  <tr>
                    <Th>Правило</Th>
                    <Th>Порог</Th>
                    <Th>Тип</Th>
                    <Th>Если не пройдено</Th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.rule}>
                      <Td>{r.rule}</Td>
                      <Td strong>{r.threshold}</Td>
                      <Td>{r.kind}</Td>
                      <Td tone="secondary">{r.onFail}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Stack>
          </>
        )}
      </AsyncContent>
    </PageContainer>
  );
}
