import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isProcessing } from '../lib/status';
import type { Application, DecisionInput, DraftInput } from '../model/types';
import { applicationApi, type DraftPatch, type UploadInput } from './applicationApi';
import { applicationKeys } from './keys';

const POLL_MS = 1_500;

function needsPolling(app: Application | undefined) {
  if (!app) return false;
  const uploading = (s: string) => s === 'uploading' || s === 'checking';
  return (
    isProcessing(app.status) ||
    app.documents.some((d) => uploading(d.status)) ||
    Boolean(app.decision?.requestedDocs?.some((d) => uploading(d.status)))
  );
}

export function useCompanyApplications(companyId: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.list(companyId ?? ''),
    queryFn: () => applicationApi.listForCompany(companyId!),
    enabled: Boolean(companyId),
    refetchInterval: (query) => (query.state.data?.some(needsPolling) ? POLL_MS : false),
  });
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.detail(id ?? ''),
    queryFn: () => applicationApi.get(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => (needsPolling(query.state.data) ? POLL_MS : false),
  });
}

export function useApplicationQueue() {
  return useQuery({
    queryKey: applicationKeys.queue(),
    queryFn: applicationApi.queue,
    refetchInterval: 5_000,
  });
}

export function useApplicationCase(id: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.case(id ?? ''),
    queryFn: () => applicationApi.getCase(id!),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data && isProcessing(query.state.data.application.status) ? POLL_MS : false,
  });
}

export function useSigningDocuments(id: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.signing(id ?? ''),
    queryFn: () => applicationApi.signingDocuments(id!),
    enabled: Boolean(id),
  });
}

export interface MutationHandlers {
  onSuccess?: (app: Application) => void;
}

interface Optimistic<TInput> {
  id: string;
  apply: (app: Application, input: TInput) => Application;
}

function useApplicationMutation<TInput>(
  mutationFn: (input: TInput) => Promise<Application>,
  handlers: MutationHandlers = {},
  optimistic?: Optimistic<TInput>,
) {
  const queryClient = useQueryClient();
  const mutationKey = optimistic ? ['application-mutation', optimistic.id] : undefined;
  const othersPending = () => (mutationKey ? queryClient.isMutating({ mutationKey }) > 1 : false);

  return useMutation({
    mutationKey,
    mutationFn,
    onMutate: async (input: TInput) => {
      if (!optimistic) return undefined;
      const key = applicationKeys.detail(optimistic.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Application>(key);
      if (previous) queryClient.setQueryData(key, optimistic.apply(previous, input));
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (optimistic && context?.previous && !othersPending()) {
        queryClient.setQueryData(applicationKeys.detail(optimistic.id), context.previous);
      }
    },
    onSuccess: (app) => {
      handlers.onSuccess?.(app);
      if (othersPending()) return;
      queryClient.setQueryData(applicationKeys.detail(app.id), app);
      for (const queryKey of [
        applicationKeys.all,
        ['notifications'],
        ['documents'],
        ['loans'],
        ['audit'],
        ['company'],
      ]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export const useCreateDraft = (companyId: string, handlers?: MutationHandlers) =>
  useApplicationMutation((input: DraftInput) => applicationApi.createDraft(companyId, input), handlers);

export const useUpdateDraft = (id: string, handlers?: MutationHandlers) =>
  useApplicationMutation((patch: DraftPatch) => applicationApi.updateDraft(id, patch), handlers, {
    id,
    apply: (app, { consents, ...fields }) => ({
      ...app,
      ...fields,
      consents: consents
        ? (Object.fromEntries(
            Object.entries(app.consents).map(([key, value]) => {
              const next = consents[key as keyof typeof consents];
              return [key, next === undefined ? value : next ? (value ?? 'только что') : null];
            }),
          ) as Application['consents'])
        : app.consents,
    }),
  });

export const useUploadDocument = () =>
  useApplicationMutation((input: UploadInput) => applicationApi.uploadDocument(input));

export const useRemoveDocument = (applicationId: string) =>
  useApplicationMutation((documentId: string) => applicationApi.removeDocument(applicationId, documentId));

export const useSubmitApplication = (handlers?: MutationHandlers) =>
  useApplicationMutation((id: string) => applicationApi.submit(id), handlers);

export const useWithdrawApplication = (handlers?: MutationHandlers) =>
  useApplicationMutation((id: string) => applicationApi.withdraw(id), handlers);

export const useAcceptOffer = (handlers?: MutationHandlers) =>
  useApplicationMutation((id: string) => applicationApi.acceptOffer(id), handlers);

export const useDeclineOffer = (handlers?: MutationHandlers) =>
  useApplicationMutation((id: string) => applicationApi.declineOffer(id), handlers);

export const useUploadRequestedDocument = () =>
  useApplicationMutation((input: UploadInput) => applicationApi.uploadRequestedDocument(input));

export const useRespondToRequest = (id: string, handlers?: MutationHandlers) =>
  useApplicationMutation((comment: string) => applicationApi.respondToRequest(id, comment), handlers);

export const useSignApplication = (id: string, handlers?: MutationHandlers) =>
  useApplicationMutation((code: string) => applicationApi.sign(id, code), handlers);

export const useTakeInWork = () => useApplicationMutation((id: string) => applicationApi.takeInWork(id));

export const useDecide = (handlers?: MutationHandlers) =>
  useApplicationMutation((input: DecisionInput) => applicationApi.decide(input), handlers);
