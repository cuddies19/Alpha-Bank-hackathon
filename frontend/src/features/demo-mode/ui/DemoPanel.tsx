import { useState } from 'react';
import { useNavigate } from 'react-router';
import { applicationApi, type Application } from '@/entities/application';
import { sessionApi, useSession, type Persona, type PersonaId } from '@/entities/session';
import { routes } from '@/shared/config';
import { Alert, Avatar, Button, ButtonLink, Drawer, Icon, SegmentedControl, Stack, Cluster } from '@/shared/ui';
import {
  assistantModeSwitchAvailable,
  demoScenariosAvailable,
  fastStageSeconds,
  useApplyScenario,
  useDemoSettings,
  useResetDemo,
  useSetSourceDown,
  useUpdateDemoSettings,
} from '../api/demoApi';
import { DemoTag } from './DemoModeButton';
import styles from './DemoPanel.module.css';

interface Entry {
  persona: PersonaId;
  initials: string;
  name: string;
  note: string;
  mockTo: string;
  scenario?: 'igor-after-decision';
}

const ENTRIES: Entry[] = [
  {
    persona: 'igor',
    initials: 'ИС',
    name: 'Игорь Соколов',
    note: 'Начало сценария 1: встречное предложение',
    mockTo: routes.client.home(),
  },
  {
    persona: 'igor',
    initials: 'ИС',
    name: 'Игорь — после решения банка',
    note: 'Решение готово, можно принять предложение',
    mockTo: routes.client.application('2026-10-0142'),
    scenario: 'igor-after-decision',
  },
  {
    persona: 'anna',
    initials: 'АБ',
    name: 'Анна Белова',
    note: 'Автоматическое одобрение',
    mockTo: routes.client.decision('2026-10-0139'),
  },
  {
    persona: 'marina',
    initials: 'МО',
    name: 'Марина Орлова',
    note: 'Банк запросил документы',
    mockTo: routes.client.decision('2026-10-0141'),
  },
  {
    persona: 'sergey',
    initials: 'СФ',
    name: 'Сергей Фомин',
    note: 'Отказ с альтернативой',
    mockTo: routes.client.decision('2026-10-0140'),
  },
  { persona: 'olga', initials: 'ОК', name: 'Ольга Кравцова', note: 'Кредитный аналитик', mockTo: routes.bank.queue() },
];

function applicationRoute(app: Application) {
  if (app.status === 'draft') return routes.client.applicationForm(app.id);
  return app.decision ? routes.client.decision(app.id) : routes.client.application(app.id);
}

async function apiTarget(persona: Persona) {
  if (persona.role !== 'client' || !persona.companyId) return persona.home;
  const list = await applicationApi.listForCompany(persona.companyId).catch(() => []);
  const latest = [...list].sort((a, b) => Number(b.id) - Number(a.id))[0];
  return latest ? applicationRoute(latest) : persona.home;
}

export interface DemoPanelProps {
  open: boolean;
  onClose: () => void;
}

export function DemoPanel({ open, onClose }: DemoPanelProps) {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const settings = useDemoSettings(open);
  const updateSettings = useUpdateDemoSettings();
  const setSourceDown = useSetSourceDown();
  const applyScenario = useApplyScenario();
  const reset = useResetDemo();
  const [confirmReset, setConfirmReset] = useState(false);

  const enter = async (entry: Entry) => {
    const personas = await sessionApi.personas();
    const known = personas.find((p) => p.id === entry.persona);
    if (!known) return;
    if (entry.scenario && demoScenariosAvailable) await applyScenario.mutateAsync(entry.scenario);
    const persona = await sessionApi.switchTo(known);
    signIn(persona);
    onClose();
    navigate(demoScenariosAvailable ? entry.mockTo : await apiTarget(persona));
  };

  const entries = demoScenariosAvailable
    ? ENTRIES
    : ENTRIES.filter((e) => !e.scenario).map((e) => ({
        ...e,
        note: e.persona === 'olga' ? e.note : 'Откроется последняя заявка клиента',
      }));

  const doReset = async () => {
    await reset.mutateAsync();
    setConfirmReset(false);
    onClose();
    navigate(routes.login());
  };

  const data = settings.data;
  const anyDown = data?.sources.some((s) => s.down);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Режим проверки"
      leading={<Icon name="shield" size={24} />}
      closeLabel="Закрыть режим проверки"
    >
      <DemoTag>Инструмент проверки. В рабочем продукте его нет</DemoTag>

      <section className={styles.group}>
        <h3 className={`label ${styles.heading}`}>Войти как</h3>
        {entries.map((entry) => (
          <button key={entry.name} type="button" className={styles.person} onClick={() => void enter(entry)}>
            <Avatar size="md">{entry.initials}</Avatar>
            <span className={styles.personText}>
              <span className="body-strong">{entry.name}</span>
              <span className={`body-sm ${styles.secondary}`}>{entry.note}</span>
            </span>
            <Icon name="chevron-right" />
          </button>
        ))}
      </section>

      {data ? (
        <>
          <section className={styles.group}>
            <h3 className={`label ${styles.heading}`}>Скорость конвейера</h3>
            <SegmentedControl
              label="Скорость конвейера"
              value={data.pipelineSpeed}
              onChange={(pipelineSpeed) => updateSettings.mutate({ pipelineSpeed })}
              options={[
                { value: 'normal', label: 'Обычная' },
                { value: 'fast', label: `Быстрая · этапы по ${fastStageSeconds} с` },
              ]}
            />
          </section>

          <section className={styles.group}>
            <h3 className={`label ${styles.heading}`}>Внешние источники</h3>
            {data.sources.map((source) => (
              <div key={source.id} className={styles.source}>
                <span className="body">{source.name}</span>
                <SegmentedControl
                  label={source.name}
                  value={source.down ? 'down' : 'up'}
                  onChange={(value) => setSourceDown.mutate({ id: source.id, down: value === 'down' })}
                  options={[
                    { value: 'up', label: 'Работает' },
                    { value: 'down', label: 'Не отвечает' },
                  ]}
                />
              </div>
            ))}
            {anyDown ? (
              <Alert
                tone="info"
                title="Сценарий 5: сбой источника"
                action={
                  <ButtonLink to={routes.bank.integrations()} size="sm" onClick={onClose}>
                    Открыть внешние источники
                  </ButtonLink>
                }
              >
                <p>Новая заявка не упадёт: её передадут специалисту с меткой «Источник недоступен».</p>
              </Alert>
            ) : null}
          </section>

          {assistantModeSwitchAvailable ? (
            <section className={styles.group}>
              <h3 className={`label ${styles.heading}`}>Ассистент</h3>
              <SegmentedControl
                label="Режим ассистента"
                value={data.assistantMode}
                onChange={(assistantMode) => updateSettings.mutate({ assistantMode })}
                options={[
                  { value: 'model', label: 'Языковая модель' },
                  { value: 'rules', label: 'Упрощённый, на правилах' },
                ]}
              />
            </section>
          ) : null}
        </>
      ) : settings.isError ? (
        <Alert tone="info" title="Настройки стенда недоступны">
          <p>Скорость конвейера и источники можно менять только на dev-стенде (APP_ENV=dev).</p>
        </Alert>
      ) : null}

      <section className={styles.group}>
        <h3 className={`label ${styles.heading}`}>Демо-данные</h3>
        {confirmReset ? (
          <Alert
            tone="warning"
            title="Сбросить все заявки и решения?"
            action={
              <Cluster>
                <Button size="sm" onClick={() => setConfirmReset(false)}>
                  Отмена
                </Button>
                <Button variant="primary" size="sm" loading={reset.isPending} onClick={() => void doReset()}>
                  Сбросить
                </Button>
              </Cluster>
            }
          >
            <p>Сценарии начнутся заново. Тестовые учётки останутся.</p>
          </Alert>
        ) : (
          <Stack gap={0} selfStart>
            <Button onClick={() => setConfirmReset(true)}>Сбросить демо-данные</Button>
          </Stack>
        )}
      </section>

      <section className={`${styles.group} ${styles.dev}`}>
        <h3 className={`label ${styles.heading}`}>Для разработчиков</h3>
        <a className="body-strong" href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          Swagger API бэкенда
        </a>
      </section>
    </Drawer>
  );
}
