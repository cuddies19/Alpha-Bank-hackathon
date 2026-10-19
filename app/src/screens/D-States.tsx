// D · Системные состояния — перенесено из макета «Кредитный кабинет — макет» (D-States.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Button, Icon } from '../ui';

export default function DStates() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1440px',
        minHeight: '1900px',
        padding: '56px 64px',
        background: 'var(--surface-muted)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 className="title-1">Системные состояния</h1>
        <p className="body" style={{ color: 'var(--ink-secondary)' }}>
          Одинаковы для кабинета клиента и консоли банка. Ошибка всегда говорит, что случилось и что делать.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
            Скелетоны загрузки: карточки и таблица
          </p>
          <div
            aria-busy="true"
            style={{
              boxSizing: 'border-box',
              height: '380px',
              borderRadius: '16px',
              background: 'var(--bg)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <span className="kn-skel" style={{ width: '50%', height: '28px', background: 'var(--line)' }}></span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
              <div className="kk-card kk-card--sm" style={{ gap: '10px' }}>
                <span className="kn-skel" style={{ width: '60%', height: '12px' }}></span>
                <span className="kn-skel" style={{ width: '90%', height: '22px' }}></span>
              </div>
              <div className="kk-card kk-card--sm" style={{ gap: '10px' }}>
                <span className="kn-skel" style={{ width: '60%', height: '12px' }}></span>
                <span className="kn-skel" style={{ width: '90%', height: '22px' }}></span>
              </div>
              <div className="kk-card kk-card--sm" style={{ gap: '10px' }}>
                <span className="kn-skel" style={{ width: '60%', height: '12px' }}></span>
                <span className="kn-skel" style={{ width: '90%', height: '22px' }}></span>
              </div>
            </div>
            <div className="kk-card kk-card--sm" style={{ gap: '14px', flex: '1' }}>
              <span className="kn-skel" style={{ width: '100%', height: '12px' }}></span>
              <span className="kn-skel" style={{ width: '100%', height: '12px' }}></span>
              <span className="kn-skel" style={{ width: '100%', height: '12px' }}></span>
              <span className="kn-skel" style={{ width: '70%', height: '12px' }}></span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
            Пустое состояние
          </p>
          <div
            style={{
              boxSizing: 'border-box',
              height: '380px',
              borderRadius: '16px',
              background: 'var(--bg)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
              padding: '24px',
              display: 'flex',
            }}
          >
            <section className="kk-card kk-card--md" style={{ flex: '1', justifyContent: 'center' }}>
              <div className="kn-empty">
                <span className="kn-empty__ic">
                  <Icon name="document" size={24} />
                </span>
                <h2 className="title-3">Заявок пока нет</h2>
                <p className="body">Опишите задачу — подберём продукт и посчитаем платёж до подачи заявки.</p>
                <Button variant="primary">Подобрать финансирование</Button>
              </div>
            </section>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
            Ошибка сети
          </p>
          <div
            style={{
              boxSizing: 'border-box',
              height: '380px',
              borderRadius: '16px',
              background: 'var(--bg)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <Alert tone="danger" title="Нет связи с сервером">
              <p>Проверим ещё раз через 10 секунд. Данные, которые вы ввели, сохранены.</p>
              <div style={{ marginTop: '8px' }}>
                <Button variant="secondary" size="sm">
                  Повторить
                </Button>
              </div>
            </Alert>
            <div className="kk-card kk-card--md" style={{ gap: '12px', flex: '1', opacity: '.55' }} aria-hidden="true">
              <span className="kn-skel" style={{ width: '40%', height: '18px', animation: 'none' }}></span>{' '}
              <span className="kn-skel" style={{ width: '100%', height: '12px', animation: 'none' }}></span>{' '}
              <span className="kn-skel" style={{ width: '80%', height: '12px', animation: 'none' }}></span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
            Сессия истекла
          </p>
          <div
            style={{
              boxSizing: 'border-box',
              position: 'relative',
              height: '380px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'var(--bg)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
            }}
          >
            <div className="kn-scrim kn-scrim--abs">
              <div className="kn-modal" role="dialog" aria-labelledby="ds-session" style={{ width: '420px' }}>
                <h2 className="title-3" id="ds-session">
                  Сессия истекла
                </h2>
                <p className="body">Войдите снова — черновик заявки сохранён, продолжите с того же шага.</p>
                <div className="kn-modal__actions">
                  <Link className="kk-btn kk-btn--primary" to="/">
                    Войти
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
            Страница не найдена · 404
          </p>
          <div
            style={{
              boxSizing: 'border-box',
              height: '380px',
              borderRadius: '16px',
              background: 'var(--bg)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="kn-empty">
              <span className="amount-xl amt" style={{ color: 'var(--ink-secondary)' }}>
                404
              </span>
              <h2 className="title-3">Такой страницы нет</h2>
              <p className="body">Возможно, ссылка устарела. Заявки и документы — в разделах кабинета.</p>
              <Link className="kk-btn kk-btn--secondary" to="/b1-home">
                На главную
              </Link>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
            Нет прав: клиент открыл ссылку консоли
          </p>
          <div
            style={{
              boxSizing: 'border-box',
              height: '380px',
              borderRadius: '16px',
              background: 'var(--bg)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="kn-empty">
              <span className="kn-empty__ic">
                <Icon name="shield" size={24} />
              </span>
              <h2 className="title-3">Этот раздел — для сотрудников банка</h2>
              <p className="body">Вы вошли как клиент ООО «Дом и уют». Ваши заявки и решения — в кабинете.</p>
              <Link className="kk-btn kk-btn--secondary" to="/b7-applications">
                Вернуться в кабинет
              </Link>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
            Тост смены статуса
          </p>
          <div
            style={{
              boxSizing: 'border-box',
              position: 'relative',
              height: '300px',
              borderRadius: '16px',
              background: 'var(--bg)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '12px',
            }}
          >
            <div className="kn-toast" role="status">
              <span className="kn-toast__ic">
                <Icon name="check-circle" />
              </span>
              <div className="kn-toast__body">
                <b>Решение готово</b>
                <span>Заявка № 2026-10-0142 · 11:32</span>
                <Link to="/b9b-counter">Посмотреть решение</Link>
              </div>
            </div>
            <div className="kn-toast" role="status">
              <span className="kn-toast__ic" style={{ color: '#f2b544' }}>
                <Icon name="alert" />
              </span>
              <div className="kn-toast__body">
                <b>Банк запросил документы</b>
                <span>Ответьте до 30 октября</span>
                <Link to="/b9c-docs">Загрузить</Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
            Модальное подтверждение
          </p>
          <div
            style={{
              boxSizing: 'border-box',
              position: 'relative',
              height: '300px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'var(--bg)',
              boxShadow: 'inset 0 0 0 1px var(--line)',
            }}
          >
            <div className="kn-scrim kn-scrim--abs">
              <div className="kn-modal" role="dialog" aria-labelledby="ds-confirm" style={{ width: '440px' }}>
                <h2 className="title-3" id="ds-confirm">
                  Отозвать заявку?
                </h2>
                <p className="body">
                  Банк перестанет её рассматривать. Данные компании подставим снова в новой заявке.
                </p>
                <div className="kn-modal__actions">
                  <Button variant="secondary">Оставить</Button> <Button variant="primary">Отозвать</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
