// C3 · Панель решения (интерактивная) — перенесено из макета «Кредитный кабинет — макет» (DecisionPanel.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Icon, PaymentLoadMeter, TextField } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';

export interface DecisionPanelProps {
  outcome?: 'approve' | 'counter' | 'request' | 'decline';
  decided?: boolean;
}

function useScreen(props: DecisionPanelProps): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const n = ' ';
  const money = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, n);
  const outcome = s.outcome || props.outcome || 'counter';
  const decided = s.decided ?? props.decided ?? false;
  const amount = s.amount ?? 2400000;
  const term = s.term ?? 18;
  const rate = s.rate ?? 21.5;
  const r = rate / 1200;
  const pay =
    term > 0 && amount > 0
      ? Math.round((r > 0 ? (amount * r) / (1 - Math.pow(1 + r, -term)) : amount / term) / 100) * 100
      : 0;
  const docState = s.docs || { bs: true, stmt: true, supply: false, other: false };
  const docList = [
    { k: 'bs', label: 'Бухгалтерская отчётность за 2025 год' },
    { k: 'stmt', label: 'Выписка из другого банка за 6 месяцев' },
    { k: 'supply', label: 'Договор поставки' },
    { k: 'other', label: 'Другое' },
  ];
  const reqCount = docList.filter((d) => docState[d.k]).length;
  const labels = {
    approve: 'Одобрить',
    counter: 'Встречное предложение',
    request: 'Запросить данные',
    decline: 'Отказать',
  };
  const words = {
    approve: 'Одобрено',
    counter: 'Встречное предложение',
    request: 'Запрошены данные',
    decline: 'Отказ',
  };
  const terms = {
    approve: '3' + n + '000' + n + '000' + n + '₽ на 18' + n + 'мес.',
    counter: money(amount) + n + '₽ на ' + term + n + 'мес.',
    request: reqCount + ' док. до 30 октября',
    decline: 'Просрочка больше 60 дней',
  };
  return {
    open: !decided,
    decided: decided,
    modal: !!s.modal,
    isApprove: outcome === 'approve',
    isCounter: outcome === 'counter',
    isRequest: outcome === 'request',
    isDecline: outcome === 'decline',
    opts: ['approve', 'counter', 'request', 'decline'].map((k) => ({
      label: labels[k],
      rec: k === 'counter',
      cls: 'kn-seg__opt' + (outcome === k ? ' is-on' : ''),
      pressed: outcome === k ? 'true' : 'false',
      pick: () => setState({ outcome: k }),
    })),
    docs: docList.map((d) => ({
      ...d,
      on: !!docState[d.k],
      toggle: () => setState({ docs: { ...docState, [d.k]: !docState[d.k] } }),
    })),
    amountText: money(amount),
    termText: String(term),
    rateText: String(rate).replace('.', ','),
    onAmount: (e) => setState({ amount: Number(String(e.target.value).replace(/\D/g, '')) || 0 }),
    onTerm: (e) => setState({ term: Number(String(e.target.value).replace(/\D/g, '')) || 0 }),
    onRate: (e) =>
      setState({
        rate:
          Number(
            String(e.target.value)
              .replace(',', '.')
              .replace(/[^\d.]/g, ''),
          ) || 0,
      }),
    pay: pay,
    payText: money(pay) + n + '₽',
    pay3: 196500,
    flow: 610000,
    outcomeWord: words[outcome],
    outcomeTerms: terms[outcome],
    ask: () => setState({ modal: true }),
    cancel: () => setState({ modal: false }),
    decide: () => setState({ modal: false, decided: true }),
  };
}

export default function DecisionPanel(props: DecisionPanelProps) {
  const v = useScreen(props);
  return (
    <section
      aria-label="Решение по заявке"
      style={{
        boxSizing: 'border-box',
        width: '100%',
        background: 'var(--surface)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 className="title-3">Решение по заявке</h2>
        <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
          № 2026-10-0142 · ООО «Дом и уют»
        </p>
      </div>
      {v.open ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="label" id="dp-outcome">
              Исход
            </span>
            <div className="kn-seg kn-seg--grid" role="group" aria-labelledby="dp-outcome">
              {v.opts.map((o, i) => (
                <button key={i} type="button" className={o.cls} aria-pressed={o.pressed} onClick={o.pick}>
                  {o.label}
                  {o.rec ? (
                    <>
                      <span className="kn-seg__tag">Рекомендация системы</span>
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
          {v.isApprove ? (
            <>
              <Alert tone="warning" title="Не проходит правило доли платежа">
                Платёж займёт 32% потока при пороге 30%. Система рекомендует встречное предложение.
              </Alert>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                  Условия из заявки, только для чтения
                </span>
                <dl className="kn-rows">
                  <div>
                    <dt>Сумма</dt>
                    <dd>3 000 000 ₽</dd>
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
                    <dd>196 500 ₽</dd>
                  </div>
                </dl>
              </div>
              <PaymentLoadMeter title="Доля платежа в потоке" payment={v.pay3} cashFlow={v.flow} />
            </>
          ) : null}
          {v.isCounter ? (
            <>
              <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                Подобрана сумма, при которой платёж 26% потока. Поля можно изменить — платёж пересчитается.
              </p>
              <TextField label="Сумма" format="money" value={v.amountText} onChange={v.onAmount} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <TextField label="Срок" suffix="мес." value={v.termText} onChange={v.onTerm} inputMode="numeric" />{' '}
                <TextField label="Ставка" suffix="%" value={v.rateText} onChange={v.onRate} inputMode="decimal" />
              </div>
              <dl className="kn-rows">
                <div>
                  <dt>Платёж в месяц</dt>
                  <dd>{v.payText}</dd>
                </div>
              </dl>
              <PaymentLoadMeter title="Доля платежа в потоке" payment={v.pay} cashFlow={v.flow} />
            </>
          ) : null}
          {v.isRequest ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="label">Что запросить у клиента</span>
                {v.docs.map((d, i) => (
                  <label key={i} className="kn-consent__row" style={{ padding: '6px 0' }}>
                    <input type="checkbox" className="kn-check" checked={d.on} onChange={d.toggle} />{' '}
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
              <label className="kn-field">
                <span className="label">Сообщение клиенту</span>
                <textarea
                  className="kn-textarea"
                  rows={4}
                  defaultValue="Пришлите бухгалтерскую отчётность за 2025 год и выписку из другого банка за 6 месяцев — так банк увидит всю выручку компании."
                ></textarea>
              </label>
            </>
          ) : null}
          {v.isDecline ? (
            <>
              <label className="kn-field">
                <span className="label">Причина из справочника</span>
                <select className="kn-nselect">
                  <option>Просрочка больше 60 дней за 12 месяцев</option>
                  <option>Налоговая задолженность</option>
                  <option>Возраст бизнеса меньше 12 месяцев</option>
                  <option>Класс риска ниже C</option>
                  <option>Другое</option>
                </select>
              </label>{' '}
              <label className="kn-field">
                <span className="label">Объяснение для клиента</span>
                <textarea
                  className="kn-textarea"
                  rows={5}
                  defaultValue="Сейчас банк не может выдать кредит: в кредитной истории есть просрочка больше 60 дней за последний год. Подать заявку снова можно через 3 месяца."
                ></textarea>
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Шаблон простыми словами — можно поправить
                </span>
              </label>
            </>
          ) : null}
          <label className="kn-field">
            <span className="label">Внутренний комментарий</span>
            <textarea
              className="kn-textarea"
              rows={3}
              placeholder="Например: сезонность учтена, платёж проверен по выписке"
            ></textarea>
            <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
              Клиент его не видит
            </span>
          </label>{' '}
          <Button variant="primary" fullWidth={true} onClick={v.ask}>
            Принять решение
          </Button>
        </>
      ) : null}
      {v.decided ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Badge tone="success">Решение принято</Badge>
            <p className="body">24 октября, 11:32 · О. Кравцова</p>
            <dl className="kn-rows">
              <div>
                <dt>Исход</dt>
                <dd>{v.outcomeWord}</dd>
              </div>
              <div>
                <dt>Условия</dt>
                <dd>{v.outcomeTerms}</dd>
              </div>
            </dl>
            <Alert tone="info" title="Клиент уже видит решение">
              Уведомление пришло в кабинет клиента. Панель доступна только для чтения.
            </Alert>{' '}
            <Link className="kn-demo-tag" to="/b8-ready" style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>
              <Icon name="shield" size={16} /> Режим проверки: войти как Игорь
            </Link>
          </div>
        </>
      ) : null}
      {v.modal ? (
        <>
          <div className="kn-scrim">
            <div className="kn-modal" role="dialog" aria-modal="true" aria-labelledby="dp-confirm">
              <h3 className="title-3" id="dp-confirm">
                Принять решение?
              </h3>
              <p className="body">Клиент увидит решение сразу. Отменить нельзя.</p>
              <dl className="kn-rows">
                <div>
                  <dt>Исход</dt>
                  <dd>{v.outcomeWord}</dd>
                </div>
                <div>
                  <dt>Условия</dt>
                  <dd>{v.outcomeTerms}</dd>
                </div>
              </dl>
              <div className="kn-modal__actions">
                <Button variant="secondary" onClick={v.cancel}>
                  Отмена
                </Button>{' '}
                <Button variant="primary" onClick={v.decide}>
                  Принять решение
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
