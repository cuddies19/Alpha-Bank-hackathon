import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groups, screens } from './screens/registry';

/** Все экраны макета по разделам — для навигации по прототипу и демо. */
export default function ScreenMap() {
  useEffect(() => {
    document.title = 'Карта экранов — Кредитный кабинет';
  }, []);
  return (
    <main className="app-map">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 className="display">Карта экранов</h1>
        <p className="body-lg" style={{ color: 'var(--ink-secondary)' }}>
          {screens.length} экранов и состояний. Вход в прототип — <Link to="/">экран входа</Link>.
        </p>
      </div>
      {groups.map((g) => (
        <section key={g.id} className="app-map__group">
          <h2 className="title-2">{g.name}</h2>
          <div className="app-map__list">
            {screens
              .filter((s) => s.group === g.id)
              .map((s) => (
                <Link key={s.path} to={s.path} className="app-map__item">
                  <span className="body-strong">{s.title}</span>
                  <span className="body-sm app-map__path">{s.path}</span>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
