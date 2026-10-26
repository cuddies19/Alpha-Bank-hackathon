function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const features = {
  demo: flag(import.meta.env.VITE_FEATURE_DEMO, import.meta.env.DEV),
} as const;

export type FeatureName = keyof typeof features;

export const demoPassword: string = import.meta.env.VITE_DEMO_PASSWORD ?? '';
