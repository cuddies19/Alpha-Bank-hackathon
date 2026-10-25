export type AuditActor = 'system' | 'staff' | 'client';

export type AuditKind = 'created' | 'updated' | 'taken' | 'decision' | 'document' | 'status' | 'other';

export type AuditTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface AuditField {
  label: string;
  before?: string;
  after?: string;
  beforeTone?: AuditTone;
  afterTone?: AuditTone;
  long?: boolean;
}

export interface AuditEvent {
  id: string;
  kind: AuditKind;
  time: string;
  who: string;
  role: string;
  actor: AuditActor;
  applicationId: string;
  applicationRef?: string;
  action: string;
  change: string;
  details: AuditField[];
}
