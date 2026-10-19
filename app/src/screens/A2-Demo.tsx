// A2 · Панель проверки — перенесено из макета «Кредитный кабинет — макет» (A2-Demo.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Button, Icon } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import B1Home from './B1-Home';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const down = s.down || {};
  const seg = (on) => 'kn-seg__opt' + (on ? ' is-on' : '');
  const speed = s.speed || 'normal';
  const ai = s.ai || 'model';
  const names = [
    ['egrul', 'ЕГРЮЛ / ЕГРИП'],
    ['fns', 'ФНС «Прозрачный бизнес»'],
    ['bki', 'Бюро кредитных историй'],
    ['acc', 'Выписка по счёту'],
  ];
  return {
    people: [
      { init: 'ИС', name: 'Игорь Соколов', note: 'Начало сценария 1: встречное предложение', to: '/b1-home' },
      { init: 'ИС', name: 'Игорь — после решения банка', note: 'Тост «Решение готово»', to: '/b8-ready' },
      { init: 'АБ', name: 'Анна Белова', note: 'Автоматическое одобрение', to: '/b9a-approved' },
      { init: 'МО', name: 'Марина Орлова', note: 'Банк запросил документы', to: '/b9c-docs' },
      { init: 'СФ', name: 'Сергей Фомин', note: 'Отказ с альтернативой', to: '/b9d-decline' },
      { init: 'ОК', name: 'Ольга Кравцова', note: 'Кредитный аналитик', to: '/c1-queue' },
    ],
    speedNormal: seg(speed === 'normal'),
    speedFast: seg(speed === 'fast'),
    setNormal: () => setState({ speed: 'normal' }),
    setFast: () => setState({ speed: 'fast' }),
    sources: names.map(([k, name]) => ({
      name,
      okCls: seg(!down[k]),
      downCls: seg(!!down[k]),
      setOk: () => setState({ down: { ...down, [k]: false } }),
      setDown: () => setState({ down: { ...down, [k]: true } }),
    })),
    anyDown: names.some(([k]) => down[k]),
    aiModel: seg(ai === 'model'),
    aiRules: seg(ai === 'rules'),
    setModel: () => setState({ ai: 'model' }),
    setRules: () => setState({ ai: 'rules' }),
    confirm: !!s.confirm,
    notConfirm: !s.confirm,
    askReset: () => setState({ confirm: true }),
    cancelReset: () => setState({ confirm: false }),
  };
}

export default function A2Demo() {
  const v = useScreen();
  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div aria-hidden="true">
        <B1Home />
      </div>
      <div className="kn-scrim kn-scrim--abs" style={{ zIndex: '40' }}></div>
      <aside
        className="kn-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
        style={{ width: '460px' }}
      >
        <div className="kn-drawer__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="shield" size={24} />
            <h2 className="title-3" id="demo-title">
              Режим проверки
            </h2>
          </div>
          <Link className="kn-ibtn" to="/b1-home" aria-label="Закрыть режим проверки">
            <Icon name="x" />
          </Link>
        </div>
        <div className="kn-drawer__body">
          <div
            className="kn-demo-tag"
            style={{
              alignSelf: 'stretch',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              lineHeight: '18px',
            }}
          >
            Инструмент проверки. В рабочем продукте его нет
          </div>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="label" style={{ color: 'var(--ink-secondary)' }}>
              Войти как
            </h3>
            {v.people.map((p, i) => (
              <Link
                key={i}
                to={p.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  boxShadow: 'inset 0 0 0 1px var(--line)',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                }}
              >
                <span className="kn-avatar" style={{ width: '36px', height: '36px' }}>
                  {p.init}
                </span>{' '}
                <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                  <span className="body-strong">{p.name}</span>
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {p.note}
                  </span>
                </span>{' '}
                <Icon name="chevron-right" />
              </Link>
            ))}
          </section>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="label" style={{ color: 'var(--ink-secondary)' }}>
              Скорость конвейера
            </h3>
            <div className="kn-seg" role="group" aria-label="Скорость конвейера">
              <button type="button" className={v.speedNormal} onClick={v.setNormal}>
                Обычная
              </button>{' '}
              <button type="button" className={v.speedFast} onClick={v.setFast}>
                Быстрая · этапы по 3 с
              </button>
            </div>
          </section>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 className="label" style={{ color: 'var(--ink-secondary)' }}>
              Внешние источники
            </h3>
            {v.sources.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 210px',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                <span className="body">{s.name}</span>
                <div className="kn-seg" role="group" aria-label={s.name}>
                  <button type="button" className={s.okCls} onClick={s.setOk}>
                    Работает
                  </button>{' '}
                  <button type="button" className={s.downCls} onClick={s.setDown}>
                    Не отвечает
                  </button>
                </div>
              </div>
            ))}
            {v.anyDown ? (
              <>
                <Alert tone="info" title="Сценарий 5: сбой источника">
                  <p>Новая заявка не упадёт: её передадут специалисту с меткой «Источник недоступен».</p>
                  <div style={{ marginTop: '8px' }}>
                    <Link className="kk-btn kk-btn--secondary kk-btn--sm" to="/c5-integrations">
                      Открыть внешние источники
                    </Link>
                  </div>
                </Alert>
              </>
            ) : null}
          </section>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="label" style={{ color: 'var(--ink-secondary)' }}>
              Ассистент
            </h3>
            <div className="kn-seg" role="group" aria-label="Режим ассистента">
              <button type="button" className={v.aiModel} onClick={v.setModel}>
                Языковая модель
              </button>{' '}
              <button type="button" className={v.aiRules} onClick={v.setRules}>
                Упрощённый, на правилах
              </button>
            </div>
          </section>
          <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="label" style={{ color: 'var(--ink-secondary)' }}>
              Демо-данные
            </h3>
            {v.notConfirm ? (
              <>
                <Button variant="secondary" onClick={v.askReset} style={{ alignSelf: 'flex-start' }}>
                  Сбросить демо-данные
                </Button>
              </>
            ) : null}
            {v.confirm ? (
              <>
                <Alert tone="warning" title="Сбросить все заявки и решения?">
                  <p>Сценарии начнутся заново. Тестовые учётки останутся.</p>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" size="sm" onClick={v.cancelReset}>
                      Отмена
                    </Button>{' '}
                    <Link className="kk-btn kk-btn--primary kk-btn--sm" to="/">
                      Сбросить
                    </Link>
                  </div>
                </Alert>
              </>
            ) : null}
          </section>
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
            }}
          >
            <h3 className="label" style={{ color: 'var(--ink-secondary)' }}>
              Для разработчиков
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <a className="kk-btn kk-btn--link" href="#">
                Swagger API
              </a>{' '}
              <a className="kk-btn kk-btn--link" href="#">
                README
              </a>{' '}
              <a className="kk-btn kk-btn--link" href="#">
                Диаграмма состояний
              </a>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
