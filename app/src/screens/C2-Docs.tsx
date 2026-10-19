// C2 · Карточка: Документы — перенесено из макета «Кредитный кабинет — макет» (C2-Docs.dc.html)
import { Alert, Badge, Button } from '../ui';
import { useMergeState } from '../lib/useMergeState';
import type { ScreenValues } from '../lib/screen';
import C2Head from './C2Head';
import DecisionPanel from './DecisionPanel';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

function useScreen(): ScreenValues {
  const [state, setState] = useMergeState<any>();
  const s = state || {};
  const cur = s.cur ?? 0;
  const list = [
    {
      name: 'Бухгалтерская отчётность за 2025 год',
      meta: 'PDF · 12 страниц · обязательный',
      status: 'Принят',
      tone: 'success',
      who: 'И. Соколов',
      when: '24 окт., 10:47',
    },
    {
      name: 'Выписка из другого банка',
      meta: 'PDF · апрель–сентябрь 2026',
      status: 'Принят',
      tone: 'success',
      who: 'И. Соколов',
      when: '24 окт., 10:48',
    },
    {
      name: 'Выписка по счёту •• 4821',
      meta: 'Автоматически из банка · 12 месяцев',
      status: 'Принят',
      tone: 'success',
      who: 'Система',
      when: '24 окт., 10:43',
    },
    {
      name: 'Договор поставки',
      meta: 'JPG · необязательный',
      status: 'Нужно заменить',
      tone: 'danger',
      who: 'И. Соколов',
      when: '24 окт., 10:49',
    },
    {
      name: 'Согласие на запрос в БКИ',
      meta: 'Подписано в кабинете',
      status: 'Подписано',
      tone: 'success',
      who: 'И. Соколов',
      when: '24 окт., 10:50',
    },
    {
      name: 'Согласие на обработку данных и анализ счёта',
      meta: 'Подписано в кабинете',
      status: 'Подписано',
      tone: 'success',
      who: 'И. Соколов',
      when: '24 окт., 10:44',
    },
  ];
  return {
    docs: list.map((d, i) => ({ ...d, rowCls: i === cur ? 'is-new' : '', pick: () => setState({ cur: i }) })),
    curName: list[cur].name,
    curMeta: list[cur].meta,
  };
}

export default function C2Docs() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="queue" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <C2Head tab="docs" />
        <div className="kn-page" style={{ paddingTop: '24px' }}>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <Alert tone="success" title="Комплект полный">
                Обязательные документы для ООО на кредитную линию загружены и прошли автоматическую проверку.
              </Alert>
              <div className="kn-tablewrap">
                <table className="kn-table">
                  <thead>
                    <tr>
                      <th scope="col">Документ</th>
                      <th scope="col">Статус</th>
                      <th scope="col">Загрузил</th>
                      <th scope="col">
                        <span className="kk-sr">Предпросмотр</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.docs.map((d, i) => (
                      <tr key={i} className={d.rowCls}>
                        <td>
                          <span className="body-strong" style={{ display: 'block' }}>
                            {d.name}
                          </span>
                          <span className="kn-sub">{d.meta}</span>
                        </td>
                        <td>
                          <Badge tone={d.tone}>{d.status}</Badge>
                        </td>
                        <td className="nw">
                          <span style={{ display: 'block' }}>{d.who}</span>
                          <span className="kn-sub">{d.when}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button variant="ghost" size="sm" onClick={d.pick}>
                            Открыть
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">{v.curName}</h2>
                  <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                    {v.curMeta}
                  </span>
                </div>
                <div
                  role="img"
                  aria-label="Предпросмотр документа"
                  style={{
                    boxSizing: 'border-box',
                    height: '280px',
                    borderRadius: '12px',
                    background: 'var(--surface-muted)',
                    boxShadow: 'inset 0 0 0 1px var(--line)',
                    padding: '28px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <span style={{ width: '45%', height: '12px', borderRadius: '4px', background: 'var(--line)' }}></span>{' '}
                  <span style={{ width: '30%', height: '10px', borderRadius: '4px', background: 'var(--line)' }}></span>{' '}
                  <span
                    style={{
                      width: '100%',
                      height: '8px',
                      marginTop: '16px',
                      borderRadius: '4px',
                      background: 'var(--line)',
                    }}
                  ></span>{' '}
                  <span style={{ width: '92%', height: '8px', borderRadius: '4px', background: 'var(--line)' }}></span>{' '}
                  <span style={{ width: '96%', height: '8px', borderRadius: '4px', background: 'var(--line)' }}></span>{' '}
                  <span style={{ width: '60%', height: '8px', borderRadius: '4px', background: 'var(--line)' }}></span>{' '}
                  <span className="body-sm" style={{ marginTop: 'auto', color: 'var(--ink-secondary)' }}>
                    Предпросмотр, страница 1
                  </span>
                </div>
              </section>
            </div>
            <aside className="kn-cols__side" style={{ flex: '0 1 384px' }}>
              <DecisionPanel outcome="counter" />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
