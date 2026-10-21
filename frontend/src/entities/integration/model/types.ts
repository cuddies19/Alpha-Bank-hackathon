import type { SourceId } from '@/entities/application/@x/integration';

export type SourceState = 'up' | 'slow' | 'down';

export interface Source {
  id: SourceId;
  name: string;
  state: SourceState;
  responseTime: string;
  errorsPerHour: number;
  lastSuccess: string;
  fallbackRule: string;
}

export interface PipelineStats {
  period: string;
  metrics: {
    applications: number;
    applicationsDelta: string;
    autoShare: string;
    autoHint: string;
    avgTime: string;
    avgTimeDelta: string;
    waitingClient: number;
  };
  funnel: Array<{ label: string; value: number }>;
  funnelNote: string;
  outcomes: Array<{ label: string; value: number }>;
  declineReasons: Array<{ label: string; value: number }>;
  requestReasons: Array<{ label: string; value: number }>;
}
