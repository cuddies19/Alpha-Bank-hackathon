import { useMutation } from '@tanstack/react-query';
import type { Dto } from '@/shared/api';
import { http, mockResponse } from '@/shared/api';
import { USE_API, routes } from '@/shared/config';
import * as server from '@/mocks/server';

export type AssistantReply = server.AssistantReply;

const THINKING_MS = 900;

const ACTION_ROUTE: Record<string, string> = {
  open_calculator: routes.client.offers(),
  open_documents: routes.client.documents(),
  open_financing: routes.client.financing(),
  open_applications: routes.client.applications(),
};

async function apiReply(message: string): Promise<AssistantReply> {
  const response = await http<Dto.ChatResponse>('/assistant/chat', {
    method: 'POST',
    body: { message, screen: window.location.pathname },
  });
  return {
    text: [response.message, ...(response.disclaimer ? [response.disclaimer] : [])],
    replies: (response.actions ?? [])
      .filter((a) => ACTION_ROUTE[a.type])
      .map((a) => ({ label: a.label, to: ACTION_ROUTE[a.type] })),
  };
}

export function useAssistantReply() {
  return useMutation({
    mutationFn: async (message: string) => {
      if (USE_API && server.getSettings().assistantMode === 'model') return apiReply(message);
      await new Promise((resolve) => setTimeout(resolve, THINKING_MS));
      return mockResponse(() => server.assistantReply(message));
    },
  });
}
