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

function actionRoute(action: Dto.ChatAction): string | undefined {
  if (action.type === 'open_application') {
    const id = action.payload?.application_id;
    return id === undefined || id === null ? undefined : routes.client.application(String(id));
  }
  return ACTION_ROUTE[action.type];
}

function currentApplicationId(): number | null {
  const match = window.location.pathname.match(/\/applications\/(\d+)/);
  return match ? Number(match[1]) : null;
}

async function apiReply(message: string): Promise<AssistantReply> {
  const response = await http<Dto.ChatResponse>('/assistant/chat', {
    method: 'POST',
    body: { message, screen: window.location.pathname, application_id: currentApplicationId() },
  });
  return {
    text: [response.message, ...(response.disclaimer ? [response.disclaimer] : [])],
    replies: (response.actions ?? []).flatMap((action) => {
      const to = actionRoute(action);
      return to ? [{ label: action.label, to }] : [];
    }),
  };
}

export function useAssistantReply() {
  return useMutation({
    mutationFn: async (message: string) => {
      if (USE_API) return apiReply(message);
      await new Promise((resolve) => setTimeout(resolve, THINKING_MS));
      return mockResponse(() => server.assistantReply(message));
    },
  });
}
