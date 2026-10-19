// B15 · Профиль компании и согласия — перенесено из макета «Кредитный кабинет — макет» (B15-Profile.dc.html)
import { Badge, Button } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const on = s.on || { docs: true, pay: true, tips: true, news: false };
  const list = [
    ['docs', 'Запросы документов'],
    ['pay', 'Напоминания о платежах'],
    ['tips', 'Советы ассистента о денежном потоке'],
    ['news', 'Новые продукты банка'],
  ];
  return {
    prefs: list.map(([k, label]) => ({ label, on: !!on[k], toggle: () => setState({ on: { ...on, [k]: !on[k] } }) })),
  };
}

export default function B15Profile() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="none" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page" style={{ gap: '24px' }}>
          <h1 className="title-1">Профиль компании</h1>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">Реквизиты</h2>
                  <Badge tone="neutral" icon="document">
                    Из ЕГРЮЛ
                  </Badge>
                </div>
                <dl className="kn-kv">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <dt>Полное название</dt>
                    <dd>Общество с ограниченной ответственностью «Дом и уют»</dd>
                  </div>
                  <div>
                    <dt>ИНН</dt>
                    <dd>7701234567</dd>
                  </div>
                  <div>
                    <dt>ОГРН</dt>
                    <dd>1247700412345</dd>
                  </div>
                  <div>
                    <dt>Дата регистрации</dt>
                    <dd>12 июня 2024</dd>
                  </div>
                  <div>
                    <dt>ОКВЭД</dt>
                    <dd>47.91</dd>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <dt>Юридический адрес</dt>
                    <dd>г. Москва, ул. Образцовая, д. 7, офис 12</dd>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <dt>Руководитель</dt>
                    <dd>Соколов Игорь Андреевич, генеральный директор</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Согласия</h2>
                <div className="kn-tablewrap" style={{ borderRadius: '0' }}>
                  <table className="kn-table kn-table--plain">
                    <thead>
                      <tr>
                        <th scope="col">Согласие</th>
                        <th scope="col">Дано</th>
                        <th scope="col">Действует до</th>
                        <th scope="col">
                          <span className="kk-sr">Действие</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Запрос в бюро кредитных историй</td>
                        <td className="nw">24 октября, 10:50</td>
                        <td className="nw">24 апреля 2027</td>
                        <td style={{ textAlign: 'right' }}>
                          <Button variant="ghost" size="sm">
                            Отозвать
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td>Обработка персональных данных</td>
                        <td className="nw">24 октября, 10:44</td>
                        <td className="nw">бессрочно</td>
                        <td style={{ textAlign: 'right' }}>
                          <Button variant="ghost" size="sm">
                            Отозвать
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td>Анализ операций по счёту</td>
                        <td className="nw">24 октября, 10:44</td>
                        <td className="nw">бессрочно</td>
                        <td style={{ textAlign: 'right' }}>
                          <Button variant="ghost" size="sm">
                            Отозвать
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Без согласий банк не сможет рассматривать новые заявки. Отзыв не влияет на уже выданные кредиты.
                </p>
              </section>
            </div>
            <aside className="kn-cols__side">
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Контакты</h2>
                <dl className="kn-rows">
                  <div>
                    <dt>Контактное лицо</dt>
                    <dd>Игорь Соколов</dd>
                  </div>
                  <div>
                    <dt>Телефон</dt>
                    <dd>+7 900 000-00-00</dd>
                  </div>
                </dl>
                <Button variant="secondary" size="sm">
                  Изменить
                </Button>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Подключённые счета</h2>
                <dl className="kn-rows">
                  <div>
                    <dt>Расчётный счёт •• 4821</dt>
                    <dd style={{ color: 'var(--success)' }}>Основной</dd>
                  </div>
                  <div>
                    <dt>Счёт в другом банке</dt>
                    <dd style={{ fontWeight: '400', color: 'var(--ink-secondary)' }}>выписка от 24 октября</dd>
                  </div>
                </dl>
              </section>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Уведомления в кабинете</h2>
                {v.prefs.map((p, i) => (
                  <label key={i} className="kn-consent__row" style={{ padding: '4px 0' }}>
                    <input type="checkbox" className="kn-check" checked={p.on} onChange={p.toggle} />{' '}
                    <span>{p.label}</span>
                  </label>
                ))}
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Решения по заявкам приходят всегда — их отключить нельзя.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
