// B16 · Состояния ассистента — перенесено из макета «Кредитный кабинет — макет» (B16-States.dc.html)
import AssistantPanel from './AssistantPanel';

export default function B16States() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1672px',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 400px)',
        gap: '24px',
        background: 'var(--bg)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        <AssistantPanel mode="start" screen="Главная" />
      </div>
      <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        <AssistantPanel mode="typing" screen="Подбор финансирования" />
      </div>
      <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        <AssistantPanel mode="simplified" screen="Подбор финансирования" />
      </div>
      <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        <AssistantPanel mode="error" screen="Подбор финансирования" />
      </div>
    </div>
  );
}
