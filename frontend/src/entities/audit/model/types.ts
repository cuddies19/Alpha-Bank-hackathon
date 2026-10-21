export type AuditActor = 'system' | 'staff' | 'client';

export interface AuditEvent {
  id: string;
  time: string;
  who: string;
  role: string;
  actor: AuditActor;
  applicationId: string;
  action: string;
  change: string;
}
