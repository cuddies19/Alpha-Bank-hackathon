// C4 · Конвейер — перенесено из макета «Кредитный кабинет — макет» (C4-Pipeline.dc.html)
import { Link } from 'react-router-dom';
import { Chip, Icon, MetricTile } from '../ui';
import type { ScreenValues } from '../lib/screen';
import HeaderBank from './HeaderBank';
import NavBank from './NavBank';

function useScreen(): ScreenValues {
  return {
    d1: { value: '+9%', direction: 'up', tone: 'neutral', label: 'к прошлой неделе' },
    d2: { value: '−25 мин', direction: 'down', tone: 'success', label: 'к прошлой неделе' },
  };
}

export default function C4Pipeline() {
  const v = useScreen();
  return (
    <div className="kn-app">
      <div className="kn-app__side">
        <NavBank active="pipeline" />
      </div>
      <main className="kn-app__main">
        <HeaderBank />
        <div className="kn-page" style={{ gap: '24px' }}>
          <div className="kn-sechead" style={{ alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 className="title-1">Конвейер</h1>
              <p className="body" style={{ color: 'var(--ink-secondary)' }}>
                18–24 октября · синтетические данные демо
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Chip>Сегодня</Chip> <Chip selected={true}>Неделя</Chip> <Chip>Месяц</Chip>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
              gap: '16px',
            }}
          >
            <MetricTile label="Заявок за неделю" value="128" icon="document" delta={v.d1} />{' '}
            <MetricTile label="Решено автоматически" value="64%" icon="check-circle" hint="70 из 109 решений" />{' '}
            <MetricTile label="Среднее время до решения" value="2 ч 40 мин" icon="clock" delta={v.d2} />{' '}
            <MetricTile label="Ждут клиента" value="9" icon="alert" hint="запрошены документы" />
          </div>
          <div className="kn-cols">
            <section className="kk-card kk-card--md kn-cols__main" style={{ gap: '16px' }}>
              <h2 className="title-3">Воронка этапов</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="kn-hbar">
                  <span>Подано</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '100%' }}></span>
                  </span>
                  <b>128</b>
                </div>
                <div className="kn-hbar">
                  <span>Проверка полноты</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '94.5%' }}></span>
                  </span>
                  <b>121</b>
                </div>
                <div className="kn-hbar">
                  <span>Источники</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '91.4%' }}></span>
                  </span>
                  <b>117</b>
                </div>
                <div className="kn-hbar">
                  <span>Оценка</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '89.8%' }}></span>
                  </span>
                  <b>115</b>
                </div>
                <div className="kn-hbar">
                  <span>Решение</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '85.2%' }}></span>
                  </span>
                  <b>109</b>
                </div>
                <div className="kn-hbar">
                  <span>Выдано</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '47.7%' }}></span>
                  </span>
                  <b>61</b>
                </div>
              </div>
              <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                7 заявок отсеяны на проверке полноты: не хватало согласий или обязательных документов.
              </p>
            </section>
            <section className="kk-card kk-card--md kn-cols__side" style={{ gap: '16px' }}>
              <h2 className="title-3">Исходы решений</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="kn-hbar" style={{ gridTemplateColumns: '120px minmax(0, 1fr) 40px' }}>
                  <span>Одобрено</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '53%' }}></span>
                  </span>
                  <b>58</b>
                </div>
                <div className="kn-hbar" style={{ gridTemplateColumns: '120px minmax(0, 1fr) 40px' }}>
                  <span>Встречное</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '16%' }}></span>
                  </span>
                  <b>17</b>
                </div>
                <div className="kn-hbar" style={{ gridTemplateColumns: '120px minmax(0, 1fr) 40px' }}>
                  <span>Дозапрос</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '15%' }}></span>
                  </span>
                  <b>16</b>
                </div>
                <div className="kn-hbar" style={{ gridTemplateColumns: '120px minmax(0, 1fr) 40px' }}>
                  <span>Отказ</span>
                  <span className="kn-hbar__track">
                    <span style={{ width: '16%' }}></span>
                  </span>
                  <b>18</b>
                </div>
              </div>
              <p className="body-sm" style={{ color: 'var(--ink-secondary)' }}>
                Из 109 решений · шкала — доля от всех решений
              </p>
            </section>
          </div>
          <div className="kn-cols">
            <section className="kk-card kk-card--md kn-cols__main" style={{ gap: '16px' }}>
              <h2 className="title-3">Частые причины</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
                  gap: '24px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 className="label" style={{ color: 'var(--ink-secondary)' }}>
                    Отказ
                  </h3>
                  <dl className="kn-rows">
                    <div>
                      <dt>Просрочка больше 60 дней</dt>
                      <dd>7</dd>
                    </div>
                    <div>
                      <dt>Налоговая задолженность</dt>
                      <dd>5</dd>
                    </div>
                    <div>
                      <dt>Бизнесу меньше 12 месяцев</dt>
                      <dd>4</dd>
                    </div>
                    <div>
                      <dt>Класс риска ниже C</dt>
                      <dd>2</dd>
                    </div>
                  </dl>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 className="label" style={{ color: 'var(--ink-secondary)' }}>
                    Дозапрос
                  </h3>
                  <dl className="kn-rows">
                    <div>
                      <dt>Нет бухгалтерской отчётности</dt>
                      <dd>8</dd>
                    </div>
                    <div>
                      <dt>Нет выписки из другого банка</dt>
                      <dd>5</dd>
                    </div>
                    <div>
                      <dt>Нечитаемый документ</dt>
                      <dd>3</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>
            <section className="kk-card kk-card--md kn-cols__side" style={{ gap: '12px' }}>
              <div className="kn-sechead">
                <h2 className="title-3">Состояние источников</h2>
                <Link className="kk-btn kk-btn--link" to="/c5-integrations">
                  Все
                </Link>
              </div>
              <dl className="kn-rows">
                <div>
                  <dt style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' }}>
                    <span className="kn-ok">
                      <Icon name="check-circle" size={16} />
                    </span>
                    ЕГРЮЛ / ЕГРИП
                  </dt>
                  <dd style={{ fontWeight: '400' }}>0,8 с</dd>
                </div>
                <div>
                  <dt style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' }}>
                    <span className="kn-ok">
                      <Icon name="check-circle" size={16} />
                    </span>
                    ФНС
                  </dt>
                  <dd style={{ fontWeight: '400' }}>1,2 с</dd>
                </div>
                <div>
                  <dt style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' }}>
                    <span className="kn-bad">
                      <Icon name="x-circle" size={16} />
                    </span>
                    Бюро кредитных историй
                  </dt>
                  <dd style={{ color: 'var(--danger)' }}>не отвечает</dd>
                </div>
                <div>
                  <dt style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' }}>
                    <span className="kn-ok">
                      <Icon name="check-circle" size={16} />
                    </span>
                    Выписка по счёту
                  </dt>
                  <dd style={{ fontWeight: '400' }}>0,4 с</dd>
                </div>
                <div>
                  <dt style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' }}>
                    <span className="kn-warn">
                      <Icon name="alert" size={16} />
                    </span>
                    Сервис оценки
                  </dt>
                  <dd style={{ color: 'var(--warning)' }}>медленно, 2,9 с</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
