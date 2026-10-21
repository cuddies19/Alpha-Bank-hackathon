import { createContext, useContext } from 'react';

export interface AssistantPanelValue {
  open: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export const AssistantPanelContext = createContext<AssistantPanelValue | null>(null);

export function useAssistantPanel(): AssistantPanelValue {
  const value = useContext(AssistantPanelContext);
  if (!value) throw new Error('useAssistantPanel: панель ассистента доступна только в кабинете клиента');
  return value;
}
