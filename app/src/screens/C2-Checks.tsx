// C2 · Карточка: Внешние проверки — перенесено из макета «Кредитный кабинет — макет» (C2-Checks.dc.html)
import { Alert, Badge, Button, Icon } from '../ui';
import C2Head from './C2Head';
import DecisionPanel from './DecisionPanel';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

export default function C2Checks() {
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="queue" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <C2Head tab="checks" />
        <div className="kn-page" style={{ paddingTop: '24px' }}>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <div className="kn-sechead">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h2 className="title-3">Внешние проверки</h2>
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      4 источника ответили за 3,8 с · 24 октября, 10:58
                    </span>
                  </div>
                  <Button variant="secondary" size="sm">
                    Запросить всё повторно
                  </Button>
                </div>
                <details className="kn-src" open>
                  <summary>
                    <span className="kn-ok">
                      <Icon name="check-circle" size={24} />
                    </span>{' '}
                    <span className="kn-src__name">
                      <span className="body-strong">ЕГРЮЛ / ЕГРИП</span>
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        Компания действует, руководитель совпадает с заявкой
                      </span>
                    </span>{' '}
                    <span className="kn-src__time">0,8 с</span> <Badge tone="success">Ок</Badge>{' '}
                    <span className="kn-src__chev">
                      <Icon name="chevron-right" />
                    </span>
                  </summary>
                  <div className="kn-src__body">
                    <dl className="kn-kv">
                      <div>
                        <dt>Статус</dt>
                        <dd>Действующее</dd>
                      </div>
                      <div>
                        <dt>Зарегистрировано</dt>
                        <dd>12 июня 2024 года</dd>
                      </div>
                      <div>
                        <dt>ОКВЭД</dt>
                        <dd>47.91</dd>
                      </div>
                      <div>
                        <dt>Руководитель</dt>
                        <dd>Соколов И. А.</dd>
                      </div>
                    </dl>
                  </div>
                </details>
                <details className="kn-src" open>
                  <summary>
                    <span className="kn-ok">
                      <Icon name="check-circle" size={24} />
                    </span>{' '}
                    <span className="kn-src__name">
                      <span className="body-strong">ФНС «Прозрачный бизнес»</span>
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        Налоговой задолженности нет
                      </span>
                    </span>{' '}
                    <span className="kn-src__time">1,2 с</span> <Badge tone="success">Ок</Badge>{' '}
                    <span className="kn-src__chev">
                      <Icon name="chevron-right" />
                    </span>
                  </summary>
                  <div className="kn-src__body">
                    <dl className="kn-kv">
                      <div>
                        <dt>Налоговая задолженность</dt>
                        <dd>Нет</dd>
                      </div>
                      <div>
                        <dt>Недостоверный адрес</dt>
                        <dd>Нет</dd>
                      </div>
                      <div>
                        <dt>Доходы за 2025 год</dt>
                        <dd className="amt">44 800 000 ₽</dd>
                      </div>
                      <div>
                        <dt>Среднесписочная численность</dt>
                        <dd>6</dd>
                      </div>
                    </dl>
                  </div>
                </details>
                <details className="kn-src" open>
                  <summary>
                    <span className="kn-ok">
                      <Icon name="check-circle" size={24} />
                    </span>{' '}
                    <span className="kn-src__name">
                      <span className="body-strong">Бюро кредитных историй</span>
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        1 действующий кредит, просрочек нет
                      </span>
                    </span>{' '}
                    <span className="kn-src__time">1,4 с</span> <Badge tone="success">Ок</Badge>{' '}
                    <span className="kn-src__chev">
                      <Icon name="chevron-right" />
                    </span>
                  </summary>
                  <div className="kn-src__body">
                    <dl className="kn-kv">
                      <div>
                        <dt>Действующие кредиты</dt>
                        <dd>1 в другом банке: остаток 450 000 ₽, платёж 38 000 ₽ в месяц</dd>
                      </div>
                      <div>
                        <dt>Просрочки за 24 месяца</dt>
                        <dd>Нет</dd>
                      </div>
                      <div>
                        <dt>Запросы истории за 30 дней</dt>
                        <dd>2</dd>
                      </div>
                      <div>
                        <dt>Согласие клиента</dt>
                        <dd>Подписано 24 октября, 10:50</dd>
                      </div>
                    </dl>
                  </div>
                </details>
                <details className="kn-src is-warn" open>
                  <summary>
                    <span className="kn-warn">
                      <Icon name="alert" size={24} />
                    </span>{' '}
                    <span className="kn-src__name">
                      <span className="body-strong">Выписка по счёту</span>
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        Поток стабильный, но сезонность высокая
                      </span>
                    </span>{' '}
                    <span className="kn-src__time">0,4 с</span> <Badge tone="warning">Внимание</Badge>{' '}
                    <span className="kn-src__chev">
                      <Icon name="chevron-right" />
                    </span>
                  </summary>
                  <div className="kn-src__body">
                    <dl className="kn-kv">
                      <div>
                        <dt>Средний чистый поток</dt>
                        <dd className="amt">610 000 ₽ в месяц</dd>
                      </div>
                      <div>
                        <dt>Сезонность</dt>
                        <dd>Высокая: пик в 2,2 раза выше спада</dd>
                      </div>
                      <div>
                        <dt>Поступления за 12 мес.</dt>
                        <dd className="amt">33 210 000 ₽</dd>
                      </div>
                      <div>
                        <dt>Второй счёт</dt>
                        <dd>Выписка загружена клиентом, принята</dd>
                      </div>
                    </dl>
                    <Alert tone="info" title="Расхождение с ФНС объяснимо">
                      Доходы по ФНС выше поступлений на счёт на 11,6 млн ₽ — часть выручки идёт на второй счёт.
                    </Alert>
                  </div>
                </details>
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
