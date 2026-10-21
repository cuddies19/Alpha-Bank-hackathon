import type { Tone } from '@/shared/ui';

export interface ClientDocument {
  id: string;
  name: string;
  meta: string;
  applicationId: string;
  date: string;
  status: string;
  tone: Tone;
  replaceable?: boolean;
  documentId?: string;
}

export interface SigningDocument {
  id: string;
  title: string;
  meta: string;
}
