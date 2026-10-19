// B3 · Состояния — перенесено из макета «Кредитный кабинет — макет» (B3-States.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Button, Icon, TextField } from '../ui';

export default function B3States() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1200px',
        minHeight: '620px',
        padding: '40px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Подходящих продуктов нет
        </p>
        <section className="kk-card kk-card--md">
          <div className="kn-empty" style={{ padding: '24px 8px' }}>
            <span className="kn-empty__ic">
              <Icon name="info" size={24} />
            </span>
            <h2 className="title-3">Под эту задачу продуктов пока нет</h2>
            <p className="body">Для покупки грузовика подходит лизинг — он появится в кабинете скоро.</p>
            <div
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--surface-muted)',
                alignSelf: 'stretch',
                textAlign: 'left',
                gap: '8px',
              }}
            >
              <p className="body-strong">Что можно изменить</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="body" style={{ display: 'flex', gap: '8px' }}>
                  <Icon name="chevron-right" />
                  Выбрать цель «Развитие и оборудование» — подойдёт кредит на любые цели
                </li>
                <li className="body" style={{ display: 'flex', gap: '8px' }}>
                  <Icon name="chevron-right" />
                  Указать срок до 60 месяцев, чтобы платёж был ниже
                </li>
              </ul>
            </div>
            <Link className="kk-btn kk-btn--secondary" to="/b2-need">
              Изменить задачу
            </Link>
          </div>
        </section>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Сумма выше лимитов продукта
        </p>
        <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
          <h2 className="title-3">Калькулятор кредитной линии</h2>
          <TextField
            label="Сумма"
            format="money"
            defaultValue="45 000 000"
            error="Кредитная линия — до 30 000 000 ₽. Уменьшите сумму или выберите другой продукт"
          />{' '}
          <Alert tone="assistant" title="Такая сумма подойдёт для кредита на любые цели">
            <p>
              Его лимит — до 50 000 000 ₽, но деньги выдаются один раз. Закупки партиями удобнее вести из линии на 30
              000 000 ₽.
            </p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm">
                Уменьшить до 30 000 000 ₽
              </Button>{' '}
              <Button variant="ghost" size="sm">
                Показать кредит на любые цели
              </Button>
            </div>
          </Alert>
        </section>
      </div>
    </div>
  );
}
