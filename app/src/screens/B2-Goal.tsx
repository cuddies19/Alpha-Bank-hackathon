// B2 · Подбор через цель — перенесено из макета «Кредитный кабинет — макет» (B2-Goal.dc.html)
import { Link } from 'react-router-dom';
import { Button, Chip, Icon, TextField } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import AssistantPanel from './AssistantPanel';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const n = ' ';
  const money = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, n);
  const step = s.step ?? 0;
  const amount = s.amount ?? 3000000;
  const goal = s.goal || 'Пополнить оборот';
  const ans = s.ans || {
    when: 'До 1 ноября',
    term: '18' + n + 'мес.',
    source: 'Выручка с маркетплейсов',
    pledge: 'Нет',
  };
  const clamp = Math.min(5000000, Math.max(500000, amount));
  const pct = (((clamp - 500000) / 4500000) * 100).toFixed(1) + '%';
  const amountFull = money(amount) + n + '₽';
  const chips = (key, list) =>
    list.map((label) => ({ label, sel: ans[key] === label, pick: () => setState({ ans: { ...ans, [key]: label } }) }));
  const qs = [
    { title: 'Сколько нужно?', value: amountFull },
    { title: 'Когда нужны деньги?', value: ans.when },
    { title: 'На какой срок?', value: ans.term },
    { title: 'Из чего планируете вернуть?', value: ans.source },
    { title: 'Есть ли залог?', value: ans.pledge },
  ];
  const left = Math.max(0, 4 - step);
  const leftWord = left === 1 ? 'вопрос' : left >= 2 && left <= 4 ? 'вопроса' : 'вопросов';
  const dash = '—';
  return {
    goals: [
      'Кассовый разрыв',
      'Пополнить оборот',
      'Развитие и оборудование',
      'Тендер и контракт',
      'Рефинансировать кредиты',
    ].map((label) => ({ label, sel: goal === label, pick: () => setState({ goal: label }) })),
    answered: qs.slice(0, Math.min(step, 5)).map((q, i) => ({ ...q, edit: () => setState({ step: i }) })),
    q0: step === 0,
    q1: step === 1,
    q2: step === 2,
    q3: step === 3,
    q4: step === 4,
    done: step >= 5,
    notDone: step < 5,
    qNum: step + 1,
    leftText: left > 0 ? 'Потом ещё ' + left + ' ' + leftWord : 'Последний вопрос',
    amount: clamp,
    amountText: money(amount),
    amountFull,
    pct,
    onRange: (e) => setState({ amount: Number(e.target.value) }),
    onAmountField: (e) => setState({ amount: Number(String(e.target.value).replace(/\D/g, '')) || 0 }),
    whenChips: chips('when', ['До 1 ноября', 'В течение ноября', 'Не срочно']),
    termChips: chips('term', ['6' + n + 'мес.', '12' + n + 'мес.', '18' + n + 'мес.', '24' + n + 'мес.']),
    sourceChips: chips('source', ['Выручка с маркетплейсов', 'Оплата по контракту', 'Текущая выручка']),
    pledgeChips: chips('pledge', ['Да', 'Нет']),
    next: () => setState({ step: step + 1 }),
    sumGoal: goal,
    sumAmount: step > 0 ? amountFull : dash,
    sumWhen: step > 1 ? ans.when : dash,
    sumTerm: step > 2 ? ans.term : dash,
    sumSource: step > 3 ? ans.source : dash,
    sumPledge: step > 4 ? ans.pledge : dash,
  };
}

export default function B2Goal() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="financing" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link
              className="kk-btn kk-btn--link"
              to="/b2-need"
              style={{ alignSelf: 'flex-start', color: 'var(--ink-secondary)' }}
            >
              <svg
                className="kn-svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M11.5 5.5L5 12l6.5 6.5" />
              </svg>{' '}
              Описать задачу словами
            </Link>
            <h1 className="title-1">Для чего нужны деньги?</h1>
          </div>
          <div className="kn-cols">
            <div className="kn-cols__main" style={{ flexBasis: '400px' }}>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <span className="label">Цель</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {v.goals.map((g, i) => (
                    <Chip key={i} selected={g.sel} onClick={g.pick}>
                      {g.label}
                    </Chip>
                  ))}
                </div>
              </section>
              {v.answered.map((q, i) => (
                <div
                  key={i}
                  className="kk-card kk-card--sm"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}
                >
                  <span style={{ color: 'var(--success)' }}>
                    <Icon name="check-circle" size={20} />
                  </span>{' '}
                  <span className="body" style={{ flex: '1', color: 'var(--ink-secondary)' }}>
                    {q.title}
                  </span>{' '}
                  <span className="body-strong amt">{q.value}</span>{' '}
                  <Button variant="ghost" size="sm" onClick={q.edit}>
                    Изменить
                  </Button>
                </div>
              ))}
              <section className="kk-card kk-card--md" style={{ gap: '20px' }}>
                {v.notDone ? (
                  <>
                    <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
                      Вопрос {v.qNum} из 5
                    </p>
                  </>
                ) : null}
                {v.q0 ? (
                  <>
                    <h2 className="title-3">Сколько нужно?</h2>
                    <div className="kn-slider">
                      <div className="kn-slider__head">
                        <label className="label" htmlFor="goal-amount">
                          Сумма
                        </label>{' '}
                        <span className="amount-lg amt">{v.amountFull}</span>
                      </div>
                      <div className="kn-slider__track">
                        <div className="kn-slider__fill" style={{ width: v.pct }}></div>
                        <input
                          className="kn-slider__input"
                          id="goal-amount"
                          type="range"
                          min="500000"
                          max="5000000"
                          step="100000"
                          value={v.amount}
                          onChange={v.onRange}
                          aria-valuetext={v.amountFull}
                        />
                        <div className="kn-slider__thumb" style={{ left: v.pct }}></div>
                      </div>
                      <div className="kn-slider__scale">
                        <span>500 000 ₽</span>
                        <span>5 000 000 ₽</span>
                      </div>
                    </div>
                    <TextField
                      label="Или введите точную сумму"
                      format="money"
                      value={v.amountText}
                      onChange={v.onAmountField}
                      style={{ maxWidth: '280px' }}
                    />
                  </>
                ) : null}
                {v.q1 ? (
                  <>
                    <h2 className="title-3">Когда нужны деньги?</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {v.whenChips.map((c, i) => (
                        <Chip key={i} icon="calendar" selected={c.sel} onClick={c.pick}>
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                  </>
                ) : null}
                {v.q2 ? (
                  <>
                    <h2 className="title-3">На какой срок?</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {v.termChips.map((c, i) => (
                        <Chip key={i} selected={c.sel} onClick={c.pick}>
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                    <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Для закупок партиями обычно берут 12–18 месяцев.
                    </p>
                  </>
                ) : null}
                {v.q3 ? (
                  <>
                    <h2 className="title-3">Из чего планируете вернуть?</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {v.sourceChips.map((c, i) => (
                        <Chip key={i} selected={c.sel} onClick={c.pick}>
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                  </>
                ) : null}
                {v.q4 ? (
                  <>
                    <h2 className="title-3">Есть ли залог?</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {v.pledgeChips.map((c, i) => (
                        <Chip key={i} selected={c.sel} onClick={c.pick}>
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                    <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Залог не обязателен для сумм до 5 000 000 ₽.
                    </p>
                  </>
                ) : null}
                {v.notDone ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <Button variant="secondary" iconRight="chevron-right" onClick={v.next}>
                        Дальше
                      </Button>{' '}
                      <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                        {v.leftText}
                      </span>
                    </div>
                  </>
                ) : null}
                {v.done ? (
                  <>
                    <h2 className="title-3">Всё понятно</h2>
                    <p className="body" style={{ color: 'var(--ink-secondary)' }}>
                      Проверьте сводку справа и откройте варианты.
                    </p>
                  </>
                ) : null}
              </section>
            </div>
            <aside className="kn-cols__side" aria-label="Что поняли о задаче" style={{ flexBasis: '260px' }}>
              <section className="kk-card kk-card--md" style={{ gap: '16px' }}>
                <h2 className="title-3">Что поняли о задаче</h2>
                <dl className="kn-rows">
                  <div>
                    <dt>Цель</dt>
                    <dd>{v.sumGoal}</dd>
                  </div>
                  <div>
                    <dt>Сумма</dt>
                    <dd>{v.sumAmount}</dd>
                  </div>
                  <div>
                    <dt>Когда</dt>
                    <dd>{v.sumWhen}</dd>
                  </div>
                  <div>
                    <dt>Срок</dt>
                    <dd>{v.sumTerm}</dd>
                  </div>
                  <div>
                    <dt>Возврат</dt>
                    <dd>{v.sumSource}</dd>
                  </div>
                  <div>
                    <dt>Залог</dt>
                    <dd>{v.sumPledge}</dd>
                  </div>
                </dl>
                {v.done ? (
                  <>
                    <Link className="kk-btn kk-btn--primary kk-btn--full" to="/b3-offers">
                      Показать варианты
                    </Link>
                  </>
                ) : null}
                {v.notDone ? (
                  <>
                    <Button variant="primary" disabled={true} fullWidth={true}>
                      Показать варианты
                    </Button>
                    <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                      Ответьте на оставшиеся вопросы — кнопка станет активной.
                    </p>
                  </>
                ) : null}
              </section>
            </aside>
          </div>
        </div>
      </main>
      <aside className="kn-app__assist">
        <AssistantPanel mode="simplified" screen="Подбор финансирования" />
      </aside>
    </div>
  );
}
