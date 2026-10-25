import { mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import * as server from '@/mocks/server';
import type { Application, DecisionInput, DraftInput, DraftPatch, QueueItem, UploadInput } from '../model/types';
import { httpApplicationApi } from './httpApplicationApi';

const one = (produce: () => Application): Promise<Application> => mockResponse(produce);

const mockApplicationApi = {
  listForCompany: (companyId: string) => mockResponse(() => server.listClientApplications(companyId)),
  get: (id: string) => one(() => server.getApplication(id)),
  createDraft: (companyId: string, input: DraftInput) => one(() => server.createDraft(companyId, input)),
  updateDraft: (id: string, patch: DraftPatch) => one(() => server.updateDraft(id, patch)),
  uploadDocument: (input: UploadInput) => one(() => server.uploadDocument(input)),
  removeDocument: (applicationId: string, documentId: string) =>
    one(() => server.removeDocument(applicationId, documentId)),
  submit: (id: string) => one(() => server.submitApplication(id)),
  withdraw: (id: string) => one(() => server.withdrawApplication(id)),
  acceptOffer: (id: string) => one(() => server.acceptOffer(id)),
  declineOffer: (id: string) => one(() => server.declineOffer(id)),
  uploadRequestedDocument: (input: UploadInput) => one(() => server.uploadRequestedDocument(input)),
  respondToRequest: (id: string, comment: string) => one(() => server.respondToRequest(id, comment)),
  signingDocuments: (id: string) => mockResponse(() => server.getSigningDocuments(id)),
  sign: (id: string, code: string) => one(() => server.signApplication(id, code)),

  queue: (): Promise<QueueItem[]> => mockResponse(() => server.listQueue()),
  getCase: (id: string) => mockResponse(() => server.getCase(id)),
  takeInWork: (id: string) => one(() => server.takeInWork(id)),
  decide: (input: DecisionInput) => one(() => server.decide(input)),
};

export const applicationApi: typeof httpApplicationApi = USE_API ? httpApplicationApi : mockApplicationApi;
