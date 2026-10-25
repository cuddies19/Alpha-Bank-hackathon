export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const MOCK_LATENCY_MS = { min: 180, max: 420 };

export async function mockResponse<T>(produce: () => T): Promise<T> {
  const ms = MOCK_LATENCY_MS.min + Math.random() * (MOCK_LATENCY_MS.max - MOCK_LATENCY_MS.min);
  await new Promise((resolve) => setTimeout(resolve, ms));
  return structuredClone(produce());
}
