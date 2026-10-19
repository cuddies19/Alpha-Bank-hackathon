// B2 · Подбор в диалоге с ассистентом — перенесено из макета «Кредитный кабинет — макет» (B2-Dialog.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Chip, Icon, TextField } from '../ui';
import AssistantPanel from './AssistantPanel';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

export default function B2Dialog() {
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="financing" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="title-1">Для чего нужны деньги?</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              Ассистент уточнил задачу. Проверьте, всё ли верно, — любое поле можно поправить.
            </p>
          </div>
          <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
            <span className="kn-tag kn-tag--ai">
              <Icon name="sparkle" size={14} />
              Ваша задача из диалога
            </span>
            <blockquote className="body-lg">
              «Нужно закупить партию к распродаже 11.11, а выплата от маркетплейса только через две недели»
            </blockquote>
          </section>
          <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
            <div className="kn-sechead">
              <h2 className="title-3">Что поняли о задаче</h2>
              <Badge tone="success">Всё для подбора есть</Badge>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                gap: '16px 20px',
              }}
            >
              <TextField label="Цель" defaultValue="Закупка партии к распродаже 11.11" prefilled={true} />{' '}
              <TextField label="Сумма" format="money" defaultValue="3 000 000" prefilled={true} />{' '}
              <TextField label="Когда нужны деньги" defaultValue="До 1 ноября" prefilled={true} />{' '}
              <TextField
                label="На какой срок"
                suffix="мес."
                defaultValue="18"
                prefilled={true}
                hint="Подобрано по циклу закупок: 5 партий в год"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="kk-field__top">
                <span className="label">Из чего планируете вернуть</span>{' '}
                <span className="kk-field__tag caption">
                  <Icon name="sparkle" size={14} />
                  Заполнено ассистентом
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Chip selected={true}>Выручка с маркетплейсов</Chip> <Chip>Оплата по контракту</Chip>{' '}
                <Chip>Текущая выручка</Chip>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="label">Есть ли залог</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Chip>Да</Chip> <Chip selected={true}>Нет</Chip>
              </div>
            </div>
          </section>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <Link className="kk-btn kk-btn--primary kk-btn--lg" to="/b3-offers">
              Показать варианты
            </Link>{' '}
            <Link className="kk-btn kk-btn--ghost" to="/b2-need">
              Начать заново
            </Link>
          </div>
        </div>
      </main>
      <aside className="kn-app__assist">
        <AssistantPanel mode="dialog" screen="Подбор финансирования" />
      </aside>
    </div>
  );
}
