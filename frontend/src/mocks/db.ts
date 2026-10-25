import type { Application } from '@/entities/application';
import type { AuditEvent } from '@/entities/audit';

export type MockAuditEvent = Omit<AuditEvent, 'details' | 'applicationRef' | 'kind'>;
import type { ConsentId, NotificationPref } from '@/entities/company';
import type { ClientDocument } from '@/entities/document';
import type { Source } from '@/entities/integration';
import type { Loan } from '@/entities/loan';
import type { AppNotification } from '@/entities/notification';
import { seedApplications } from './data/applications';
import { seedAudit, seedSources } from './data/bank';
import { seedNotifications } from './data/client';
import { DEFAULT_PREFS } from './data/companies';

export interface DemoSettings {
  pipelineSpeed: 'normal' | 'fast';
  assistantMode: 'model' | 'rules';
}

export interface Db {
  applications: Application[];
  notifications: Record<string, AppNotification[]>;
  loans: Record<string, Loan[]>;
  extraDocuments: Record<string, ClientDocument[]>;
  uploads: Record<string, number>;
  sources: Source[];
  audit: MockAuditEvent[];
  prefs: Record<string, NotificationPref[]>;
  revokedConsents: Record<string, ConsentId[]>;
  settings: DemoSettings;
}

const STORAGE_KEY = 'kk-mock-db-v1';

function createDb(): Db {
  return {
    applications: seedApplications(),
    notifications: seedNotifications(),
    loans: {},
    extraDocuments: {},
    uploads: {},
    sources: seedSources(),
    audit: seedAudit(),
    prefs: {},
    revokedConsents: {},
    settings: { pipelineSpeed: 'normal', assistantMode: 'model' },
  };
}

function load(): Db {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {}
  return createDb();
}

export const db: Db = load();

export function save() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {}
}

export function resetDb() {
  Object.assign(db, createDb());
  save();
}

export function prefsFor(companyId: string): NotificationPref[] {
  return (db.prefs[companyId] ??= structuredClone(DEFAULT_PREFS));
}

export function notificationsFor(companyId: string): AppNotification[] {
  return (db.notifications[companyId] ??= []);
}
