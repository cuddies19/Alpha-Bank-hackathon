import type { ConsentId } from '@/entities/company/@x/application';
import type { ProductId } from '@/entities/product/@x/application';
import type { DocStatus, IconName, ProductParam, Reason, Tone, TrackerStage } from '@/shared/ui';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'completeness_check'
  | 'needs_info'
  | 'enrichment'
  | 'scoring'
  | 'rules'
  | 'manual_review'
  | 'approved'
  | 'rejected'
  | 'counter_offer'
  | 'issued';

export type RiskClass = 'A' | 'B' | 'C' | 'D' | 'E';

export type DecisionOutcome = 'approve' | 'counter' | 'request' | 'decline';

export interface ApplicationDocument {
  id: string;
  title: string;
  note: string;
  required: boolean;
  status: DocStatus | 'missing';
  fileName?: string;
  size?: string;
  progress?: number;
  message?: string;
}

export interface ApplicationEvent {
  id: string;
  text: string;
  time: string;
  icon: IconName;
}

export interface RequestedDocument {
  id: string;
  title: string;
  note: string;
  status: DocStatus | 'missing';
  fileName?: string;
  size?: string;
  progress?: number;
}

export interface Decision {
  outcome: DecisionOutcome;
  decidedAt: string;
  decidedBy: 'auto' | string;
  amount: number;
  term: number;
  rate: number;
  payment: number;
  requested?: { amount: number; term: number; payment: number; share: number };
  share?: number;
  firstPayment?: string;
  firstPaymentDate?: string;
  validUntil?: string;
  summary?: string;
  reasons: Reason[];
  requestedDocs?: RequestedDocument[];
  deadline?: string;
  message?: string;
  declineReason?: string;
  declineDetails?: string;
  alternative?: {
    name: string;
    purpose: string;
    amountLabel: string;
    amount: number;
    params: ProductParam[];
    note: string;
  };
  improvePlan?: string[];
  reapplyAfter?: string;
}

export type TimelineStep = 'submitted' | 'checked' | 'enriched' | 'scored' | 'review' | 'decided' | 'signed' | 'issued';

export type ClosedReason = 'withdrawn' | 'client_declined';

export interface QueueTag {
  label: string;
  tone: Tone;
  icon?: IconName | false;
}

export type SlaLevel = 'ok' | 'warn' | 'late';

export interface Application {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  inn: string;
  productId: ProductId;
  productName: string;
  amount: number;
  term: number;
  rate: number;
  payment: number;
  cashFlow: number;
  goal: string;
  quote?: string;
  neededBy: string;
  repaymentSource: string;
  pledge: boolean;
  status: ApplicationStatus;
  createdAt: string;
  submittedAt?: string;
  submittedAtMs?: number;
  reviewStartedMs?: number;
  draftStep?: number;
  draftSavedAt?: string;
  consents: Record<ConsentId, string | null>;
  documents: ApplicationDocument[];
  timeline: Partial<Record<TimelineStep, string>>;
  stages?: TrackerStage[];
  recheckingDocuments?: boolean;
  events: ApplicationEvent[];
  decision?: Decision;
  sourceIssue?: string;
  closedReason?: ClosedReason;
  riskClass?: RiskClass;
  recommendation?: DecisionOutcome;
  assignee?: string;
  sla?: { text: string; level: SlaLevel };
  tags?: QueueTag[];
  isNew?: boolean;
}

export interface DraftInput {
  productId: ProductId;
  amount: number;
  term: number;
  goal?: string;
  neededBy?: string;
  repaymentSource?: string;
}

export type CheckStatus = 'ok' | 'warn' | 'fail';
export type SourceId = 'egrul' | 'fns' | 'bki' | 'statement' | 'scoring';

export interface SourceCheck {
  id: SourceId;
  name: string;
  status: CheckStatus;
  summary: string;
  time: string;
  details: Array<{ term: string; details: string }>;
  note?: { title: string; text: string };
}

export interface ScoringFactor {
  label: string;
  value: number;
}

export interface ProductRuleResult {
  rule: string;
  value: string;
  threshold: string;
  passed: boolean;
}

export interface CaseHistoryEntry {
  id: string;
  time: string;
  what: string;
  detail: string;
  actor: 'Система' | 'Клиент' | 'Сотрудник';
}

export interface CaseDocument {
  id: string;
  name: string;
  meta: string;
  status: string;
  tone: Tone;
  who: string;
  when: string;
}

export interface ApplicationCase {
  application: Application;
  cashFlow: number;
  recommendation: { outcome: DecisionOutcome; text: string; amount: number; term: number; share: number };
  scoring: {
    score: number;
    riskClass: RiskClass;
    riskLabel: string;
    pd: string;
    model: string;
    calculatedAt: string;
    factors: ScoringFactor[];
  } | null;
  rules: ProductRuleResult[];
  rulesSummary: { tone: 'success' | 'warning' | 'danger'; title: string; text: string };
  checks: SourceCheck[];
  checksAt: string;
  client: {
    rows: Array<{ term: string; details: string }>;
    director: Array<{ term: string; details: string }>;
    turnover: Array<{ label: string; income: number; outcome: number }>;
    turnoverStats: Array<{ term: string; details: string; tone?: 'warning' }>;
    obligations: Array<{
      creditor: string;
      kind: string;
      rest: number;
      payment: number;
      until: string;
      source: string;
    }>;
  };
  history: CaseHistoryEntry[];
  documents: CaseDocument[];
  documentsComplete: boolean;
  decided: boolean;
}

export interface DecisionInput {
  applicationId: string;
  outcome: DecisionOutcome;
  amount: number;
  term: number;
  rate: number;
  requestedDocs: string[];
  message: string;
  declineReason: string;
  comment: string;
}

export type DraftPatch = Partial<
  Pick<Application, 'amount' | 'term' | 'goal' | 'neededBy' | 'repaymentSource' | 'draftStep'>
> & { consents?: Partial<Record<ConsentId, boolean>>; contactName?: string; phone?: string };

export interface UploadInput {
  applicationId: string;
  documentId?: string;
  name: string;
  size: string;
  file?: File;
}

export type BankStage = 'pipeline' | 'manual' | 'client' | 'decided';

export interface QueueItem extends Application {
  bankStage: BankStage;
}

export interface SigningFile {
  id: string;
  title: string;
  meta: string;
}
