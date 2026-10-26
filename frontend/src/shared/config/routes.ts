export const routes = {
  login: () => '/login',

  client: {
    home: () => '/client',
    financing: () => '/client/financing',
    financingDialog: () => '/client/financing/dialog',
    financingGoal: () => '/client/financing/goal',
    offers: () => '/client/financing/offers',
    catalog: () => '/client/catalog',
    applications: () => '/client/applications',
    application: (id: string) => `/client/applications/${id}`,
    applicationForm: (id: string, step: ApplicationFormStep = 'parameters') =>
      `/client/applications/${id}/form/${step}`,
    applicationSent: (id: string) => `/client/applications/${id}/sent`,
    decision: (id: string) => `/client/applications/${id}/decision`,
    sign: (id: string) => `/client/applications/${id}/sign`,
    issued: (id: string) => `/client/applications/${id}/issued`,
    loans: () => '/client/loans',
    documents: () => '/client/documents',
    notifications: () => '/client/notifications',
    profile: () => '/client/profile',
  },

  bank: {
    queue: () => '/bank',
    applications: () => '/bank/applications',
    application: (id: string, tab: CaseTab = 'summary') =>
      tab === 'summary' ? `/bank/applications/${id}` : `/bank/applications/${id}/${tab}`,
    pipeline: () => '/bank/pipeline',
    integrations: () => '/bank/integrations',
    audit: () => '/bank/audit',
    rules: () => '/bank/rules',
  },
} as const;

export const APPLICATION_FORM_STEPS = ['parameters', 'company', 'finance', 'review'] as const;
export type ApplicationFormStep = (typeof APPLICATION_FORM_STEPS)[number];

export const CASE_TABS = ['summary', 'client', 'checks', 'risk', 'documents', 'history'] as const;
export type CaseTab = (typeof CASE_TABS)[number];
