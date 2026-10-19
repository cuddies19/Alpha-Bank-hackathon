// C2 · Карточка: Оценка риска — перенесено из макета «Кредитный кабинет — макет» (C2-Risk.dc.html)
import { Alert, Badge } from '../ui';
import C2Head from './C2Head';
import DecisionPanel from './DecisionPanel';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

export default function C2Risk() {
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="queue" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <C2Head tab="risk" />
        <div className="kn-page" style={{ paddingTop: '24px' }}>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
                <div className="kn-sechead">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="caption" style={{ color: 'var(--ink-secondary)' }}>
                      Часть 1
                    </span>
                    <h2 className="title-3">Скоринг</h2>
                  </div>
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    Модель scorecard v1.2 · 24 октября, 11:05
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span className="amount-xl amt">640</span>
                    <span className="body" style={{ color: 'var(--ink-secondary)' }}>
                      из 1000
                    </span>
                  </div>
                  <Badge tone="info" icon={false}>
                    Класс B · умеренный риск
                  </Badge>{' '}
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    PD на 12 мес. — 4,8%
                  </span>
                </div>
                <div className="kn-score" role="img" aria-label="Балл 640 из 1000, класс риска B">
                  <div className="kn-score__track">
                    <span className="kn-score__seg"></span>
                    <span className="kn-score__seg"></span>
                    <span className="kn-score__seg"></span>
                    <span className="kn-score__seg is-on"></span>
                    <span className="kn-score__seg"></span>{' '}
                    <span className="kn-score__marker" style={{ left: '64%' }}></span>
                  </div>
                  <div className="kn-score__labels">
                    <span>E</span>
                    <span>D</span>
                    <span>C</span>
                    <span className="is-on">B</span>
                    <span>A</span>
                  </div>
                  <div className="kn-score__ends" style={{ position: 'relative', height: '16px' }}>
                    <span style={{ position: 'absolute', left: '0' }}>0</span>
                    <span style={{ position: 'absolute', left: '40%', transform: 'translateX(-50%)' }}>400</span>
                    <span style={{ position: 'absolute', left: '55%', transform: 'translateX(-50%)' }}>550</span>
                    <span style={{ position: 'absolute', left: '63%', transform: 'translateX(-50%)' }}>630</span>
                    <span style={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)' }}>750</span>
                    <span style={{ position: 'absolute', right: '0' }}>1000</span>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  <h3 className="body-strong">Факторы и их вклад в балл</h3>
                  <div className="kn-factors">
                    <div className="kn-factor">
                      <span>Стабильный оборот 12 месяцев</span>
                      <span className="kn-factor__bar">
                        <span className="kn-factor__neg"></span>
                        <span className="kn-factor__pos">
                          <span style={{ width: '96%' }}></span>
                        </span>
                      </span>
                      <span className="kn-factor__val is-pos">+48</span>
                    </div>
                    <div className="kn-factor">
                      <span>Нет просрочек</span>
                      <span className="kn-factor__bar">
                        <span className="kn-factor__neg"></span>
                        <span className="kn-factor__pos">
                          <span style={{ width: '70%' }}></span>
                        </span>
                      </span>
                      <span className="kn-factor__val is-pos">+35</span>
                    </div>
                    <div className="kn-factor">
                      <span>Долговая нагрузка 32% потока</span>
                      <span className="kn-factor__bar">
                        <span className="kn-factor__neg">
                          <span style={{ width: '82%' }}></span>
                        </span>
                        <span className="kn-factor__pos"></span>
                      </span>
                      <span className="kn-factor__val is-neg">−41</span>
                    </div>
                    <div className="kn-factor">
                      <span>Возраст бизнеса 2 года</span>
                      <span className="kn-factor__bar">
                        <span className="kn-factor__neg">
                          <span style={{ width: '24%' }}></span>
                        </span>
                        <span className="kn-factor__pos"></span>
                      </span>
                      <span className="kn-factor__val is-neg">−12</span>
                    </div>
                    <div className="kn-factor">
                      <span>Высокая сезонность выручки</span>
                      <span className="kn-factor__bar">
                        <span className="kn-factor__neg">
                          <span style={{ width: '18%' }}></span>
                        </span>
                        <span className="kn-factor__pos"></span>
                      </span>
                      <span className="kn-factor__val is-neg">−9</span>
                    </div>
                    <div className="kn-factors__axis">
                      <span></span>
                      <span>
                        <span>−50</span>
                        <span>0</span>
                        <span>+50</span>
                      </span>
                      <span></span>
                    </div>
                  </div>
                </div>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Балл — оценка вероятности дефолта. Он не принимает решение, а входит в правила продукта как один из
                  порогов.
                </p>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="caption" style={{ color: 'var(--ink-secondary)' }}>
                    Часть 2
                  </span>
                  <h2 className="title-3">Кредитные правила продукта «Кредитная линия»</h2>
                </div>
                <div className="kn-tablewrap" style={{ borderRadius: '0' }}>
                  <table className="kn-table kn-table--plain">
                    <thead>
                      <tr>
                        <th scope="col">Правило</th>
                        <th scope="col">Значение</th>
                        <th scope="col">Порог</th>
                        <th scope="col">Результат</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Сумма в лимите продукта</td>
                        <td className="nw">3 000 000 ₽</td>
                        <td className="nw">500 000 – 30 000 000 ₽</td>
                        <td>
                          <Badge tone="success">Да</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Возраст бизнеса</td>
                        <td>28 месяцев</td>
                        <td>от 12 месяцев</td>
                        <td>
                          <Badge tone="success">Да</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Нет налоговой задолженности</td>
                        <td>Нет долга</td>
                        <td>Нет долга</td>
                        <td>
                          <Badge tone="success">Да</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Класс риска</td>
                        <td>B</td>
                        <td>не ниже C</td>
                        <td>
                          <Badge tone="success">Да</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Доля платежа в потоке</td>
                        <td>
                          <b>32%</b>
                        </td>
                        <td>не выше 30%</td>
                        <td>
                          <Badge tone="danger">Нет</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Alert tone="warning" title="Итог правил: встречное предложение">
                  Подобрана сумма, при которой платёж 26% потока: 2 400 000 ₽ на 18 мес. Остальные правила пройдены.
                </Alert>
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
