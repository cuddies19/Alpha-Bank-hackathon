interface ImportMetaEnv {
  readonly VITE_API_MODE?: 'api' | 'mock';
  readonly VITE_FEATURE_DEMO?: string;
  readonly VITE_DEMO_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
