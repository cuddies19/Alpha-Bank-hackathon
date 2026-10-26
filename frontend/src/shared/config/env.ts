export type ApiMode = 'api' | 'mock';

export const API_MODE: ApiMode = import.meta.env.VITE_API_MODE === 'mock' ? 'mock' : 'api';
export const USE_API = API_MODE === 'api';
