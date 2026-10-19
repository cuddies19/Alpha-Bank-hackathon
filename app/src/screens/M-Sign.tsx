// B10 · Подписание · 390 — перенесено из макета «Кредитный кабинет — макет» (M-Sign.dc.html)
import { Link } from 'react-router-dom';
import { Button, Icon } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import MobileTop from './MobileTop';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const code = (s.code || '      ').split('');
  const agree = !!s.agree;
  const ok = code.join('').replace(/\s/g, '') === '482913';
  return {
    agree,
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

export default function MSign() {
  const v = useScreen();
  return (
    <div className="kn-mobile">
      <MobileTop mode="flow" title="Подписание" sub="Кредитная линия · 2 400 000 ₽" back="/m-counter" />
      <div className="kn-mobile__body">
        <section className="kk-card kk-card--sm" style={{ gap: '4px', padding: '12px 16px' }}>
          <ul style={{ display: 'flex', flexDirection: 'column' }}>
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '56px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span className="kk-doc__icon">
                <Icon name="document" />
              </span>
              <span className="body-strong" style={{ flex: '1' }}>
                Кредитный договор
              </span>
              <Button variant="ghost" size="sm">
                Открыть
              </Button>
            </li>
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minHeight: '56px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span className="kk-doc__icon">
                <Icon name="document" />
              </span>
              <span className="body-strong" style={{ flex: '1' }}>
                График платежей
              </span>
              <Button variant="ghost" size="sm">
                Открыть
              </Button>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '56px' }}>
              <span className="kk-doc__icon">
                <Icon name="document" />
              </span>
              <span className="body-strong" style={{ flex: '1' }}>
                Заявление на выдачу
              </span>
              <Button variant="ghost" size="sm">
                Открыть
              </Button>
            </li>
          </ul>
        </section>
        <section className="kk-card kk-card--sm" style={{ gap: '16px', padding: '20px 16px' }}>
          <label className="kn-consent__row">
            <input type="checkbox" className="kn-check" checked={v.agree} onChange={v.toggleAgree} />{' '}
            <span>Ознакомился с условиями договора и графиком платежей</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span className="label" id="m-otp">
              Код подтверждения
            </span>
            <div className="kn-otp" role="group" aria-labelledby="m-otp" style={{ gap: '6px' }}>
              {v.cells.map((c, i) => (
                <input
                  key={i}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={c.label}
                  value={c.v}
                  onChange={c.set}
                  style={{ width: '44px', height: '52px' }}
                />
              ))}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1.5px dashed var(--line-strong)',
            }}
          >
            <span className="body">
              Демо: код подтверждения <b className="amt">482 913</b> — вместо SMS.
            </span>{' '}
            <Button variant="ghost" size="sm" onClick={v.fill} style={{ alignSelf: 'flex-start' }}>
              Подставить код
            </Button>
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
      <div className="kn-mbar">
        {v.ready ? (
          <>
            <Link className="kk-btn kk-btn--primary kk-btn--lg kk-btn--full" to="/m-issued">
              Подписать
            </Link>
          </>
        ) : null}
        {v.notReady ? (
          <>
            <Button variant="primary" size="lg" fullWidth={true} disabled={true}>
              Подписать
            </Button>
            <p className="caption" style={{ textAlign: 'center', color: 'var(--ink-secondary)', fontWeight: '400' }}>
              {v.hint}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
