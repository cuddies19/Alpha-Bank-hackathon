import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSession } from '@/entities/session';
import { useDemoSettings } from '@/features/demo-mode';
import { USE_API, routes, type AssistantScenario } from '@/shared/config';
import { cx } from '@/shared/lib';
import {
  Alert,
  AssistantMark,
  Button,
  ChatComposer,
  ChatEnter,
  ChatMessage,
  Chip,
  IconButton,
  QuickReplies,
} from '@/shared/ui';
import { useAssistantReply } from '../api/assistantApi';
import { appendChatEntry, useChatHistory, type ChatEntry } from '../model/chatHistory';
import { useStreamedText } from '../lib/useStreamedText';
import { ScenarioThread } from './scenarios';
import styles from './AssistantPanel.module.css';

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
  const user = useSession().persona?.login ?? 'guest';
  const messages = useChatHistory(user);
  const [openedAt] = useState(() => Date.now());
  const [draft, setDraft] = useState('');
  const [failed, setFailed] = useState<string | null>(null);

  const effectiveScenario: AssistantScenario =
    settings.data?.assistantMode === 'rules' ? 'simplified' : USE_API && scenario === 'dialog' ? 'start' : scenario;

  const send = (text: string) => {
    setFailed(null);
    appendChatEntry(user, { id: Date.now(), role: 'user', text: [text], time: now() });
    reply
      .mutateAsync(text)
      .then((answer) =>
        appendChatEntry(user, {
          id: Date.now() + 1,
          role: 'assistant',
          text: answer.text,
          replies: answer.replies,
          time: now(),
        }),
      )
      .catch(() => {
        setFailed(text);
        setDraft(text);
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
            <LiveMessageView key={m.id} message={m} fresh={m.id >= openedAt} onNavigate={navigate} />
          ))}
          {reply.isPending ? <ChatMessage role="assistant" typing animate /> : null}
          {failed ? (
            <ChatEnter>
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
            </ChatEnter>
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

interface LiveMessageViewProps {
  message: ChatEntry;
  fresh: boolean;
  onNavigate: (to: string) => void;
}

function LiveMessageView({ message, fresh, onNavigate }: LiveMessageViewProps) {
  const streamed = useStreamedText(message.text, fresh && message.role === 'assistant');
  return (
    <div className={styles.thread}>
      <ChatMessage role={message.role} time={streamed.done ? message.time : undefined} animate={fresh}>
        {streamed.done ? (
          message.text.map((line, index) => <p key={index}>{line}</p>)
        ) : (
          <>
            <span className="sr-only">{message.text.join(' ')}</span>
            <div aria-hidden="true">
              {streamed.lines.map((line, index) => (line ? <p key={index}>{line}</p> : null))}
            </div>
          </>
        )}
      </ChatMessage>
      {streamed.done && message.replies?.length ? (
        <ChatEnter>
          <QuickReplies>
            {message.replies.map((r) => (
              <Chip key={r.label} onClick={() => onNavigate(r.to)}>
                {r.label}
              </Chip>
            ))}
          </QuickReplies>
        </ChatEnter>
      ) : null}
    </div>
  );
}
