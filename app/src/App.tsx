import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { screens, type ScreenEntry } from './screens/registry';
import ScreenMap from './ScreenMap';

function Screen({ entry }: { entry: ScreenEntry }) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = entry.docTitle;
    window.scrollTo(0, 0);
  }, [entry, pathname]);
  const { Component } = entry;
  const page = <Component />;
  return entry.group === 'mobile' ? <div className="app-mobile-frame">{page}</div> : page;
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {screens.map((s) => (
          <Route key={s.path} path={s.path} element={<Screen entry={s} />} />
        ))}
        <Route path="/screens" element={<ScreenMap />} />
        <Route path="*" element={<ScreenMap />} />
      </Routes>
    </Suspense>
  );
}
