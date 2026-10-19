// B13 · Документы — перенесено из макета «Кредитный кабинет — макет» (B13-Documents.dc.html)
import { Badge, Button, DocumentUpload, Icon } from '../ui';
import type { ScreenValues } from '../lib/screen';
import HeaderClient from './HeaderClient';
import NavClient from './NavClient';

function useScreen(): ScreenValues {
  const n = ' ';
  const a = '№' + n + '2026-10-0142';
  return {
    docs: [
      {
        name: 'Кредитный договор',
        meta: 'PDF · 6 страниц',
        app: a,
        date: '24 октября',
        status: 'Подписано',
        tone: 'success',
        replace: false,
      },
      {
        name: 'График платежей',
        meta: 'PDF · 1 страница',
        app: a,
        date: '24 октября',
        status: 'Подписано',
        tone: 'success',
        replace: false,
      },
      {
        name: 'Заявление на выдачу',
        meta: 'PDF · 1 страница',
        app: a,
        date: '24 октября',
        status: 'Подписано',
        tone: 'success',
        replace: false,
      },
      {
        name: 'Бухгалтерская отчётность за 2025 год',
        meta: 'PDF · 1,8 МБ',
        app: a,
        date: '24 октября',
        status: 'Принят',
        tone: 'success',
        replace: false,
      },
      {
        name: 'Выписка из другого банка',
        meta: 'PDF · 640 КБ',
        app: a,
        date: '24 октября',
        status: 'Принят',
        tone: 'success',
        replace: false,
      },
      {
        name: 'Договор поставки',
        meta: 'JPG · фото обрезано',
        app: a,
        date: '24 октября',
        status: 'Нужно заменить',
        tone: 'danger',
        replace: true,
      },
      {
        name: 'Согласие на запрос в БКИ',
        meta: 'Подписано в кабинете',
        app: a,
        date: '24 октября',
        status: 'Подписано',
        tone: 'success',
        replace: false,
      },
    ],
  };
}

export default function B13Documents() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavClient active="documents" />
      </div>
      <main className="kn-app__main">
        <HeaderClient />
        <div className="kn-page" style={{ gap: '24px' }}>
          <h1 className="title-1">Документы</h1>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="kn-toolbar">
                <label className="kn-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <span className="label" style={{ color: 'var(--ink-secondary)' }}>
                    Заявка
                  </span>
                  <select className="kn-nselect" style={{ width: 'auto', height: '36px', fontSize: '13px' }}>
                    <option>Все заявки</option>
                    <option>№ 2026-10-0142 · кредитная линия</option>
                    <option>№ 2026-10-0097 · черновик</option>
                  </select>
                </label>{' '}
                <span style={{ flex: '1' }}></span>{' '}
                <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  7 документов
                </span>
              </div>
              <div className="kn-tablewrap">
                <table className="kn-table">
                  <thead>
                    <tr>
                      <th scope="col">Документ</th>
                      <th scope="col">Заявка</th>
                      <th scope="col">Дата</th>
                      <th scope="col">Статус</th>
                      <th scope="col">
                        <span className="kk-sr">Действия</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.docs.map((d, i) => (
                      <tr key={i}>
                        <td>
                          <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span className="kk-doc__icon">
                              <Icon name="document" />
                            </span>
                            <span>
                              <span className="body-strong">{d.name}</span>
                              <span className="kn-sub">{d.meta}</span>
                            </span>
                          </span>
                        </td>
                        <td className="nw">{d.app}</td>
                        <td className="nw">{d.date}</td>
                        <td>
                          <Badge tone={d.tone}>{d.status}</Badge>
                        </td>
                        <td className="nw" style={{ textAlign: 'right' }}>
                          <Button variant="ghost" size="sm">
                            Открыть
                          </Button>{' '}
                          <Button variant="ghost" size="sm" iconLeft="arrow-down">
                            Скачать
                          </Button>
                          {d.replace ? (
                            <>
                              <Button variant="secondary" size="sm" iconLeft="upload">
                                Заменить
                              </Button>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <aside>
              <section className="kk-card kk-card--md" style={{ gap: '12px' }}>
                <h2 className="title-3">Загрузить документ</h2>
                <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                  Проверим файл сразу после загрузки и привяжем к заявке.
                </p>
                <DocumentUpload label="Перетащите файл или выберите на компьютере" />
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
