import { http } from './http';
import { queryClient } from './queryClient';

const STALE_MS = 60_000;

export function cachedGet<T>(path: string): Promise<T> {
  return queryClient.fetchQuery({
    queryKey: ['http-cache', path],
    queryFn: () => http<T>(path),
    staleTime: STALE_MS,
  });
}
