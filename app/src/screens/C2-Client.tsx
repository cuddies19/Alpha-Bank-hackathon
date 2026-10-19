// C2 · Карточка: Клиент — перенесено из макета «Кредитный кабинет — макет» (C2-Client.dc.html)
import { Icon } from '../ui';
import type { ScreenValues } from '../lib/screen';
import C2Head from './C2Head';
import DecisionPanel from './DecisionPanel';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

function useScreen(): ScreenValues {
  const inc = [3.9, 4.1, 2.2, 2.0, 2.3, 2.5, 2.4, 2.1, 1.9, 2.5, 3.45, 3.86];
  const out = [3.2, 3.5, 1.7, 1.5, 1.7, 1.9, 1.75, 1.55, 1.45, 1.85, 2.8, 3.15];
  const labels = ['ноя', 'дек', 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт'];
  const max = 4.5;
  return {
    months: labels.map((label, i) => ({
      label,
      inc: ((inc[i] / max) * 100).toFixed(1) + '%',
      out: ((out[i] / max) * 100).toFixed(1) + '%',
    })),
  };
}

export default function C2Client() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="queue" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <C2Head tab="client" />
        <div className="kn-page" style={{ paddingTop: '24px' }}>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <h2 className="title-3">Компания</h2>
                <dl className="kn-kv">
                  <div>
                    <dt>Название</dt>
                    <dd>ООО «Дом и уют»</dd>
                  </div>
                  <div>
                    <dt>ИНН / ОГРН</dt>
                    <dd>7701234567 / 1247700412345</dd>
                  </div>
                  <div>
                    <dt>Регистрация</dt>
                    <dd>12 июня 2024</dd>
                  </div>
                  <div>
                    <dt>Возраст бизнеса</dt>
                    <dd>2 года 4 месяца</dd>
                  </div>
                  <div>
                    <dt>ОКВЭД</dt>
                    <dd>47.91 — торговля через интернет</dd>
                  </div>
                  <div>
                    <dt>Сотрудники</dt>
                    <dd>6, среднесписочная численность</dd>
                  </div>
                  <div>
                    <dt>Каналы продаж</dt>
                    <dd>2 маркетплейса</dd>
                  </div>
                  <div>
                    <dt>Счёт в банке</dt>
                    <dd>•• 4821, с июля 2024</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <h2 className="title-3">Руководитель</h2>
                <dl className="kn-kv">
                  <div>
                    <dt>ФИО</dt>
                    <dd>Соколов Игорь Андреевич</dd>
                  </div>
                  <div>
                    <dt>Должность</dt>
                    <dd>Генеральный директор, 100% долей</dd>
                  </div>
                  <div>
                    <dt>Паспорт</dt>
                    <dd className="amt">45 •• ••••12</dd>
                  </div>
                  <div>
                    <dt>Дата рождения</dt>
                    <dd>•• •• 1989</dd>
                  </div>
                </dl>
                <p className="body-sm" style={{ display: 'flex', gap: '8px', color: 'var(--ink-secondary)' }}>
                  <Icon name="shield" size={16} />
                  Персональные данные скрыты. Полный просмотр записывается в журнал аудита.
                </p>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Обороты по счёту за 12 месяцев</h2>
                  <div className="kn-legend">
                    <span>
                      <i style={{ background: 'var(--ink)' }}></i>Поступления
                    </span>
                    <span>
                      <i style={{ background: 'var(--line-strong)' }}></i>Списания
                    </span>
                  </div>
                </div>
                <div
                  role="img"
                  aria-label="Поступления по месяцам с ноября 2025 по октябрь 2026: пики в ноябре и декабре, спад летом, рост к октябрю"
                >
                  <div
                    style={{
                      height: '160px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '8px',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    {v.months.map((mo, i) => (
                      <div
                        key={i}
                        style={{ flex: '1', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '2px' }}
                      >
                        <span
                          style={{ flex: '1', borderRadius: '3px 3px 0 0', background: 'var(--ink)', height: mo.inc }}
                        ></span>{' '}
                        <span
                          style={{
                            flex: '1',
                            borderRadius: '3px 3px 0 0',
                            background: 'var(--line-strong)',
                            height: mo.out,
                          }}
                        ></span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="caption"
                    style={{ display: 'flex', gap: '8px', paddingTop: '6px', color: 'var(--ink-secondary)' }}
                  >
                    {v.months.map((mo, i) => (
                      <span key={i} style={{ flex: '1', textAlign: 'center' }}>
                        {mo.label}
                      </span>
                    ))}
                  </div>
                </div>
                <dl className="kn-kv">
                  <div>
                    <dt>Поступления за 12 мес.</dt>
                    <dd className="amt">33 210 000 ₽</dd>
                  </div>
                  <div>
                    <dt>Средний чистый поток</dt>
                    <dd className="amt">610 000 ₽ в месяц</dd>
                  </div>
                  <div>
                    <dt>Сезонность</dt>
                    <dd style={{ color: 'var(--warning)' }}>Высокая: пик в 2,2 раза выше спада</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Действующие обязательства</h2>
                <div className="kn-tablewrap" style={{ borderRadius: '0' }}>
                  <table className="kn-table kn-table--plain">
                    <thead>
                      <tr>
                        <th scope="col">Кредитор</th>
                        <th scope="col">Вид</th>
                        <th scope="col" className="num">
                          Остаток
                        </th>
                        <th scope="col" className="num">
                          Платёж в месяц
                        </th>
                        <th scope="col">До</th>
                        <th scope="col">Источник</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Другой банк</td>
                        <td>Кредит на развитие</td>
                        <td className="num">450 000 ₽</td>
                        <td className="num">38 000 ₽</td>
                        <td className="nw">март 2027</td>
                        <td>БКИ, выписка</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
