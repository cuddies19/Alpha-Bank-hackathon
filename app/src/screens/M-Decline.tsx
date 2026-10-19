// B9d · Отказ · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Decline.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Icon, ProductCard } from '../ui';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';

function useScreen(): ScreenValues {
  const n = ' ';
  return {
    params: [
      { label: 'Срок', value: '12' + n + 'мес.' },
      { label: 'Ставка', value: 'от' + n + '23%' },
    ],
  };
}

export default function MDecline() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop
        mode="flow"
        title="Решение по заявке"
        sub="ИП Фомин С. В. · № 2026-10-0140"
        back="/m-login"
        unread="1"
      />
      <div className="kn-mobile__body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Badge tone="danger">Отказ</Badge>
          <h1 className="title-1">Сейчас банк не может выдать кредит</h1>
        </div>
        <section className="kk-card kk-card--sm" style={{ gap: '10px', padding: '20px 16px' }}>
          <span className="label" style={{ color: 'var(--ink-secondary)' }}>
            Причина
          </span>
          <p className="body-lg">В кредитной истории есть просрочка больше 60 дней за последний год.</p>
          <details className="kn-disc" style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <summary>
              <span className="body-strong">Почему такое решение</span>
              <span className="kn-disc__chev">
                <Icon name="chevron-right" />
              </span>
            </summary>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px' }}>
              <li className="body" style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--danger)' }}>
                  <Icon name="x-circle" />
                </span>
                Просрочка 74 дня, погашена в марте 2026
              </li>
              <li className="body" style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--success)' }}>
                  <Icon name="check-circle" />
                </span>
                Обороты по счёту стабильные
              </li>
              <li className="body" style={{ display: 'flex', gap: '10px' }}>
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
          purpose="Небольшой лимит под регулярные поступления"
          amountLabel="Лимит до"
          amount="300 000 ₽"
          params={v.params}
        />
        <section className="kk-card kk-card--sm" style={{ gap: '12px', padding: '20px 16px' }}>
          <h3 className="title-3">Что улучшить за 3 месяца</h3>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li className="body" style={{ display: 'flex', gap: '10px' }}>
              <span className="kn-avatar" style={{ width: '28px', height: '28px', flex: 'none' }}>
                1
              </span>
              <span>Попросите прежнего кредитора обновить данные в бюро</span>
            </li>
            <li className="body" style={{ display: 'flex', gap: '10px' }}>
              <span className="kn-avatar" style={{ width: '28px', height: '28px', flex: 'none' }}>
                2
              </span>
              <span>Платите по всем кредитам без опозданий 3 месяца</span>
            </li>
            <li className="body" style={{ display: 'flex', gap: '10px' }}>
              <span className="kn-avatar" style={{ width: '28px', height: '28px', flex: 'none' }}>
                3
              </span>
              <span>Проводите выручку через счёт в банке</span>
            </li>
          </ol>
          <p
            className="body"
            style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--surface-muted)' }}
          >
            Подать заявку снова можно после <b>25 января</b>.
          </p>
        </section>
      </div>
      <div className="kn-mbar">
        <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/b4-catalog">
          Посмотреть альтернативу
        </Link>{' '}
        <Link className="kk-btn kk-btn--secondary kk-btn--full" to="/m-assistant">
          Поговорить с ассистентом
        </Link>
      </div>
    </div>
  );
}
