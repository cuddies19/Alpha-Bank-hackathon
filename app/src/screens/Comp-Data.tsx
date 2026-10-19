// Данные: таблицы, оценка, проверки — перенесено из макета «Кредитный кабинет — макет» (Comp-Data.dc.html)
import { Badge, Button, Chip, Icon } from '../ui';

export default function CompData() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1440px',
        minHeight: '2200px',
        padding: '56px 64px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 className="title-1">Новые компоненты · данные</h1>
        <p className="body" style={{ color: 'var(--ink-secondary)', maxWidth: '760px' }}>
          Компонентов нет в бандле системы — нарисованы на её токенах и в её стиле: белые карточки на сером, графитовый
          текст, без красного. Классы с префиксом kn- лежат в kk-new.css.
        </p>
      </div>
      <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
        <div className="kn-sechead">
          <h2 className="title-3">Таблица с сортировкой, фильтрами и пагинацией</h2>
          <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Мои заявки · Очередь заявок · Журнал аудита
          </span>
        </div>
        <div className="kn-toolbar">
          <button type="button" className="kn-select">
            Продукт: <span>все</span>
          </button>{' '}
          <button type="button" className="kn-select">
            Класс риска: <span>A–E</span>
          </button>{' '}
          <Chip selected={true}>Мои заявки</Chip> <Chip>Повторная подача</Chip>
        </div>
        <div className="kn-tablewrap" style={{ boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          <table className="kn-table">
            <thead>
              <tr>
                <th scope="col">
                  <button type="button" className="kn-sort">
                    Заявка
                  </button>
                </th>
                <th scope="col">Компания</th>
                <th scope="col" className="num">
                  <button type="button" className="kn-sort is-on">
                    Сумма
                    <Icon name="arrow-down" size={14} />
                  </button>
                </th>
                <th scope="col">Этап</th>
                <th scope="col">SLA</th>
              </tr>
            </thead>
            <tbody>
              <tr className="is-new">
                <td className="nw body-strong">2026-10-0145</td>
                <td>ИП Кузнецов Д. А.</td>
                <td className="num">700 000 ₽</td>
                <td>Новая</td>
                <td>
                  <span className="kn-sla">
                    <Icon name="clock" size={14} />2 ч
                  </span>
                </td>
              </tr>
              <tr>
                <td className="nw body-strong">2026-10-0142</td>
                <td>ООО «Дом и уют»</td>
                <td className="num">3 000 000 ₽</td>
                <td>Ручное рассмотрение</td>
                <td>
                  <span className="kn-sla">
                    <Icon name="clock" size={14} />1 ч 20 мин
                  </span>
                </td>
              </tr>
              <tr className="is-muted">
                <td className="nw body-strong">2026-10-0139</td>
                <td>ИП Белова А. С.</td>
                <td className="num">500 000 ₽</td>
                <td>Решение принято</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
          <div className="kn-pager">
            <span>Показаны 1–3 из 30</span>
            <div className="kn-pager__btns">
              <button type="button" className="kn-pager__btn" disabled aria-label="Назад">
                ‹
              </button>
              <button type="button" className="kn-pager__btn is-on">
                1
              </button>
              <button type="button" className="kn-pager__btn">
                2
              </button>
              <button type="button" className="kn-pager__btn" aria-label="Вперёд">
                ›
              </button>
            </div>
          </div>
        </div>
        <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
          Строка новой заявки подсвечена info-soft, завершённые — вторичным текстом. На узком экране таблица
          прокручивается в своей рамке.
        </p>
      </section>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px', alignItems: 'start' }}
      >
        <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Таблица графика платежей</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Решение · Мои кредиты
            </span>
          </div>
          <table className="kn-table kn-table--dense kn-table--plain">
            <thead>
              <tr>
                <th scope="col">№</th>
                <th scope="col">Дата</th>
                <th scope="col" className="num">
                  Платёж
                </th>
                <th scope="col" className="num">
                  Долг
                </th>
                <th scope="col" className="num">
                  Остаток
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td className="nw">15 ноября 2026</td>
                <td className="num">157 200 ₽</td>
                <td className="num">114 200 ₽</td>
                <td className="num">2 285 800 ₽</td>
              </tr>
              <tr>
                <td>2</td>
                <td className="nw">15 декабря 2026</td>
                <td className="num">157 200 ₽</td>
                <td className="num">116 246 ₽</td>
                <td className="num">2 169 554 ₽</td>
              </tr>
              <tr>
                <td>3</td>
                <td className="nw">15 января 2027</td>
                <td className="num">157 200 ₽</td>
                <td className="num">118 329 ₽</td>
                <td className="num">2 051 225 ₽</td>
              </tr>
            </tbody>
          </table>
          <Button variant="ghost" iconRight="chevron-right" style={{ alignSelf: 'flex-start' }}>
            Показать весь график
          </Button>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Вкладки</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Карточка заявки в банке
            </span>
          </div>
          <div className="kn-tabs">
            <button type="button" className="kn-tab is-active">
              Сводка
            </button>{' '}
            <button type="button" className="kn-tab">
              Клиент
            </button>{' '}
            <button type="button" className="kn-tab">
              Внешние проверки<span className="kn-tab__dot" aria-label="есть замечания"></span>
            </button>{' '}
            <button type="button" className="kn-tab">
              Оценка риска
            </button>
          </div>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Активная вкладка — подчёркивание цветом ink, не красным: красный остаётся за главным действием. Точка
            warning — во вкладке есть замечание.
          </p>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Факторы оценки</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Скоринг в консоли · «Почему такое решение»
            </span>
          </div>
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
              <span>Высокая сезонность</span>
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
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Знак и сторона от нуля дублируют цвет. У клиента — те же факторы словами, без чисел.
          </p>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Шкала балла 0–1000</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Скоринг в консоли
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span className="amount-lg amt">640</span>
            <Badge tone="info" icon={false}>
              Класс B · умеренный
            </Badge>
          </div>
          <div className="kn-score" role="img" aria-label="Балл 640 из 1000, класс B">
            <div className="kn-score__track">
              <span className="kn-score__seg"></span>
              <span className="kn-score__seg"></span>
              <span className="kn-score__seg"></span>
              <span className="kn-score__seg is-on"></span>
              <span className="kn-score__seg"></span> <span className="kn-score__marker" style={{ left: '64%' }}></span>
            </div>
            <div className="kn-score__labels">
              <span>E</span>
              <span>D</span>
              <span>C</span>
              <span className="is-on">B</span>
              <span>A</span>
            </div>
          </div>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Сегменты классов риска E–A, текущий класс залит ink, маркер — точный балл.
          </p>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '12px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Строка проверки источника</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Внешние проверки
            </span>
          </div>
          <details className="kn-src">
            <summary>
              <span className="kn-ok">
                <Icon name="check-circle" size={24} />
              </span>
              <span className="kn-src__name">
                <span className="body-strong">ЕГРЮЛ / ЕГРИП</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Компания действует
                </span>
              </span>
              <span className="kn-src__time">0,8 с</span>
              <Badge tone="success">Ок</Badge>
              <span className="kn-src__chev">
                <Icon name="chevron-right" />
              </span>
            </summary>
            <div className="kn-src__body">
              <p className="body">Статус «Действующее», руководитель совпадает с заявкой.</p>
            </div>
          </details>
          <details className="kn-src is-warn">
            <summary>
              <span className="kn-warn">
                <Icon name="alert" size={24} />
              </span>
              <span className="kn-src__name">
                <span className="body-strong">Выписка по счёту</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Высокая сезонность
                </span>
              </span>
              <span className="kn-src__time">0,4 с</span>
              <Badge tone="warning">Внимание</Badge>
              <span className="kn-src__chev">
                <Icon name="chevron-right" />
              </span>
            </summary>
            <div className="kn-src__body">
              <p className="body">Пик поступлений в 2,2 раза выше спада.</p>
            </div>
          </details>
          <details className="kn-src is-fail">
            <summary>
              <span className="kn-bad">
                <Icon name="x-circle" size={24} />
              </span>
              <span className="kn-src__name">
                <span className="body-strong">Бюро кредитных историй</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Не ответило за 10 с, 3 попытки
                </span>
              </span>
              <span className="kn-src__time">—</span>
              <Badge tone="danger">Не ответило</Badge>
              <span className="kn-src__chev">
                <Icon name="chevron-right" />
              </span>
            </summary>
            <div className="kn-src__body">
              <Button variant="secondary" size="sm">
                Запросить повторно
              </Button>
            </div>
          </details>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Таймер SLA и прогресс</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Очередь · карточка заявки · Мои кредиты
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span className="kn-sla">
              <Icon name="clock" size={14} />
              осталось 1 ч 20 мин
            </span>{' '}
            <span className="kn-sla is-warn">
              <Icon name="clock" size={14} />
              осталось 45 мин
            </span>{' '}
            <span className="kn-sla is-late">
              <Icon name="alert" size={14} />
              просрочено на 12 мин
            </span>
          </div>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Жёлтый — меньше часа до нарушения, красный — просрочено. Время всегда словами и цифрами.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="label" style={{ color: 'var(--ink-secondary)' }}>
              Погашено 6 из 18 платежей
            </span>
            <div
              className="kn-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={18}
              aria-valuenow={6}
              aria-label="Погашено 6 из 18"
            >
              <span style={{ width: '33%' }}></span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
