// C7 · Продукты и правила — перенесено из макета «Кредитный кабинет — макет» (C7-Rules.dc.html)
import { Alert, Badge } from '../ui';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

export default function C7Rules() {
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="rules" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <div className="kn-page" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="title-1">Продукты и правила</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              Только для чтения · версия правил 1.0 от 18 октября
            </p>
          </div>
          <Alert tone="info" title="Значения — допущения команды">
            Пороги и условия требуют согласования с кредитным комитетом банка.
          </Alert>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="title-3">Каталог продуктов</h2>
            <div className="kn-tablewrap">
              <table className="kn-table">
                <thead>
                  <tr>
                    <th scope="col">Продукт</th>
                    <th scope="col">Задача</th>
                    <th scope="col" className="num">
                      Лимит
                    </th>
                    <th scope="col">Срок</th>
                    <th scope="col" className="num">
                      Ставка от
                    </th>
                    <th scope="col">Требования</th>
                    <th scope="col">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="body-strong">Овердрафт</td>
                    <td>Кассовый разрыв</td>
                    <td className="num">100 000 – 5 000 000 ₽</td>
                    <td>12 мес.</td>
                    <td className="num">23%</td>
                    <td>Счёт в банке от 3 месяцев</td>
                    <td>
                      <Badge tone="success">Активен</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="body-strong">Кредитная линия</td>
                    <td>Регулярные закупки, оборот</td>
                    <td className="num">500 000 – 30 000 000 ₽</td>
                    <td>до 36 мес.</td>
                    <td className="num">21,5%</td>
                    <td>Бизнес от 12 месяцев</td>
                    <td>
                      <Badge tone="success">Активен</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="body-strong">Кредит на любые цели</td>
                    <td>Разовая крупная трата</td>
                    <td className="num">300 000 – 50 000 000 ₽</td>
                    <td>12–60 мес.</td>
                    <td className="num">22,9%</td>
                    <td>Бизнес от 12 месяцев</td>
                    <td>
                      <Badge tone="success">Активен</Badge>
                    </td>
                  </tr>
                  <tr className="is-muted">
                    <td className="body-strong">Банковская гарантия</td>
                    <td>Тендер, контракт</td>
                    <td className="num">—</td>
                    <td>—</td>
                    <td className="num">—</td>
                    <td>—</td>
                    <td>
                      <Badge tone="neutral" icon="clock">
                        Скоро
                      </Badge>
                    </td>
                  </tr>
                  <tr className="is-muted">
                    <td className="body-strong">Лизинг</td>
                    <td>Оборудование, транспорт</td>
                    <td className="num">—</td>
                    <td>—</td>
                    <td className="num">—</td>
                    <td>—</td>
                    <td>
                      <Badge tone="neutral" icon="clock">
                        Скоро
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="title-3">Кредитные правила</h2>
            <div className="kn-tablewrap">
              <table className="kn-table">
                <thead>
                  <tr>
                    <th scope="col">Правило</th>
                    <th scope="col">Порог</th>
                    <th scope="col">Тип</th>
                    <th scope="col">Если не пройдено</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Доля платежа в чистом потоке</td>
                    <td className="body-strong">не выше 30%</td>
                    <td>Подбор условий</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>Встречное предложение с меньшей суммой</td>
                  </tr>
                  <tr>
                    <td>Минимальный класс риска</td>
                    <td className="body-strong">C</td>
                    <td>Стоп-правило</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>Отказ</td>
                  </tr>
                  <tr>
                    <td>Возраст бизнеса</td>
                    <td className="body-strong">от 12 месяцев</td>
                    <td>Стоп-правило</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>Отказ, альтернатива — овердрафт</td>
                  </tr>
                  <tr>
                    <td>Просрочка в кредитной истории</td>
                    <td className="body-strong">не больше 60 дней за 12 мес.</td>
                    <td>Стоп-правило</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>Отказ с планом улучшения</td>
                  </tr>
                  <tr>
                    <td>Налоговая задолженность</td>
                    <td className="body-strong">нет</td>
                    <td>Стоп-правило</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>Отказ</td>
                  </tr>
                  <tr>
                    <td>Комплект документов</td>
                    <td className="body-strong">полный для формы бизнеса</td>
                    <td>Проверка полноты</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>Дозапрос у клиента</td>
                  </tr>
                  <tr>
                    <td>Автоматическое решение</td>
                    <td className="body-strong">класс A–B, все правила пройдены, сумма до 1 000 000 ₽</td>
                    <td>Маршрутизация</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>Ручное рассмотрение</td>
                  </tr>
                  <tr>
                    <td>Источник не ответил</td>
                    <td className="body-strong">3 попытки по 10 с</td>
                    <td>Отказоустойчивость</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>Ручное рассмотрение с меткой</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
