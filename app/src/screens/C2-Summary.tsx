// C2 · Карточка: Сводка — перенесено из макета «Кредитный кабинет — макет» (C2-Summary.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Icon } from '../ui';
import C2Head from './C2Head';
import DecisionPanel from './DecisionPanel';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

export default function C2Summary() {
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="queue" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <C2Head tab="summary" />
        <div className="kn-page" style={{ paddingTop: '24px' }}>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Рекомендация системы</h2>
                  <Badge tone="warning">Встречное предложение</Badge>
                </div>
                <p className="body-lg">
                  <span className="amt">2 400 000 ₽</span> на 18 мес. — доля платежа 32% выше порога 30%.
                </p>
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}
                >
                  <Link
                    to="/c2-risk"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'var(--surface-muted)',
                      textDecoration: 'none',
                      color: 'var(--ink)',
                    }}
                  >
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Скоринг
                    </span>
                    <span className="body-strong">640 из 1000 · класс B</span>
                  </Link>{' '}
                  <Link
                    to="/c2-risk"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'var(--surface-muted)',
                      textDecoration: 'none',
                      color: 'var(--ink)',
                    }}
                  >
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Правила продукта
                    </span>
                    <span className="body-strong">4 из 5 пройдены</span>
                  </Link>{' '}
                  <Link
                    to="/c2-checks"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'var(--surface-muted)',
                      textDecoration: 'none',
                      color: 'var(--ink)',
                    }}
                  >
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Источники
                    </span>
                    <span className="body-strong">3 ок · 1 внимание</span>
                  </Link>
                </div>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Скоринг и правила — подсказка. Решение принимает аналитик.
                </p>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <h2 className="title-3">Параметры заявки</h2>
                <dl className="kn-kv">
                  <div>
                    <dt>Продукт</dt>
                    <dd>Кредитная линия</dd>
                  </div>
                  <div>
                    <dt>Сумма</dt>
                    <dd className="amt">3 000 000 ₽</dd>
                  </div>
                  <div>
                    <dt>Срок</dt>
                    <dd>18 мес.</dd>
                  </div>
                  <div>
                    <dt>Ставка</dt>
                    <dd>21,5%</dd>
                  </div>
                  <div>
                    <dt>Платёж</dt>
                    <dd className="amt">196 500 ₽</dd>
                  </div>
                  <div>
                    <dt>Деньги нужны</dt>
                    <dd>до 1 ноября</dd>
                  </div>
                  <div>
                    <dt>Источник возврата</dt>
                    <dd>Выручка с маркетплейсов</dd>
                  </div>
                  <div>
                    <dt>Залог</dt>
                    <dd>Нет</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Цель словами клиента</h2>
                  <span className="kn-tag kn-tag--ai">
                    <Icon name="sparkle" size={14} />
                    Из диалога с ассистентом
                  </span>
                </div>
                <blockquote className="body-lg">
                  «Нужно закупить партию к распродаже 11.11, а выплата от маркетплейса только через две недели»
                </blockquote>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Закупка к распродаже · 5 закупок партиями за год · выручка волнами раз в 2 недели
                </p>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '8px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Проверки в источниках</h2>
                  <Link className="kk-btn kk-btn--link" to="/c2-checks">
                    Подробнее
                  </Link>
                </div>
                <dl className="kn-rows">
                  <div>
                    <dt style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--ink)' }}>
                      <span className="kn-ok">
                        <Icon name="check-circle" />
                      </span>
                      ЕГРЮЛ / ЕГРИП
                    </dt>
                    <dd style={{ fontWeight: '400' }}>Действующее, руководитель совпадает · 0,8 с</dd>
                  </div>
                  <div>
                    <dt style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--ink)' }}>
                      <span className="kn-ok">
                        <Icon name="check-circle" />
                      </span>
                      ФНС «Прозрачный бизнес»
                    </dt>
                    <dd style={{ fontWeight: '400' }}>Задолженности нет · 1,2 с</dd>
                  </div>
                  <div>
                    <dt style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--ink)' }}>
                      <span className="kn-ok">
                        <Icon name="check-circle" />
                      </span>
                      Бюро кредитных историй
                    </dt>
                    <dd style={{ fontWeight: '400' }}>Просрочек нет за 24 мес. · 1,4 с</dd>
                  </div>
                  <div>
                    <dt style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--ink)' }}>
                      <span className="kn-warn">
                        <Icon name="alert" />
                      </span>
                      Выписка по счёту
                    </dt>
                    <dd style={{ fontWeight: '400' }}>Сезонность высокая · 0,4 с</dd>
                  </div>
                </dl>
              </section>
            </div>
            <aside className="kn-cols__side" style={{ flex: '0 1 384px' }}>
              <DecisionPanel outcome="counter" />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
