export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const MOCK_LATENCY_MS = { min: 180, max: 420 };

export async function mockResponse<T>(produce: () => T): Promise<T> {
  const ms = MOCK_LATENCY_MS.min + Math.random() * (MOCK_LATENCY_MS.max - MOCK_LATENCY_MS.min);
  await new Promise((resolve) => setTimeout(resolve, ms));
  return structuredClone(produce());
}
