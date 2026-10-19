// A1 · Состояния входа — перенесено из макета «Кредитный кабинет — макет» (A1-States.dc.html)
import { Alert, Button, TextField } from '../ui';

export default function A1States() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1120px',
        minHeight: '720px',
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
          Ошибка входа
        </p>
        <div
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface)',
            borderRadius: '24px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h2 className="title-2">Вход</h2>
          <Alert tone="danger" title="Неверный логин или пароль">
            Проверьте раскладку клавиатуры и попробуйте снова.
          </Alert>{' '}
          <TextField label="Логин" defaultValue="шпщк.ыщлщдщм" error="Похоже, включена русская раскладка" />{' '}
          <TextField label="Пароль" type="password" defaultValue="demo-2025" />{' '}
          <Button variant="primary" size="lg" fullWidth={true}>
            Войти
          </Button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Загрузка
        </p>
        <div
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface)',
            borderRadius: '24px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h2 className="title-2">Вход</h2>
          <TextField label="Логин" defaultValue="igor.sokolov" disabled={true} />{' '}
          <TextField label="Пароль" type="password" defaultValue="demo-2026" disabled={true} />{' '}
          <Button variant="primary" size="lg" fullWidth={true} loading={true}>
            Входим
          </Button>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Загружаем данные по счёту ООО «Дом и уют»
          </p>
        </div>
      </div>
    </div>
  );
}
