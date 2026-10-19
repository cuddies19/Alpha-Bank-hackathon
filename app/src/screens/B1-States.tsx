// B1 · Состояния — перенесено из макета «Кредитный кабинет — макет» (B1-States.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon, StatusTracker } from '../ui';
import type { ScreenValues } from '../lib/screen';

function useScreen(): ScreenValues {
  return {
    stages: [
      { title: 'Оцениваем заявку', status: 'done', time: '11:05' },
      {
        title: 'Рассматривает специалист',
        status: 'current',
        time: 'обычно до 1 часа',
        description: 'Специалист проверит, комфортен ли платёж для бизнеса.',
      },
      { title: 'Решение', status: 'pending' },
    ],
  };
}

export default function B1States() {
  const v = useScreen();
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1440px',
        minHeight: '680px',
        padding: '40px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Загрузка: скелетон
        </p>
        <div
          aria-busy="true"
          aria-label="Загружаем данные по счёту"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <span className="kn-skel" style={{ width: '70%', height: '40px', background: 'var(--line)' }}></span>{' '}
          <span className="kn-skel" style={{ width: '50%', height: '16px', background: 'var(--line)' }}></span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            <div className="kk-card kk-card--md" style={{ gap: '12px' }}>
              <span className="kn-skel" style={{ width: '60%', height: '14px' }}></span>
              <span className="kn-skel" style={{ width: '80%', height: '28px' }}></span>
            </div>
            <div className="kk-card kk-card--md" style={{ gap: '12px' }}>
              <span className="kn-skel" style={{ width: '60%', height: '14px' }}></span>
              <span className="kn-skel" style={{ width: '80%', height: '28px' }}></span>
            </div>
            <div className="kk-card kk-card--md" style={{ gap: '12px' }}>
              <span className="kn-skel" style={{ width: '60%', height: '14px' }}></span>
              <span className="kn-skel" style={{ width: '80%', height: '28px' }}></span>
            </div>
            <div className="kk-card kk-card--md" style={{ gap: '12px' }}>
              <span className="kn-skel" style={{ width: '60%', height: '14px' }}></span>
              <span className="kn-skel" style={{ width: '80%', height: '28px' }}></span>
            </div>
          </div>
          <div className="kk-card kk-card--md" style={{ gap: '16px' }}>
            <span className="kn-skel" style={{ width: '45%', height: '20px' }}></span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px' }}>
              <span className="kn-skel" style={{ width: '22px', height: '60%' }}></span>
              <span className="kn-skel" style={{ width: '22px', height: '50%' }}></span>
              <span className="kn-skel" style={{ width: '22px', height: '45%' }}></span>
              <span className="kn-skel" style={{ width: '22px', height: '65%' }}></span>
              <span className="kn-skel" style={{ width: '22px', height: '85%' }}></span>
              <span className="kn-skel" style={{ width: '22px', height: '95%' }}></span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Нет данных по счёту
        </p>
        <section className="kk-card kk-card--md">
          <div className="kn-empty" style={{ padding: '32px 8px' }}>
            <span className="kn-empty__ic">
              <Icon name="document" size={24} />
            </span>
            <h2 className="title-3">Нет данных по счёту</h2>
            <p className="body">
              Подключите выписку — покажем остаток и поступления и заранее подскажем, если возможен кассовый разрыв.
            </p>
            <Button variant="primary" iconLeft="upload">
              Подключить выписку
            </Button>
            <p className="body-sm">Подбор финансирования работает и без выписки — по данным, которые вы укажете.</p>
          </div>
        </section>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Есть активная заявка
        </p>
        <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Активная заявка</h2>
            <Badge tone="info">Рассматривает специалист</Badge>
          </div>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            Кредитная линия ·{' '}
            <span className="amt" style={{ color: 'var(--ink)', fontWeight: '600' }}>
              3 000 000 ₽
            </span>{' '}
            · № 2026-10-0142
          </p>
          <StatusTracker stages={v.stages} />{' '}
          <Link className="kk-btn kk-btn--secondary" to="/b8-status" style={{ alignSelf: 'flex-start' }}>
            Открыть заявку
          </Link>
        </section>
      </div>
    </div>
  );
}
