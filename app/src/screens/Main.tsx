// A1 · Вход и выбор роли — перенесено из макета «Кредитный кабинет — макет» (Main.dc.html)
import { Link } from 'react-router-dom';
import { Badge, Icon, TextField } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const role = s.role || 'client';
  const all = [
    {
      id: 'igor',
      role: 'client',
      init: 'ИС',
      name: 'Игорь Соколов',
      org: 'ООО «Дом и уют»',
      outcome: 'Встречное предложение',
      tone: 'warning',
      login: 'igor.sokolov',
      to: '/b1-home',
    },
    {
      id: 'anna',
      role: 'client',
      init: 'АБ',
      name: 'Анна Белова',
      org: 'ИП Белова А. С.',
      outcome: 'Автоодобрение',
      tone: 'success',
      login: 'anna.belova',
      to: '/b9a-approved',
    },
    {
      id: 'marina',
      role: 'client',
      init: 'МО',
      name: 'Марина Орлова',
      org: 'ООО «Лён и Дуб»',
      outcome: 'Запросят документы',
      tone: 'info',
      login: 'marina.orlova',
      to: '/b9c-docs',
    },
    {
      id: 'sergey',
      role: 'client',
      init: 'СФ',
      name: 'Сергей Фомин',
      org: 'ИП Фомин С. В.',
      outcome: 'Отказ с альтернативой',
      tone: 'danger',
      login: 'sergey.fomin',
      to: '/b9d-decline',
    },
    {
      id: 'olga',
      role: 'bank',
      init: 'ОК',
      name: 'Ольга Кравцова',
      org: 'Кредитный аналитик',
      outcome: 'Консоль банка',
      tone: 'neutral',
      login: 'olga.kravtsova',
      to: '/c1-queue',
    },
  ];
  const list = all.filter((p) => p.role === role);
  const uid = list.some((p) => p.id === s.user) ? s.user : list[0].id;
  const cur = all.find((p) => p.id === uid)!;
  return {
    people: list.map((p) => ({
      ...p,
      cls: 'kn-persona' + (p.id === uid ? ' is-on' : ''),
      pressed: p.id === uid ? 'true' : 'false',
      pick: () => setState({ user: p.id }),
    })),
    login: cur.login,
    pass: 'demo-2026',
    target: cur.to,
    clientCls: 'kn-seg__opt' + (role === 'client' ? ' is-on' : ''),
    clientOn: role === 'client' ? 'true' : 'false',
    bankCls: 'kn-seg__opt' + (role === 'bank' ? ' is-on' : ''),
    bankOn: role === 'bank' ? 'true' : 'false',
    toClient: () => setState({ role: 'client', user: 'igor' }),
    toBank: () => setState({ role: 'bank', user: 'olga' }),
    noop: () => {},
  };
}

export default function Main() {
  const v = useScreen();
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <section
        style={{
          flex: '1 1 520px',
          boxSizing: 'border-box',
          padding: '64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '16px',
          minWidth: '0',
        }}
      >
        <h1 className="display" style={{ maxWidth: '560px' }}>
          Кредитный кабинет
        </h1>
        <p className="body-lg" style={{ maxWidth: '480px', color: 'var(--ink-secondary)' }}>
          Финансирование для малого бизнеса: от задачи своими словами до денег на счёте — в одном кабинете.
        </p>
      </section>
      <section
        style={{
          flex: '1 1 560px',
          boxSizing: 'border-box',
          padding: '48px 64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '0',
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: '520px',
            background: 'var(--surface)',
            borderRadius: '24px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <h2 className="title-2">Вход</h2>
          <div className="kn-seg" role="group" aria-label="Кто входит">
            <button type="button" className={v.clientCls} aria-pressed={v.clientOn} onClick={v.toClient}>
              Клиент
            </button>{' '}
            <button type="button" className={v.bankCls} aria-pressed={v.bankOn} onClick={v.toBank}>
              Сотрудник банка
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p className="label" style={{ color: 'var(--ink-secondary)' }}>
              Тестовые пользователи — нажмите, чтобы подставить логин и пароль
            </p>
            {v.people.map((p, i) => (
              <button key={i} type="button" className={p.cls} aria-pressed={p.pressed} onClick={p.pick}>
                <span className="kn-avatar">{p.init}</span>{' '}
                <span className="kn-persona__text">
                  <span className="body-strong">{p.name}</span>{' '}
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {p.org}
                  </span>
                </span>{' '}
                <Badge tone={p.tone} icon={false}>
                  {p.outcome}
                </Badge>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField label="Логин" value={v.login} onChange={v.noop} autoComplete="username" />{' '}
            <TextField
              label="Пароль"
              type="password"
              value={v.pass}
              onChange={v.noop}
              autoComplete="current-password"
            />
          </div>
          <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to={v.target}>
            Войти
          </Link>
          <p
            className="body-sm"
            style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink-secondary)' }}
          >
            <Icon name="info" size={16} style={{ marginTop: '1px' }} /> Все данные синтетические. Демонстрационная
            версия
          </p>
        </div>
      </section>
    </div>
  );
}
