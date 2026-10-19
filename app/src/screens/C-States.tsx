// C · Состояния консоли — перенесено из макета «Кредитный кабинет — макет» (C-States.dc.html)
import { Badge, Button, Icon } from '../ui';

export default function CStates() {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '1200px',
        minHeight: '1050px',
        padding: '40px',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-sans)',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '32px 24px',
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Очередь: загрузка
        </p>
        <div className="kn-tablewrap" aria-busy="true" aria-label="Загружаем очередь">
          <table className="kn-table kn-table--plain">
            <thead>
              <tr>
                <th scope="col">Заявка</th>
                <th scope="col">Компания</th>
                <th scope="col">Сумма</th>
                <th scope="col">SLA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="kn-skel" style={{ width: '96px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '150px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '80px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '70px', height: '22px', borderRadius: '9999px' }}></span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className="kn-skel" style={{ width: '96px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '120px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '80px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '70px', height: '22px', borderRadius: '9999px' }}></span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className="kn-skel" style={{ width: '96px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '170px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '80px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '70px', height: '22px', borderRadius: '9999px' }}></span>
                </td>
              </tr>
              <tr>
                <td>
                  <span className="kn-skel" style={{ width: '96px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '140px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '80px', height: '14px' }}></span>
                </td>
                <td>
                  <span className="kn-skel" style={{ width: '70px', height: '22px', borderRadius: '9999px' }}></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Очередь пуста
        </p>
        <section className="kk-card kk-card--md">
          <div className="kn-empty" style={{ padding: '32px 16px' }}>
            <span className="kn-empty__ic">
              <Icon name="check-circle" size={24} />
            </span>
            <h2 className="title-3">Очередь разобрана</h2>
            <p className="body">Заявок на ручное рассмотрение нет. Новые появятся здесь автоматически.</p>
          </div>
        </section>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Новая заявка появилась в очереди
        </p>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="kn-toast" role="status" style={{ width: '100%' }}>
            <span className="kn-toast__ic" style={{ color: '#7fb0ff' }}>
              <Icon name="info" />
            </span>
            <div className="kn-toast__body">
              <b>Новая заявка № 2026-10-0145</b>
              <span>ИП Кузнецов Д. А. · овердрафт 700 000 ₽ · только что</span>
            </div>
          </div>
          <div className="kn-tablewrap">
            <table className="kn-table kn-table--dense">
              <tbody>
                <tr className="is-new">
                  <td className="nw body-strong">2026-10-0145</td>
                  <td>ИП Кузнецов Д. А.</td>
                  <td className="num">700 000 ₽</td>
                  <td>
                    <Badge tone="info" icon={false}>
                      Новая
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="nw body-strong">2026-10-0144</td>
                  <td>ООО «Велес Логистик»</td>
                  <td className="num">8 000 000 ₽</td>
                  <td>
                    <Badge tone="warning">Источник недоступен</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="caption" style={{ color: 'var(--ink-secondary)' }}>
          Внешние проверки: источник не ответил
        </p>
        <details className="kn-src is-fail" open>
          <summary>
            <span className="kn-bad">
              <Icon name="x-circle" size={24} />
            </span>{' '}
            <span className="kn-src__name">
              <span className="body-strong">Бюро кредитных историй</span>
              <span className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                Заявка № 2026-10-0144
              </span>
            </span>{' '}
            <span className="kn-src__time">10 с × 3</span> <Badge tone="danger">Не ответило</Badge>{' '}
            <span className="kn-src__chev">
              <Icon name="chevron-right" />
            </span>
          </summary>
          <div className="kn-src__body">
            <p className="body">БКИ не ответило за 10 секунд, 3 попытки. Проверьте вручную.</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm">
                Запросить повторно
              </Button>{' '}
              <Button variant="ghost" size="sm">
                Отметить как проверено вручную
              </Button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
