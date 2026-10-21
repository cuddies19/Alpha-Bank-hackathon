import { useMutation } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export type AssistantReply = server.AssistantReply;

const THINKING_MS = 900;

export function useAssistantReply() {
  return useMutation({
    mutationFn: async (message: string) => {
      await new Promise((resolve) => setTimeout(resolve, THINKING_MS));
      return mockResponse(() => server.assistantReply(message));
    },
  });
}
