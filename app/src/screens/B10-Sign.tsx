// B10 · Подписание — перенесено из макета «Кредитный кабинет — макет» (B10-Sign.dc.html)
import { Link } from 'react-router-dom';
import { Button, Icon } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const code = (s.code || '      ').split('');
  const agree = !!s.agree;
  const docs = [
    { title: 'Кредитный договор', meta: 'PDF · 6 страниц' },
    { title: 'График платежей', meta: 'PDF · 1 страница · 18 платежей по 157 200 ₽' },
    { title: 'Заявление на выдачу', meta: 'PDF · 1 страница · зачисление на счёт •• 4821' },
  ];
  const full = code.join('').replace(/\s/g, '');
  const ok = full === '482913';
  const d = s.doc ?? -1;
  return {
    agree,
    docs: docs.map((x, i) => ({ ...x, open: () => setState({ doc: i }) })),
    drawer: d >= 0,
    docTitle: d >= 0 ? docs[d].title : '',
    docMeta: d >= 0 ? docs[d].meta : '',
    close: () => setState({ doc: -1 }),
    toggleAgree: () => setState({ agree: !agree }),
    cells: code.map((v, i) => ({
      v: v.trim(),
      label: 'Цифра ' + (i + 1) + ' из 6',
      set: (e) => {
        const c = code.slice();
        c[i] = String(e.target.value).replace(/\D/g, '').slice(-1) || ' ';
        setState({ code: c.join('') });
      },
    })),
    fill: () => setState({ code: '482913' }),
    ready: agree && ok,
    notReady: !(agree && ok),
    hint: !agree ? 'Отметьте, что ознакомились с условиями' : 'Введите код из 6 цифр',
  };
}

export default function B10Sign() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="applications" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page kn-page--narrow" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 className="title-1">Подписание документов</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              Кредитная линия · <span className="amt">2 400 000 ₽</span> · 18 мес. · 21,5%
            </p>
          </div>
          <section className="kk-card kk-card--md" style={{ gap: '8px' }}>
            <h2 className="title-3">Документы</h2>
            <ul style={{ display: 'flex', flexDirection: 'column' }}>
              {v.docs.map((d, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <span className="kk-doc__icon">
                    <Icon name="document" />
                  </span>{' '}
                  <span style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                    <span className="body-strong">{d.title}</span>
                    <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      {d.meta}
                    </span>
                  </span>{' '}
                  <Button variant="ghost" size="sm" onClick={d.open}>
                    Открыть
                  </Button>
                </li>
              ))}
            </ul>
          </section>
          <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
            <label className="kn-consent__row">
              <input type="checkbox" className="kn-check" checked={v.agree} onChange={v.toggleAgree} />{' '}
              <span>Ознакомился с условиями кредитного договора и графиком платежей</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="label" id="otp-label">
                Код подтверждения
              </span>
              <div className="kn-otp" role="group" aria-labelledby="otp-label">
                {v.cells.map((c, i) => (
                  <input key={i} inputMode="numeric" maxLength={1} aria-label={c.label} value={c.v} onChange={c.set} />
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px dashed var(--line-strong)',
                  background: 'var(--surface)',
                }}
              >
                <Icon name="shield" size={20} />{' '}
                <span className="body" style={{ flex: '1' }}>
                  Демо: код подтверждения <b className="amt">482 913</b>. Код показан здесь вместо SMS: весь путь
                  остаётся в кабинете.
                </span>{' '}
                <Button variant="ghost" size="sm" onClick={v.fill}>
                  Подставить
                </Button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {v.ready ? (
                <>
                  <Link className="kk-btn kk-btn--primary kk-btn--lg" to="/b11-issued">
                    Подписать
                  </Link>
                </>
              ) : null}
              {v.notReady ? (
                <>
                  <Button variant="primary" size="lg" disabled={true}>
                    Подписать
                  </Button>{' '}
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {v.hint}
                  </span>
                </>
              ) : null}
            </div>
          </section>
          <p
            className="body-sm"
            style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink-secondary)' }}
          >
            <Icon name="info" size={16} />
            Подписание смоделировано: юридической силы нет.
          </p>
        </div>
      </main>
      {v.drawer ? (
        <>
          <div className="kn-scrim" onClick={v.close} style={{ zIndex: '40' }}></div>
          <aside
            className="kn-drawer kn-drawer--fixed"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doc-title"
            style={{ width: '560px' }}
          >
            <div className="kn-drawer__head">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 className="title-3" id="doc-title">
                  {v.docTitle}
                </h2>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  {v.docMeta}
                </span>
              </div>
              <button type="button" className="kn-ibtn" aria-label="Закрыть предпросмотр" onClick={v.close}>
                <Icon name="x" />
              </button>
            </div>
            <div className="kn-drawer__body">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: 'inset 0 0 0 1px var(--line)',
                  background: 'var(--surface-muted)',
                }}
              >
                <p className="body-strong">Кредитный договор № 2026-10-0142-Д</p>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  г. Москва · 24 октября 2026
                </p>
                <p className="body">
                  Банк открывает заёмщику ООО «Дом и уют» кредитную линию с лимитом 2 400 000 ₽ на 18 месяцев под 21,5%
                  годовых.
                </p>
                <p className="body">
                  Заёмщик берёт деньги частями в пределах лимита и гасит их ежемесячными платежами по графику — первый
                  платёж 15 ноября 2026.
                </p>
                <p className="body">Досрочное погашение — без комиссии, в любой день через кабинет.</p>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Страница 1 из 6
                </p>
              </div>
              <dl className="kn-rows">
                <div>
                  <dt>Лимит</dt>
                  <dd>2 400 000 ₽</dd>
                </div>
                <div>
                  <dt>Срок</dt>
                  <dd>18 мес.</dd>
                </div>
                <div>
                  <dt>Ставка</dt>
                  <dd>21,5%</dd>
                </div>
                <div>
                  <dt>Платёж</dt>
                  <dd>157 200 ₽</dd>
                </div>
              </dl>
            </div>
            <div className="kn-drawer__foot">
              <Button variant="secondary" iconLeft="arrow-down">
                Скачать PDF
              </Button>{' '}
              <Button variant="ghost" onClick={v.close}>
                Закрыть
              </Button>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
