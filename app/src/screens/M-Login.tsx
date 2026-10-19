// A1 · Вход · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Login.dc.html)
import { Link } from 'react-router-dom';
import { TextField } from '../ui';
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
      outcome: 'ООО «Дом и уют» · встречное предложение',
      login: 'igor.sokolov',
      to: '/m-home',
    },
    {
      id: 'anna',
      role: 'client',
      init: 'АБ',
      name: 'Анна Белова',
      outcome: 'ИП · автоматическое одобрение',
      login: 'anna.belova',
      to: '/m-approved',
    },
    {
      id: 'marina',
      role: 'client',
      init: 'МО',
      name: 'Марина Орлова',
      outcome: 'ООО «Лён и Дуб» · запросят документы',
      login: 'marina.orlova',
      to: '/m-docs',
    },
    {
      id: 'sergey',
      role: 'client',
      init: 'СФ',
      name: 'Сергей Фомин',
      outcome: 'ИП · отказ с альтернативой',
      login: 'sergey.fomin',
      to: '/m-decline',
    },
    {
      id: 'olga',
      role: 'bank',
      init: 'ОК',
      name: 'Ольга Кравцова',
      outcome: 'Кредитный аналитик · консоль только на компьютере',
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
      pick: () => setState({ user: p.id }),
    })),
    login: cur.login,
    target: cur.to,
    clientCls: 'kn-seg__opt' + (role === 'client' ? ' is-on' : ''),
    bankCls: 'kn-seg__opt' + (role === 'bank' ? ' is-on' : ''),
    toClient: () => setState({ role: 'client', user: 'igor' }),
    toBank: () => setState({ role: 'bank', user: 'olga' }),
    noop: () => {},
  };
}

export default function MLogin() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <div className="kn-mobile__body" style={{ paddingTop: '32px', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 className="title-1">Кредитный кабинет</h1>
          <p className="body" style={{ color: 'var(--ink-secondary)' }}>
            Финансирование для малого бизнеса: от задачи своими словами до денег на счёте.
          </p>
        </div>
        <section
          style={{
            boxSizing: 'border-box',
            background: 'var(--surface)',
            borderRadius: '24px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div className="kn-seg" role="group" aria-label="Кто входит">
            <button type="button" className={v.clientCls} onClick={v.toClient}>
              Клиент
            </button>{' '}
            <button type="button" className={v.bankCls} onClick={v.toBank}>
              Сотрудник банка
            </button>
          </div>
          <p className="label" style={{ color: 'var(--ink-secondary)' }}>
            Тестовые пользователи
          </p>
          {v.people.map((p, i) => (
            <button key={i} type="button" className={p.cls} onClick={p.pick} style={{ minHeight: '56px' }}>
              <span className="kn-avatar" style={{ width: '36px', height: '36px' }}>
                {p.init}
              </span>{' '}
              <span className="kn-persona__text">
                <span className="body-strong">{p.name}</span>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  {p.outcome}
                </span>
              </span>
            </button>
          ))}
          <TextField label="Логин" value={v.login} onChange={v.noop} />{' '}
          <TextField label="Пароль" type="password" value="demo-2026" onChange={v.noop} />{' '}
          <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to={v.target}>
            Войти
          </Link>
        </section>
        <p className="body-sm" style={{ textAlign: 'center', color: 'var(--ink-secondary)' }}>
          Все данные синтетические. Демонстрационная версия
        </p>
      </div>
    </div>
  );
}
