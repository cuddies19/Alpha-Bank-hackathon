// Шапка консоли — перенесено из макета «Кредитный кабинет — макет» (HeaderBank.dc.html)

export default function HeaderBank() {
  return (
    <header className="kn-top" style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>
      <label className="kn-search">
        <svg
          className="kn-svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5L21 21" />
        </svg>{' '}
        <span className="kk-sr">Поиск</span> <input type="search" placeholder="Поиск по ИНН или номеру заявки" />
      </label>{' '}
      <span className="kn-top__spacer"></span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="kn-avatar">ОК</span>{' '}
        <span className="kn-company__text">
          <span className="kn-company__name">Ольга Кравцова</span>{' '}
          <span className="kn-company__sub">Кредитный аналитик</span>
        </span>
      </div>
    </header>
  );
}
