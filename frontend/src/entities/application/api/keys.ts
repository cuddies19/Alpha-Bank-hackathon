export const applicationKeys = {
  all: ['applications'] as const,
  list: (companyId: string) => ['applications', 'list', companyId] as const,
  detail: (id: string) => ['applications', 'detail', id] as const,
  queue: () => ['applications', 'queue'] as const,
  case: (id: string) => ['applications', 'case', id] as const,
  signing: (id: string) => ['applications', 'signing', id] as const,
};
