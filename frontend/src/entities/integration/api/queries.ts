import { useQuery } from '@tanstack/react-query';
import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export const integrationKeys = {
  sources: ['integrations', 'sources'] as const,
  pipeline: ['integrations', 'pipeline'] as const,
  rules: ['integrations', 'rules'] as const,
};

export function useSources() {
  return useQuery({
    queryKey: integrationKeys.sources,
    queryFn: () => mockResponse(() => server.listSources()),
    refetchInterval: 30_000,
  });
}

export function usePipelineStats() {
  return useQuery({ queryKey: integrationKeys.pipeline, queryFn: () => mockResponse(() => server.getPipelineStats()) });
}

export function useRulesCatalog() {
  return useQuery({ queryKey: integrationKeys.rules, queryFn: () => mockResponse(() => server.getRulesCatalog()) });
}
