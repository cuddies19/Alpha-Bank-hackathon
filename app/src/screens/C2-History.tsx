// C2 · Карточка: История — перенесено из макета «Кредитный кабинет — макет» (C2-History.dc.html)
import { Link } from 'react-router-dom';
import { Badge } from '../ui';
import type { ScreenValues } from '../lib/screen';
import C2Head from './C2Head';
import DecisionPanel from './DecisionPanel';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

function useScreen(): ScreenValues {
  return {
    events: [
      { t: '11:20:12', what: 'Заявка взята в работу', detail: 'Исполнитель: О. Кравцова', who: 'Сотрудник' },
      {
        t: '11:05:31',
        what: 'Передана на ручное рассмотрение',
        detail: 'Правило «доля платежа не выше 30%» не пройдено: 32%',
        who: 'Система',
      },
      {
        t: '11:05:30',
        what: 'Правила продукта',
        detail: '4 из 5 пройдены, рекомендация — встречное предложение 2 400 000 ₽',
        who: 'Система',
      },
      { t: '11:05:29', what: 'Скоринг', detail: 'scorecard v1.2: 640, класс B', who: 'Система' },
      {
        t: '10:58:04',
        what: 'Ответ бюро кредитных историй',
        detail: '1,4 с · 1 действующий кредит, просрочек нет',
        who: 'Система',
      },
      { t: '10:58:03', what: 'Ответ ФНС «Прозрачный бизнес»', detail: '1,2 с · задолженности нет', who: 'Система' },
      { t: '10:58:02', what: 'Ответ ЕГРЮЛ', detail: '0,8 с · компания действует', who: 'Система' },
      {
        t: '10:52:40',
        what: 'Проверка полноты пройдена',
        detail: 'Обязательные документы и согласия на месте',
        who: 'Система',
      },
      { t: '10:51:14', what: 'Заявка отправлена', detail: 'Черновик → Подана', who: 'Клиент' },
      {
        t: '10:50:02',
        what: 'Подписано согласие на запрос в БКИ',
        detail: 'Подсказка ассистента на шаге 4',
        who: 'Клиент',
      },
      {
        t: '10:42:10',
        what: 'Черновик создан из подбора',
        detail: 'Поля перенесены из диалога с ассистентом',
        who: 'Клиент',
      },
    ],
  };
}

export default function C2History() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="queue" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <C2Head tab="history" />
        <div className="kn-page" style={{ paddingTop: '24px' }}>
          <div className="kn-cols">
            <div className="kn-cols__main">
              <section className="kk-card kk-card--md" style={{ gap: '8px' }}>
                <div className="kn-sechead">
                  <h2 className="title-3">История заявки</h2>
                  <Link className="kk-btn kk-btn--link" to="/c6-audit">
                    Открыть в журнале аудита
                  </Link>
                </div>
                <ul className="kn-feed">
                  {v.events.map((e, i) => (
                    <li key={i} className="kn-feed__item" style={{ gridTemplateColumns: '84px minmax(0, 1fr) auto' }}>
                      <time style={{ paddingTop: '2px' }}>{e.t}</time>{' '}
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="body">{e.what}</span>
                        <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                          {e.detail}
                        </span>
                      </span>{' '}
                      <Badge tone="neutral" icon={false}>
                        {e.who}
                      </Badge>
                    </li>
                  ))}
                </ul>
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
