import { useProducts, type Product } from '@/entities/product';
import { routes } from '@/shared/config';
import { formatMoney, formatPercent, NBSP } from '@/shared/lib';
import {
  AssistantMark,
  AsyncContent,
  Badge,
  ButtonLink,
  Grid,
  Note,
  PageContainer,
  PageHeader,
  ProductCard,
} from '@/shared/ui';
import styles from './CatalogPage.module.css';

export function CatalogPage() {
  const products = useProducts();
  return (
    <PageContainer>
      <PageHeader
        title="Каталог продуктов"
        description="Для тех, кто знает, что нужно. Условия — от каталога, точные посчитаем по данным счёта."
        actions={
          <ButtonLink to={routes.client.financing()}>
            <AssistantMark size="sm" />
            Подобрать под задачу
          </ButtonLink>
        }
      />
      <AsyncContent query={products}>
        {(list) => (
          <Grid min={320} gap={6} align="stretch">
            {list.map((product) =>
              product.status === 'active' ? (
                <ActiveProduct key={product.id} product={product} />
              ) : (
                <SoonProduct key={product.id} product={product} />
              ),
            )}
          </Grid>
        )}
      </AsyncContent>
    </PageContainer>
  );
}

function ActiveProduct({ product }: { product: Product }) {
  return (
    <ProductCard
      name={product.name}
      purpose={product.purpose}
      amountLabel={product.amountLabel}
      amount={formatMoney(product.limitMax ?? 0)}
      note={false}
      params={[
        { label: 'Срок', value: product.termLabel },
        { label: 'Ставка', value: `от${NBSP}${formatPercent(product.rateFrom ?? 0)}` },
        { label: 'От суммы', value: formatMoney(product.limitMin ?? 0) },
      ]}
      actions={<ButtonLink to={routes.client.offers()}>Рассчитать</ButtonLink>}
    >
      <Note icon="shield">{product.requirement}</Note>
    </ProductCard>
  );
}

function SoonProduct({ product }: { product: Product }) {
  return (
    <section className={styles.soon} aria-label={`${product.name} — скоро`}>
      <div className={styles.soonHead}>
        <h2 className={`title-3 ${styles.soonTitle}`}>{product.name}</h2>
        <Badge icon="clock">Скоро</Badge>
      </div>
      <p className="body">{product.purpose}</p>
    </section>
  );
}
