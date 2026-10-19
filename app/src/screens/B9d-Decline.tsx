// B9d · Отказ — перенесено из макета «Кредитный кабинет — макет» (B9d-Decline.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Icon, ProductCard } from '../ui';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const n = ' ';
  return {
    altParams: [
      { label: 'Срок', value: '12' + n + 'мес.' },
      { label: 'Ставка', value: 'от' + n + '23%' },
      { label: 'Залог', value: 'Не нужен' },
    ],
  };
}

export default function B9dDecline() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main">
        <HeaderClient company="ИП Фомин С. В." person="Сергей Фомин" initials="СФ" unread="1" />
        <div className="kn-page kn-page--narrow" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Badge tone="danger">Отказ</Badge>{' '}
              <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                Заявка № 2026-10-0140 · кредит на любые цели <span className="amt">1 500 000 ₽</span>
              </span>
            </div>
            <h1 className="display">Сейчас банк не может выдать кредит</h1>
          </div>
          <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
            <span className="label" style={{ color: 'var(--ink-secondary)' }}>
              Причина
            </span>
            <p className="body-lg">В кредитной истории есть просрочка больше 60 дней за последний год.</p>
            <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              По правилам банка такая просрочка не позволяет выдать кредит, даже если обороты по счёту хорошие.
            </p>
            <details className="kn-disc" style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <summary>
                <span className="body-strong">Почему такое решение</span>
                <span className="kn-disc__chev">
                  <Icon name="chevron-right" />
                </span>
              </summary>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px' }}>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--danger)' }}>
                    <Icon name="x-circle" />
                  </span>
                  Просрочка 74 дня по кредиту в другом банке, погашена в марте 2026
                </li>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--success)' }}>
                    <Icon name="check-circle" />
                  </span>
                  Обороты по счёту стабильные
                </li>
                <li className="body" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--success)' }}>
                    <Icon name="check-circle" />
                  </span>
                  Налоговой задолженности нет
                </li>
              </ul>
            </details>
          </section>
          <h2 className="title-2">Что можно сделать</h2>
          <ProductCard
            name="Овердрафт"
            purpose="Небольшой лимит под регулярные поступления по счёту"
            amountLabel="Лимит до"
            amount="300 000 ₽"
            params={v.altParams}
            preliminary={false}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p className="kk-product__note body-sm">
                <Icon name="info" size={16} />
                Банк может рассмотреть такой лимит: он гасится из ежедневной выручки. Предварительная оценка, решение
                принимает банк.
              </p>
              <div className="kk-product__actions">
                <Link className="kk-btn kk-btn--primary" to="/b4-catalog">
                  Посмотреть альтернативу
                </Link>
              </div>
            </div>
          </ProductCard>
          <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
            <h3 className="title-3">Что улучшить за 3 месяца</h3>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li className="body" style={{ display: 'flex', gap: '12px' }}>
                <span className="kn-avatar" style={{ width: '28px', height: '28px' }}>
                  1
                </span>
                <span>
                  Попросите прежнего кредитора отправить в бюро данные о погашении — обновление занимает до 10 дней
                </span>
              </li>
              <li className="body" style={{ display: 'flex', gap: '12px' }}>
                <span className="kn-avatar" style={{ width: '28px', height: '28px' }}>
                  2
                </span>
                <span>Платите по всем кредитам и картам без опозданий 3 месяца подряд</span>
              </li>
              <li className="body" style={{ display: 'flex', gap: '12px' }}>
                <span className="kn-avatar" style={{ width: '28px', height: '28px' }}>
                  3
                </span>
                <span>Проводите выручку шиномонтажа через счёт — так банк увидит стабильные обороты</span>
              </li>
            </ol>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'var(--surface-muted)',
              }}
            >
              <span style={{ color: 'var(--ink-secondary)' }}>
                <Icon name="calendar" />
              </span>
              <p className="body">
                Подать заявку снова можно после <b>25 января</b>.
              </p>
            </div>
            <Link className="kk-btn kk-btn--secondary" to="/b2-dialog" style={{ alignSelf: 'flex-start' }}>
              <span className="kn-mark" style={{ width: '24px', height: '24px' }}>
                <Icon name="sparkle" size={14} />
              </span>
              Поговорить с ассистентом
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
