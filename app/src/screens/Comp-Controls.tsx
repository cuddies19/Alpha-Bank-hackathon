// Ввод и всплывающие элементы — перенесено из макета «Кредитный кабинет — макет» (Comp-Controls.dc.html)
import { Link } from 'react-router-dom';
import { Button, Icon } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const n = ' ';
  const amount = s.amount ?? 2400000;
  const seg = s.seg || 'client';
  const c1 = s.c1 ?? true,
    c2 = !!s.c2;
  return {
    amount,
    amountFull: String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, n) + n + '₽',
    pct: (((amount - 500000) / 4500000) * 100).toFixed(1) + '%',
    onAmount: (e) => setState({ amount: Number(e.target.value) }),
    segs: [
      ['client', 'Клиент'],
      ['bank', 'Сотрудник банка'],
    ].map(([k, label]) => ({
      label,
      cls: 'kn-seg__opt' + (seg === k ? ' is-on' : ''),
      pressed: seg === k ? 'true' : 'false',
      pick: () => setState({ seg: k }),
    })),
    c1,
    c2,
    t1: () => setState({ c1: !c1 }),
    t2: () => setState({ c2: !c2 }),
  };
}

export default function CompControls() {
  const v = useScreen();
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1440px',
        minHeight: '2100px',
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
        <h1 className="title-1">Новые компоненты · ввод и всплывающие элементы</h1>
        <p className="body" style={{ color: 'var(--ink-secondary)' }}>
          Слайдер, переключатель и чекбоксы на этой странице работают в режиме Play.
        </p>
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px', alignItems: 'start' }}
      >
        <section className="kk-card kk-card--lg" style={{ gap: '20px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Слайдер суммы и срока</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Подбор · калькулятор
            </span>
          </div>
          <div className="kn-slider">
            <div className="kn-slider__head">
              <label className="label" htmlFor="cc-amount">
                Сумма
              </label>
              <span className="amount-md amt">{v.amountFull}</span>
            </div>
            <div className="kn-slider__track">
              <div className="kn-slider__fill" style={{ width: v.pct }}></div>
              <input
                className="kn-slider__input"
                id="cc-amount"
                type="range"
                min="500000"
                max="5000000"
                step="100000"
                value={v.amount}
                onChange={v.onAmount}
                aria-valuetext={v.amountFull}
              />
              <div className="kn-slider__thumb" style={{ left: v.pct }}></div>
            </div>
            <div className="kn-slider__scale">
              <span>500 000 ₽</span>
              <span>5 000 000 ₽</span>
            </div>
          </div>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Нативный range поверх нарисованной дорожки: работает с клавиатуры, фокус — кольцо на бегунке. Рядом всегда
            поле точного ввода.
          </p>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '20px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Сегментированный переключатель</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Исход решения · вход · режим проверки
            </span>
          </div>
          <div className="kn-seg" role="group" aria-label="Пример">
            {v.segs.map((s, i) => (
              <button key={i} type="button" className={s.cls} aria-pressed={s.pressed} onClick={s.pick}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="kn-seg kn-seg--grid" role="group" aria-label="Исход">
            <button type="button" className="kn-seg__opt">
              Одобрить
            </button>{' '}
            <button type="button" className="kn-seg__opt is-on">
              Встречное предложение<span className="kn-seg__tag">Рекомендация системы</span>
            </button>{' '}
            <button type="button" className="kn-seg__opt">
              Запросить данные
            </button>{' '}
            <button type="button" className="kn-seg__opt">
              Отказать
            </button>
          </div>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '12px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Чекбокс согласия с текстом</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Заявка · профиль
            </span>
          </div>
          <div className="kn-consent">
            <label className="kn-consent__row">
              <input type="checkbox" className="kn-check" checked={v.c1} onChange={v.t1} />
              <span>Согласие на обработку персональных данных</span>
            </label>
            <details>
              <summary>
                Текст согласия <Icon name="chevron-right" size={16} />
              </summary>
              <p>
                Разрешаю банку обрабатывать персональные данные руководителя и контактного лица, чтобы рассмотреть
                заявку.
              </p>
            </details>
          </div>
          <div className="kn-consent is-missing">
            <label className="kn-consent__row">
              <input type="checkbox" className="kn-check" checked={v.c2} onChange={v.t2} />
              <span>Согласие на запрос в бюро кредитных историй</span>
            </label>
            <details open>
              <summary>
                Текст согласия <Icon name="chevron-right" size={16} />
              </summary>
              <p>Разрешаю банку запросить кредитную историю компании и руководителя. Действует 6 месяцев.</p>
            </details>
          </div>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Не отмеченное обязательное согласие подсвечивается warning, а не красным.
          </p>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Поле кода подтверждения</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Подписание
            </span>
          </div>
          <div className="kn-otp" role="group" aria-label="Код подтверждения">
            <input inputMode="numeric" maxLength={1} aria-label="Цифра 1 из 6" defaultValue="4" readOnly />{' '}
            <input inputMode="numeric" maxLength={1} aria-label="Цифра 2 из 6" defaultValue="8" readOnly />{' '}
            <input inputMode="numeric" maxLength={1} aria-label="Цифра 3 из 6" defaultValue="2" readOnly />{' '}
            <input
              inputMode="numeric"
              maxLength={1}
              aria-label="Цифра 4 из 6"
              defaultValue=""
              readOnly
              style={{ borderColor: 'var(--ink)', boxShadow: 'var(--focus-ring)' }}
            />{' '}
            <input inputMode="numeric" maxLength={1} aria-label="Цифра 5 из 6" defaultValue="" readOnly />{' '}
            <input inputMode="numeric" maxLength={1} aria-label="Цифра 6 из 6" defaultValue="" readOnly />
          </div>
          <div className="kn-otp" role="group" aria-label="Код с ошибкой">
            <input defaultValue="1" readOnly aria-label="Цифра 1" style={{ borderColor: 'var(--danger)' }} />
            <input defaultValue="1" readOnly aria-label="Цифра 2" style={{ borderColor: 'var(--danger)' }} />
            <input defaultValue="1" readOnly aria-label="Цифра 3" style={{ borderColor: 'var(--danger)' }} />
            <input defaultValue="1" readOnly aria-label="Цифра 4" style={{ borderColor: 'var(--danger)' }} />
            <input defaultValue="1" readOnly aria-label="Цифра 5" style={{ borderColor: 'var(--danger)' }} />
            <input defaultValue="1" readOnly aria-label="Цифра 6" style={{ borderColor: 'var(--danger)' }} />
          </div>
          <p className="body-sm" style={{ display: 'flex', gap: '6px', color: 'var(--danger)' }}>
            <Icon name="alert" size={16} />
            Код не подошёл. Проверьте цифры в плашке — осталось 2 попытки
          </p>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '12px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Тост</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Смена статуса в реальном времени
            </span>
          </div>
          <div className="kn-toast" role="status">
            <span className="kn-toast__ic" style={{ color: '#7fb0ff' }}>
              <Icon name="info" />
            </span>
            <div className="kn-toast__body">
              <b>Заявка перешла к специалисту</b>
              <span>11:05 · обновилось само</span>
            </div>
          </div>
          <div className="kn-toast" role="status">
            <span className="kn-toast__ic">
              <Icon name="check-circle" />
            </span>
            <div className="kn-toast__body">
              <b>Решение готово</b>
              <span>Заявка № 2026-10-0142</span>
              <Link to="/b9b-counter">Посмотреть решение</Link>
            </div>
          </div>
          <div className="kn-toast" role="alert">
            <span className="kn-toast__ic" style={{ color: '#ff6b60' }}>
              <Icon name="x-circle" />
            </span>
            <div className="kn-toast__body">
              <b>Нет связи с сервером</b>
              <span>Проверим ещё раз через 10 секунд</span>
            </div>
          </div>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '12px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Шапка: колокольчик и список уведомлений</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Все экраны клиента
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span className="kn-ibtn" style={{ background: 'var(--surface-muted)' }}>
              <svg
                className="kn-svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 10a6 6 0 0 1 12 0c0 4.5 1.5 6.5 2 7H4c.5-.5 2-2.5 2-7z" />
                <path d="M10 20.2a2.2 2.2 0 0 0 4 0" />
              </svg>
              <span className="kn-ibtn__count">2</span>
            </span>
          </div>
          <div
            className="kn-menu"
            style={{ alignSelf: 'flex-end', boxShadow: 'var(--shadow-lg), inset 0 0 0 1px var(--line)' }}
          >
            <div className="kn-menu__head">
              <span className="body-strong">Уведомления</span>
              <Link className="kk-btn kk-btn--link" to="/b14-notifications">
                Все
              </Link>
            </div>
            <Link className="kn-menu__item" to="/b9b-counter" style={{ background: 'var(--surface-muted)' }}>
              <span className="kn-dot"></span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="body-strong">Решение по заявке № 2026-10-0142 готово</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  11:32
                </span>
              </span>
            </Link>{' '}
            <Link className="kn-menu__item" to="/b9b-counter" style={{ background: 'var(--surface-muted)' }}>
              <span className="kn-dot"></span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="body-strong">Условия действуют до 31 октября</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  11:32
                </span>
              </span>
            </Link>{' '}
            <Link className="kn-menu__item" to="/b8-status">
              <span className="kn-dot" style={{ visibility: 'hidden' }}></span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="body">Заявка перешла к специалисту</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  11:05
                </span>
              </span>
            </Link>{' '}
            <Link className="kn-menu__item" to="/b13-documents">
              <span className="kn-dot" style={{ visibility: 'hidden' }}></span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="body">Договор поставки нужно заменить</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  10:49
                </span>
              </span>
            </Link>{' '}
            <Link className="kn-menu__item" to="/b8-status">
              <span className="kn-dot" style={{ visibility: 'hidden' }}></span>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="body">Заявка отправлена</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  10:51
                </span>
              </span>
            </Link>
          </div>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Скелетон и пустое состояние</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Все списки
            </span>
          </div>
          <div
            aria-busy="true"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: 'inset 0 0 0 1px var(--line)',
            }}
          >
            <span className="kn-skel" style={{ width: '40%', height: '16px' }}></span>{' '}
            <span className="kn-skel" style={{ width: '100%', height: '12px' }}></span>{' '}
            <span className="kn-skel" style={{ width: '85%', height: '12px' }}></span>
          </div>
          <div
            className="kn-empty"
            style={{ padding: '24px', borderRadius: '12px', boxShadow: 'inset 0 0 0 1px var(--line)' }}
          >
            <span className="kn-empty__ic">
              <Icon name="document" size={24} />
            </span>
            <h3 className="title-3">Заявок пока нет</h3>
            <p className="body">Опишите задачу — подберём продукт и посчитаем платёж.</p>
            <Button variant="primary">Подобрать финансирование</Button>
          </div>
        </section>
        <section className="kk-card kk-card--lg" style={{ gap: '12px' }}>
          <div className="kn-sechead">
            <h2 className="title-3">Кнопка «Режим проверки»</h2>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Все экраны, левый нижний угол
            </span>
          </div>
          <Link className="kn-demo" to="/a2-demo">
            <Icon name="shield" />
            Режим проверки
          </Link>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Пунктирная рамка отделяет инструмент жюри от продукта. В рабочей версии кнопки нет.
          </p>
        </section>
      </div>
      <section className="kk-card kk-card--lg" style={{ gap: '16px' }}>
        <div className="kn-sechead">
          <h2 className="title-3">Модальное окно и боковая шторка</h2>
          <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Подтверждение решения · подписание · предпросмотр документа · режим проверки
          </span>
        </div>
        <div
          style={{
            position: 'relative',
            height: '520px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'var(--bg)',
            boxShadow: 'inset 0 0 0 1px var(--line)',
          }}
        >
          <div className="kn-scrim kn-scrim--abs" style={{ justifyContent: 'flex-start', paddingLeft: '64px' }}>
            <div className="kn-modal" role="dialog" aria-labelledby="cc-modal">
              <h3 className="title-3" id="cc-modal">
                Принять решение?
              </h3>
              <p className="body">Клиент увидит решение сразу. Отменить нельзя.</p>
              <div className="kn-modal__actions">
                <Button variant="secondary">Отмена</Button> <Button variant="primary">Принять решение</Button>
              </div>
            </div>
          </div>
          <aside className="kn-drawer" aria-labelledby="cc-drawer" style={{ width: '440px' }}>
            <div className="kn-drawer__head">
              <h3 className="title-3" id="cc-drawer">
                Кредитный договор
              </h3>
              <button type="button" className="kn-ibtn" aria-label="Закрыть">
                <Icon name="x" />
              </button>
            </div>
            <div className="kn-drawer__body">
              <div
                style={{
                  height: '220px',
                  borderRadius: '12px',
                  background: 'var(--surface-muted)',
                  boxShadow: 'inset 0 0 0 1px var(--line)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px',
                }}
              >
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Предпросмотр, страница 1 из 6
                </span>
              </div>
            </div>
            <div className="kn-drawer__foot">
              <Button variant="secondary" iconLeft="arrow-down">
                Скачать PDF
              </Button>
            </div>
          </aside>
        </div>
        <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
          Модальное окно — по центру, радиус 24, затемнение scrim. Шторка выезжает справа на всю высоту; на телефоне —
          снизу во весь экран.
        </p>
      </section>
    </div>
  );
}
