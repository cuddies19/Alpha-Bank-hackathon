import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Dto } from '@/shared/api';
import { http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import * as server from '@/mocks/server';
import type { DemoSettings } from '@/mocks/db';

const settingsKey = ['demo', 'settings'] as const;
const FAST_MULTIPLIER = 20;

type Settings = DemoSettings & { sources: Array<{ id: string; name: string; down: boolean }> };

async function apiSettings(): Promise<Settings> {
  const state = await http<Dto.DemoStateResponse>('/demo/state', { auth: false });
  const names = Object.fromEntries(server.getSettings().sources.map((s) => [s.id, s.name]));
  return {
    pipelineSpeed: state.speed > 1 ? 'fast' : 'normal',
    assistantMode: server.getSettings().assistantMode,
    sources: Object.entries(state.sources).map(([id, status]) => ({
      id,
      name: names[id] ?? id,
      down: status !== 'ok',
    })),
  };
}

const demoApi = USE_API
  ? {
      settings: apiSettings,
      update: async (patch: Partial<DemoSettings>) => {
        if (patch.assistantMode) server.updateSettings({ assistantMode: patch.assistantMode });
        if (patch.pipelineSpeed) {
          await http('/demo/speed', {
            method: 'POST',
            body: { multiplier: patch.pipelineSpeed === 'fast' ? FAST_MULTIPLIER : 1 },
            auth: false,
          });
        }
      },
      setSourceDown: async ({ id, down }: { id: string; down: boolean }) => {
        await http(`/demo/sources/${id}`, {
          method: 'POST',
          body: { status: down ? 'unavailable' : 'ok' },
          auth: false,
        });
      },
      applyScenario: async (_scenario: server.DemoScenario) => {},
      reset: async () => {
        await http('/demo/reset', { method: 'POST', auth: false });
        server.reset();
      },
    }
  : {
      settings: () => mockResponse(() => server.getSettings()),
      update: (patch: Partial<DemoSettings>) => mockResponse(() => server.updateSettings(patch)),
      setSourceDown: ({ id, down }: { id: string; down: boolean }) =>
        mockResponse(() => server.setSourceDown(id, down)),
      applyScenario: (scenario: server.DemoScenario) => mockResponse(() => server.applyScenario(scenario)),
      reset: () => mockResponse(() => server.reset()),
    };

export const demoScenariosAvailable = !USE_API;

export function useDemoSettings(enabled = true) {
  return useQuery({ queryKey: settingsKey, queryFn: demoApi.settings, enabled });
}

function useDemoMutation<TInput>(fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export const useUpdateDemoSettings = () => useDemoMutation(demoApi.update);

export const useSetSourceDown = () => useDemoMutation(demoApi.setSourceDown);

export const useApplyScenario = () => useDemoMutation(demoApi.applyScenario);

export function useResetDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: demoApi.reset,
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export type { DemoSettings };
