// B8 · Статус · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Status.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Button, Icon, StatusTracker } from '../ui';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';
import NavMobile from './NavMobile';

function useScreen(): ScreenValues {
  return {
    stages: [
      { title: 'Заявка отправлена', status: 'done', time: '10:51' },
      { title: 'Проверяем данные', status: 'done', time: '10:52' },
      { title: 'Запрашиваем сведения', status: 'done', time: '10:58' },
      { title: 'Оцениваем заявку', status: 'done', time: '11:05' },
      {
        title: 'Рассматривает специалист',
        status: 'current',
        time: 'до 1 часа',
        description: 'Специалист проверит, комфортен ли платёж для бизнеса.',
      },
      { title: 'Решение', status: 'pending' },
      { title: 'Подписание', status: 'pending' },
      { title: 'Деньги на счёте', status: 'pending' },
    ],
  };
}

export default function MStatus() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop mode="flow" title="Заявка № 2026-10-0142" sub="Кредитная линия · 3 000 000 ₽" back="/m-home" />
      <div className="kn-mobile__body">
        <div className="kn-toast" role="status" style={{ width: '100%' }}>
          <span className="kn-toast__ic" style={{ color: '#7fb0ff' }}>
            <Icon name="info" />
          </span>
          <div className="kn-toast__body">
            <b>Заявка перешла к специалисту</b>
            <span>11:05 · обновилось само</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Badge tone="info">Рассматривает специалист</Badge>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Подана 24 октября, 10:51
          </p>
        </div>
        <section className="kk-card kk-card--sm" style={{ gap: '16px', padding: '20px 16px' }}>
          <h2 className="title-3">Где заявка</h2>
          <StatusTracker stages={v.stages} />
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '8px', padding: '20px 16px' }}>
          <h2 className="title-3">Параметры</h2>
          <dl className="kn-rows">
            <div>
              <dt>Сумма</dt>
              <dd>3 000 000 ₽</dd>
            </div>
            <div>
              <dt>Срок</dt>
              <dd>18 мес.</dd>
            </div>
            <div>
              <dt>Платёж</dt>
              <dd>≈ 196 500 ₽</dd>
            </div>
          </dl>
        </section>
        <Link className="kn-demo-tag" to="/m-counter" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>
          <Icon name="shield" size={16} />
          Режим проверки: показать готовое решение
        </Link>{' '}
        <Button variant="ghost" fullWidth={true}>
          Отозвать заявку
        </Button>
      </div>
      <NavMobile active="applications" />
    </div>
  );
}
