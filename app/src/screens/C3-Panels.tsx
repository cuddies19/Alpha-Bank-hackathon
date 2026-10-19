// C3 · Варианты решения и подтверждение — перенесено из макета «Кредитный кабинет — макет» (C3-Panels.dc.html)
import { Button } from '../ui';
import DecisionPanel from './DecisionPanel';

export default function C3Panels() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1320px',
        minHeight: '2050px',
        padding: '40px 60px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 384px)',
        gap: '40px 24px',
        alignContent: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Одобрить — условия из заявки, только чтение
        </p>
        <DecisionPanel outcome="approve" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Запросить данные — чек-лист и сообщение клиенту
        </p>
        <DecisionPanel outcome="request" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Отказать — причина из справочника и объяснение
        </p>
        <DecisionPanel outcome="decline" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          После решения — только чтение
        </p>
        <DecisionPanel outcome="counter" decided={true} />
      </div>
      <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Подтверждение решения
        </p>
        <div
          style={{
            position: 'relative',
            height: '420px',
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'var(--scrim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="kn-modal" role="dialog" aria-labelledby="c3-confirm">
            <h3 className="title-3" id="c3-confirm">
              Принять решение?
            </h3>
            <p className="body">Клиент увидит решение сразу. Отменить нельзя.</p>
            <dl className="kn-rows">
              <div>
                <dt>Исход</dt>
                <dd>Встречное предложение</dd>
              </div>
              <div>
                <dt>Условия</dt>
                <dd>2 400 000 ₽ на 18 мес.</dd>
              </div>
            </dl>
            <div className="kn-modal__actions">
              <Button variant="secondary">Отмена</Button> <Button variant="primary">Принять решение</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
