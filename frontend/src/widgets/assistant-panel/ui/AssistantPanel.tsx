import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDemoSettings } from '@/features/demo-mode';
import { routes, type AssistantScenario } from '@/shared/config';
import { cx } from '@/shared/lib';
import { Alert, AssistantMark, Button, ChatComposer, ChatMessage, Chip, IconButton, QuickReplies } from '@/shared/ui';
import { useAssistantReply, type AssistantReply } from '../api/assistantApi';
import { ScenarioThread } from './scenarios';
import styles from './AssistantPanel.module.css';

interface LiveMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string[];
  replies?: AssistantReply['replies'];
  time: string;
}

const now = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export interface AssistantPanelProps {
  scenario: AssistantScenario;
  screen: string;
  firstName: string;
  onClose: () => void;
}

export function AssistantPanel({ scenario, screen, firstName, onClose }: AssistantPanelProps) {
  const navigate = useNavigate();
  const settings = useDemoSettings();
  const reply = useAssistantReply();
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [failed, setFailed] = useState<string | null>(null);

  const effectiveScenario: AssistantScenario = settings.data?.assistantMode === 'rules' ? 'simplified' : scenario;

  const send = (text: string) => {
    setFailed(null);
    setMessages((list) => [...list, { id: Date.now(), role: 'user', text: [text], time: now() }]);
    reply.mutate(text, {
      onSuccess: (answer) =>
        setMessages((list) => [
          ...list,
          { id: Date.now() + 1, role: 'assistant', text: answer.text, replies: answer.replies, time: now() },
        ]),
      onError: () => {
        setFailed(text);
        setDraft(text);
      },
    });
  };

  return (
    <aside className={styles.panel} aria-label="Ассистент">
      <div className={styles.head}>
        <AssistantMark size="md" />
        <div className={styles.headText}>
          <span className="title-3">Ассистент</span>
          <span className={cx('body-sm', styles.secondary)}>Видит экран «{screen}»</span>
        </div>
        <IconButton icon="x" label="Свернуть панель ассистента" onClick={onClose} />
      </div>
      <div className={styles.scroll}>
        <div className={styles.thread} aria-live="polite">
          <ScenarioThread scenario={effectiveScenario} firstName={firstName} onReply={send} />
          {messages.map((m) => (
            <div key={m.id} className={styles.thread}>
              <ChatMessage role={m.role} time={m.time}>
                {m.text.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </ChatMessage>
              {m.replies?.length ? (
                <QuickReplies>
                  {m.replies.map((r) => (
                    <Chip key={r.label} onClick={() => navigate(r.to)}>
                      {r.label}
                    </Chip>
                  ))}
                </QuickReplies>
              ) : null}
            </div>
          ))}
          {reply.isPending ? <ChatMessage role="assistant" typing /> : null}
          {failed ? (
            <Alert
              tone="danger"
              title="Сообщение не отправлено"
              action={
                <Button size="sm" onClick={() => send(failed)}>
                  Повторить
                </Button>
              }
            >
              <p>Нет связи с сервером. Проверьте интернет и повторите — текст сохранён.</p>
            </Alert>
          ) : null}
        </div>
      </div>
      <div className={styles.composer}>
        <ChatComposer
          value={draft}
          onChange={setDraft}
          onSend={send}
          onAttach={() => navigate(routes.client.documents())}
          disabled={reply.isPending}
          hint="Ассистент помогает с выбором. Решение по заявке принимает банк."
        />
      </div>
    </aside>
  );
}
