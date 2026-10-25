import { useQuery } from '@tanstack/react-query';
import type { SourceId } from '@/entities/application/@x/integration';
import type { Dto } from '@/shared/api';
import { http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import { formatStamp } from '@/shared/lib';
import * as server from '@/mocks/server';
import type { Source, SourceState } from '../model/types';

export const integrationKeys = {
  sources: ['integrations', 'sources'] as const,
  pipeline: ['integrations', 'pipeline'] as const,
  rules: ['integrations', 'rules'] as const,
};

const STATE: Record<Dto.SourceStatus, SourceState> = { ok: 'up', warn: 'slow', fail: 'down', unavailable: 'down' };

function toSource(dto: Dto.SourceHealthOut): Source {
  const ms = dto.avg_response_ms;
  return {
    id: dto.code as SourceId,
    name: dto.name,
    state: STATE[dto.status],
    responseTime: ms === null || ms === undefined ? '—' : `${(ms / 1000).toFixed(1).replace('.', ',')} с`,
    errorsPerHour: dto.errors ?? 0,
    lastSuccess: dto.last_checked_at ? formatStamp(dto.last_checked_at) : 'ещё не было проверок',
    fallbackRule: dto.rule,
  };
}

const listSources = USE_API
  ? async () => (await http<Dto.SourceHealthList>('/bank/sources')).items.map(toSource)
  : () => mockResponse(() => server.listSources());

export function useSources() {
  return useQuery({ queryKey: integrationKeys.sources, queryFn: listSources, refetchInterval: 30_000 });
}

export function usePipelineStats() {
  return useQuery({ queryKey: integrationKeys.pipeline, queryFn: () => mockResponse(() => server.getPipelineStats()) });
}

export function useRulesCatalog() {
  return useQuery({ queryKey: integrationKeys.rules, queryFn: () => mockResponse(() => server.getRulesCatalog()) });
}
