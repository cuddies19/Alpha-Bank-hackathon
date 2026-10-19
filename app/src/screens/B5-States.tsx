// B5 · Состояния — перенесено из макета «Кредитный кабинет — макет» (B5-States.dc.html)
import { Alert, Button, DocumentUpload, Icon, TextField } from '../ui';

export default function B5States() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1200px',
        minHeight: '760px',
        padding: '40px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '32px 24px',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Ошибка поля
        </p>
        <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
          <TextField
            label="ИНН компании"
            defaultValue="77012345"
            error="У ООО в ИНН 10 цифр — здесь 8"
            inputMode="numeric"
          />{' '}
          <TextField
            label="Сумма"
            format="money"
            defaultValue="200 000"
            error="Минимальная сумма кредитной линии — 500 000 ₽"
          />
        </section>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Не все обязательные документы
        </p>
        <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
          <Alert tone="warning" title="Загрузите бухгалтерскую отчётность за 2025 год">
            Это обязательный документ для ООО: по нему банк видит выручку и долги компании целиком.
          </Alert>{' '}
          <DocumentUpload hint="PDF, JPG или PNG до 20 МБ" />
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}
          >
            <span className="body-sm" style={{ color: 'var(--warning)' }}>
              Не хватает 1 обязательного документа
            </span>{' '}
            <Button variant="primary" disabled={true}>
              Продолжить
            </Button>
          </div>
        </section>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Черновик сохраняется
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px 24px',
            background: 'var(--surface)',
            borderRadius: '16px',
          }}
        >
          <span
            className="kk-spinner"
            aria-hidden="true"
            style={{ width: '16px', height: '16px', color: 'var(--ink-secondary)' }}
          ></span>{' '}
          <span className="body-sm" role="status" style={{ flex: '1', color: 'var(--ink-secondary)' }}>
            Сохраняем черновик
          </span>{' '}
          <Button variant="secondary">Назад</Button> <Button variant="primary">Продолжить</Button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px 24px',
            background: 'var(--surface)',
            borderRadius: '16px',
          }}
        >
          <span style={{ color: 'var(--warning)' }}>
            <Icon name="alert" />
          </span>{' '}
          <span className="body-sm" style={{ flex: '1', color: 'var(--ink-secondary)' }}>
            Нет связи — черновик сохранится, когда соединение вернётся
          </span>{' '}
          <Button variant="secondary">Назад</Button> <Button variant="primary">Продолжить</Button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Отправка
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px 24px',
            background: 'var(--surface)',
            borderRadius: '16px',
          }}
        >
          <span className="body-sm" style={{ flex: '1', color: 'var(--ink-secondary)' }}>
            Не закрывайте страницу — это займёт несколько секунд
          </span>{' '}
          <Button variant="secondary" disabled={true}>
            Назад
          </Button>{' '}
          <Button variant="primary" loading={true}>
            Отправляем
          </Button>
        </div>
        <Alert tone="danger" title="Не удалось отправить заявку">
          Проверьте соединение и отправьте ещё раз — данные сохранены.
        </Alert>
      </div>
    </div>
  );
}
