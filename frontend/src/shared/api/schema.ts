export type ActorType = 'client' | 'system' | 'underwriter';

export interface ApplicationCreate {
  product_id: number;
  amount: number;
  term_months: number;
  purpose: string;
  task_code?: string | null;
  needed_by?: string | null;
  repayment_source?: string | null;
  consents?: Record<string, boolean>;
}

export interface ApplicationDetail {
  id: number;
  number: string;
  company: CompanyOut;
  product: ProductOut;
  amount: number;
  term_months: number;
  purpose: string;
  task_code?: string | null;
  needed_by?: string | null;
  repayment_source?: string | null;
  consents?: Record<string, unknown>;
  status: ApplicationStatus;
  status_label: string;
  labels?: Array<string>;
  created_at: string;
  submitted_at?: string | null;
  decided_at?: string | null;
  taken_by_name?: string | null;
  documents?: Array<DocumentOut>;
  decision?: ClientDecisionOut | null;
  stages?: Array<StatusStageOut>;
  history?: Array<HistoryItemOut>;
}

export interface ApplicationList {
  items: Array<ApplicationListItem>;
  total: number;
}

export interface ApplicationListItem {
  id: number;
  number: string;
  company_id: number;
  company_name: string;
  product_id: number;
  product_name: string;
  amount: number;
  term_months: number;
  status: ApplicationStatus;
  status_label: string;
  labels?: Array<string>;
  created_at: string;
  submitted_at?: string | null;
  decided_at?: string | null;
  taken_by_name?: string | null;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'manual_review'
  | 'client_action'
  | 'approved'
  | 'counter_offer'
  | 'rejected'
  | 'signing'
  | 'signed'
  | 'issued'
  | 'client_declined'
  | 'withdrawn';

export interface ApplicationUpdate {
  product_id?: number | null;
  amount?: number | null;
  term_months?: number | null;
  purpose?: string | null;
  task_code?: string | null;
  needed_by?: string | null;
  repayment_source?: string | null;
  consents?: Record<string, boolean> | null;
}

export interface AuditItemOut {
  id: number;
  created_at: string;
  actor_type: ActorType;
  actor_name: string;
  action: string;
  application_id?: number | null;
  application_number?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export interface AuditList {
  items: Array<AuditItemOut>;
  total: number;
}

export interface BankApplicationDetail {
  id: number;
  number: string;
  company: CompanyOut;
  product: ProductOut;
  amount: number;
  term_months: number;
  purpose: string;
  task_code?: string | null;
  needed_by?: string | null;
  repayment_source?: string | null;
  consents?: Record<string, unknown>;
  status: ApplicationStatus;
  status_label: string;
  labels?: Array<string>;
  created_at: string;
  submitted_at?: string | null;
  decided_at?: string | null;
  taken_by_name?: string | null;
  documents?: Array<DocumentOut>;
  checks?: Array<SourceCheckOut>;
  score?: ScoreOut | null;
  rules?: Array<RuleResultOut>;
  decision?: BankDecisionOut | null;
  recommendation?: string | null;
  recommendation_reason?: string | null;
  stages?: Array<StatusStageOut>;
  history?: Array<HistoryItemOut>;
}

export interface BankDecisionOut {
  outcome: DecisionOutcome;
  outcome_label: string;
  amount?: number | null;
  term_months?: number | null;
  rate?: number | null;
  monthly_payment?: number | null;
  requested_documents?: Array<string>;
  client_message?: string | null;
  decline_reason?: string | null;
  internal_comment?: string | null;
  decided_by_name?: string | null;
  decided_at: string;
}

export interface BankQueueItem {
  id: number;
  number: string;
  company_id: number;
  company_name: string;
  inn: string;
  product_id: number;
  product_name: string;
  amount: number;
  term_months: number;
  risk_class?: string | null;
  recommendation?: string | null;
  recommendation_reason?: string | null;
  stage: string;
  status: ApplicationStatus;
  status_label: string;
  tags?: Array<string>;
  taken_by_name?: string | null;
  created_at: string;
  submitted_at?: string | null;
}

export interface BankQueueResponse {
  items: Array<BankQueueItem>;
  total: number;
  counters: QueueCounters;
}

export interface Body_upload_document_applications__application_id__documents_post {
  file: string;
  doc_type?: string;
}

export interface CalculatorResponse {
  amount: number;
  term_months: number;
  rate: number;
  monthly_payment: number;
  total_payment: number;
  total_interest: number;
  product_id?: number | null;
  product_name?: string | null;
}

export interface CashflowMonth {
  month: string;
  inflows: number;
  outflows: number;
  net_flow: number;
  balance: number;
}

export interface CashflowResponse {
  balance: number;
  inflows: number;
  net_flow: number;
  loan_payments: number;
  months: Array<CashflowMonth>;
}

export interface ChatAction {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
}

export interface ChatRequest {
  message: string;
  screen?: string | null;
  application_id?: number | null;
}

export interface ChatResponse {
  message: string;
  suggestions?: Array<string>;
  actions?: Array<ChatAction>;
  disclaimer?: string;
}

export interface ClientDecisionOut {
  outcome: DecisionOutcome;
  outcome_label: string;
  amount?: number | null;
  term_months?: number | null;
  rate?: number | null;
  monthly_payment?: number | null;
  requested_documents?: Array<string>;
  client_message?: string | null;
  decline_reason?: string | null;
  decided_at: string;
}

export interface CompanyOut {
  id: number;
  inn: string;
  ogrn: string;
  type: CompanyType;
  name: string;
  registration_date?: string | null;
  okved?: string | null;
  address?: string | null;
  director?: string | null;
  phone?: string | null;
}

export type CompanyType = 'ООО' | 'ИП';

export type DecisionOutcome = 'approve' | 'counter' | 'request' | 'decline';

export interface DecisionRequest {
  outcome: DecisionOutcome;
  amount?: number | null;
  term_months?: number | null;
  rate?: number | null;
  requested_documents?: Array<string>;
  client_message?: string | null;
  decline_reason?: string | null;
  internal_comment?: string | null;
}

export interface DeclineRequest {
  reason?: string | null;
}

export interface DemoSourceRequest {
  status?: string | null;
  latency_ms?: number | null;
}

export interface DemoSpeedRequest {
  multiplier?: number;
}

export interface DemoStateResponse {
  sources: Record<string, string>;
  speed: number;
  applications: number;
  reset_available?: boolean;
}

export interface DocumentOut {
  id: number;
  doc_type: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  status: DocumentStatus;
  uploaded_by_id: number;
  uploaded_at: string;
}

export type DocumentStatus = 'uploaded' | 'accepted' | 'rejected';

export interface HTTPValidationError {
  detail?: Array<ValidationError>;
}

export interface HistoryItemOut {
  from_status: ApplicationStatus;
  to_status: ApplicationStatus;
  from_label: string;
  to_label: string;
  actor_type: ActorType;
  actor_name: string;
  comment?: string | null;
  created_at: string;
}

export interface LoanOut {
  id: number;
  application_id: number;
  application_number: string;
  product_name: string;
  amount: number;
  term_months: number;
  rate: number;
  monthly_payment: number;
  issued_at: string;
  schedule?: Array<LoanScheduleItem>;
}

export interface LoanScheduleItem {
  number: number;
  date: string;
  amount: number;
  principal: number;
  interest: number;
  remaining: number;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface NotificationList {
  items: Array<NotificationOut>;
  unread: number;
}

export interface NotificationOut {
  id: number;
  application_id?: number | null;
  text: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export type NotificationType = 'status_change' | 'decision' | 'document_request' | 'info';

export interface ProductOut {
  id: number;
  code: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  rate: number;
  requires_collateral: boolean;
  decision_time?: string | null;
  features?: Array<string>;
}

export interface QueueCounters {
  new?: number;
  pipeline?: number;
  manual?: number;
  client?: number;
  decided?: number;
}

export interface RecommendationItem {
  product_id: number;
  product_code: string;
  product_name: string;
  amount: number;
  term_months: number;
  rate: number;
  monthly_payment: number;
  match_score: number;
  reason: string;
}

export interface RecommendationRequest {
  task: string;
  amount?: number | null;
  term_months?: number | null;
  product_id?: number | null;
}

export interface RecommendationResponse {
  items: Array<RecommendationItem>;
  summary: string;
}

export interface RuleResultOut {
  code: string;
  value: string;
  threshold: string;
  passed: boolean;
  comment?: string | null;
}

export interface ScoreFeatures {
  business_age_months: number;
  income_last_year_rub: number;
  tax_debt_rub: number;
  max_overdue_days_12m: number;
  max_overdue_days_24m: number;
  inquiries_30d: number;
  avg_net_flow_rub: number;
  marketplace_share: number;
  revenue_to_other_bank: boolean;
  monthly_payments_rub: number;
}

export interface ScoreOut {
  score: number;
  risk_class: string;
  model_version: string;
  factors?: Array<Record<string, unknown>>;
  created_at: string;
}

export interface ScoreRequest {
  inn: string;
  features: ScoreFeatures;
}

export interface ScoreResponse {
  score: number;
  risk_class: string;
}

export interface SignRequest {
  code?: string | null;
}

export interface SourceCheckOut {
  id: number;
  source: string;
  source_label: string;
  status: SourceStatus;
  response?: Record<string, unknown>;
  response_time_ms: number;
  attempts: number;
  checked_at: string;
}

export interface SourceHealthList {
  items: Array<SourceHealthOut>;
}

export interface SourceHealthOut {
  code: string;
  name: string;
  status: SourceStatus;
  avg_response_ms?: number | null;
  errors?: number;
  last_checked_at?: string | null;
  rule: string;
}

export type SourceStatus = 'ok' | 'warn' | 'fail' | 'unavailable';

export interface StatusStageOut {
  key: string;
  title: string;
  status: string;
  at?: string | null;
  description?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
  user: UserOut;
}

export interface UserOut {
  id: number;
  login: string;
  full_name: string;
  role: UserRole;
  company?: CompanyOut | null;
}

export type UserRole = 'client' | 'underwriter';

export interface ValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface WithdrawRequest {
  reason?: string | null;
}
