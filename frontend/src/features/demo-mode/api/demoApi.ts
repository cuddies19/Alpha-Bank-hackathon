import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';
import type { DemoSettings } from '@/mocks/db';

const settingsKey = ['demo', 'settings'] as const;

export function useDemoSettings(enabled = true) {
  return useQuery({ queryKey: settingsKey, queryFn: () => mockResponse(() => server.getSettings()), enabled });
}

function useDemoMutation<TInput>(fn: (input: TInput) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => mockResponse(() => fn(input)),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export const useUpdateDemoSettings = () =>
  useDemoMutation((patch: Partial<DemoSettings>) => server.updateSettings(patch));

export const useSetSourceDown = () =>
  useDemoMutation(({ id, down }: { id: string; down: boolean }) => server.setSourceDown(id, down));

export const useApplyScenario = () =>
  useDemoMutation((scenario: server.DemoScenario) => server.applyScenario(scenario));

export function useResetDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => mockResponse(() => server.reset()),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export type { DemoSettings };
