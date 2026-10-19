// C5 · Внешние источники — перенесено из макета «Кредитный кабинет — макет» (C5-Integrations.dc.html)
import { Link } from 'react-router-dom';
import { Alert, Badge } from '../ui';
import type { ScreenValues } from '../lib/screen';
import { parseStyle } from '../lib/parseStyle';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

function useScreen(): ScreenValues {
  return {
    rows: [
      {
        name: 'ЕГРЮЛ / ЕГРИП',
        status: 'Работает',
        tone: 'success',
        icon: 'check-circle',
        time: '0,8 с',
        errors: '0',
        errStyle: '',
        last: 'сегодня, 11:20',
        rule: 'Заявка ждёт до 3 попыток, затем — ручная проверка',
      },
      {
        name: 'ФНС «Прозрачный бизнес»',
        status: 'Работает',
        tone: 'success',
        icon: 'check-circle',
        time: '1,2 с',
        errors: '0',
        errStyle: '',
        last: 'сегодня, 11:19',
        rule: 'Ручная проверка налоговой задолженности',
      },
      {
        name: 'Бюро кредитных историй',
        status: 'Не отвечает',
        tone: 'danger',
        icon: 'x-circle',
        time: '10 с, тайм-аут',
        errors: '14',
        errStyle: 'color: var(--danger); font-weight: 600;',
        last: 'сегодня, 11:02',
        rule: 'Заявка уходит на ручную проверку',
      },
      {
        name: 'Выписка по счёту',
        status: 'Работает',
        tone: 'success',
        icon: 'check-circle',
        time: '0,4 с',
        errors: '0',
        errStyle: '',
        last: 'сегодня, 11:20',
        rule: 'Клиенту предлагают загрузить выписку файлом',
      },
      {
        name: 'Сервис оценки',
        status: 'Медленно',
        tone: 'warning',
        icon: 'clock',
        time: '2,9 с',
        errors: '1',
        errStyle: '',
        last: 'сегодня, 11:18',
        rule: 'Правила продукта без балла, ручная проверка',
      },
    ],
  };
}

export default function C5Integrations() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="integrations" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <div className="kn-page" style={{ gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="title-1">Внешние источники</h1>
            <p className="body" style={{ color: 'var(--ink-secondary)' }}>
              Проверка каждые 30 секунд · 24 октября, 11:20
            </p>
          </div>
          <Alert tone="danger" title="Бюро кредитных историй не отвечает с 11:02">
            <p>
              Новые заявки не падают: они уходят на ручную проверку с меткой «Источник недоступен». Сейчас таких заявок
              — 1.
            </p>
            <div style={{ marginTop: '8px' }}>
              <Link className="kk-btn kk-btn--secondary kk-btn--sm" to="/c1-queue">
                Открыть в очереди
              </Link>
            </div>
          </Alert>
          <div className="kn-tablewrap">
            <table className="kn-table">
              <thead>
                <tr>
                  <th scope="col">Источник</th>
                  <th scope="col">Статус</th>
                  <th scope="col" className="num">
                    Среднее время ответа
                  </th>
                  <th scope="col" className="num">
                    Ошибки за час
                  </th>
                  <th scope="col">Последний успешный ответ</th>
                  <th scope="col">Правило при сбое</th>
                </tr>
              </thead>
              <tbody>
                {v.rows.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span className="body-strong" style={{ display: 'block' }}>
                        {r.name}
                      </span>
                      <span className="kn-sub">Смоделированная интеграция</span>
                    </td>
                    <td>
                      <Badge tone={r.tone} icon={r.icon}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="num">{r.time}</td>
                    <td className="num" style={{ whiteSpace: 'nowrap', ...parseStyle(r.errStyle) }}>
                      {r.errors}
                    </td>
                    <td className="nw">{r.last}</td>
                    <td style={{ color: 'var(--ink-secondary)' }}>{r.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
            Тайм-аут запроса — 10 секунд, 3 попытки. Статусы можно переключить в «Режиме проверки».
          </p>
        </div>
      </main>
    </div>
  );
}
