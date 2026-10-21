import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';
import type { DecisionInput, DraftInput } from '../model/types';

export const applicationApi = {
  listForCompany: (companyId: string) => mockResponse(() => server.listClientApplications(companyId)),
  get: (id: string) => mockResponse(() => server.getApplication(id)),
  createDraft: (companyId: string, input: DraftInput) => mockResponse(() => server.createDraft(companyId, input)),
  updateDraft: (id: string, patch: server.DraftPatch) => mockResponse(() => server.updateDraft(id, patch)),
  uploadDocument: (input: server.UploadInput) => mockResponse(() => server.uploadDocument(input)),
  removeDocument: (applicationId: string, documentId: string) =>
    mockResponse(() => server.removeDocument(applicationId, documentId)),
  submit: (id: string) => mockResponse(() => server.submitApplication(id)),
  withdraw: (id: string) => mockResponse(() => server.withdrawApplication(id)),
  acceptOffer: (id: string) => mockResponse(() => server.acceptOffer(id)),
  declineOffer: (id: string) => mockResponse(() => server.declineOffer(id)),
  uploadRequestedDocument: (input: server.UploadInput) => mockResponse(() => server.uploadRequestedDocument(input)),
  respondToRequest: (id: string, comment: string) => mockResponse(() => server.respondToRequest(id, comment)),
  signingDocuments: (id: string) => mockResponse(() => server.getSigningDocuments(id)),
  sign: (id: string, code: string) => mockResponse(() => server.signApplication(id, code)),

  queue: () => mockResponse(() => server.listQueue()),
  getCase: (id: string) => mockResponse(() => server.getCase(id)),
  takeInWork: (id: string) => mockResponse(() => server.takeInWork(id)),
  decide: (input: DecisionInput) => mockResponse(() => server.decide(input)),
};

export type { DraftPatch, UploadInput, QueueItem } from '@/mocks/server';
