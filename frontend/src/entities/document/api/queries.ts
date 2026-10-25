import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Dto } from '@/shared/api';
import { http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import { formatDay } from '@/shared/lib';
import * as server from '@/mocks/server';
import type { ClientDocument } from '../model/types';

export const documentKeys = {
  list: (companyId: string) => ['documents', companyId] as const,
};

const DOC_TITLE: Record<string, string> = {
  bs: 'Бухгалтерская отчётность',
  stmt: 'Выписка из другого банка',
  supply: 'Договор поставки',
};

const SIGNED = ['Кредитный договор', 'График платежей', 'Заявление на выдачу'];

const extension = (name: string) => name.split('.').pop()?.toUpperCase() ?? 'PDF';

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`
    : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

function documentsOf(app: Dto.ApplicationDetail): ClientDocument[] {
  const id = String(app.id);
  const date = formatDay(app.submitted_at ?? app.created_at);
  const signed: ClientDocument[] =
    app.status === 'issued'
      ? SIGNED.map((name, index) => ({
          id: `${id}-signed-${index}`,
          name,
          meta: 'PDF · подписано в кабинете',
          applicationId: id,
          date,
          status: 'Подписано',
          tone: 'success',
        }))
      : [];
  const files: ClientDocument[] = (app.documents ?? []).map((file) => ({
    id: `${id}-${file.id}`,
    name: DOC_TITLE[file.doc_type] ?? file.filename,
    meta: `${extension(file.filename)} · ${formatSize(file.size_bytes)}`,
    applicationId: id,
    date: formatDay(file.uploaded_at),
    status: file.status === 'accepted' ? 'Принят' : file.status === 'rejected' ? 'Нужно заменить' : 'Загружен',
    tone: file.status === 'accepted' ? 'success' : file.status === 'rejected' ? 'danger' : 'info',
    replaceable: file.status === 'rejected',
    documentId: file.doc_type,
  }));
  return [...signed, ...files];
}

const documentApi = USE_API
  ? {
      list: async (_companyId: string) => {
        const { items } = await http<Dto.ApplicationList>('/applications', { query: { limit: 200 } });
        const details = await Promise.all(items.map((a) => http<Dto.ApplicationDetail>(`/applications/${a.id}`)));
        return details.flatMap(documentsOf);
      },
      upload: async (_companyId: string, input: UploadInput) => {
        if (!input.file) throw new Error('Выберите файл');
        const form = new FormData();
        form.append('file', input.file);
        form.append('doc_type', 'other');
        await http(`/applications/${input.applicationId}/documents`, { method: 'POST', form });
      },
    }
  : {
      list: (companyId: string) => mockResponse(() => server.listClientDocuments(companyId)),
      upload: async (companyId: string, { applicationId, name, size }: UploadInput) => {
        await mockResponse(() => server.uploadClientDocument(companyId, applicationId, name, size));
      },
    };

interface UploadInput {
  applicationId: string;
  name: string;
  size: string;
  file?: File;
}

export function useClientDocuments(companyId: string) {
  return useQuery({
    queryKey: documentKeys.list(companyId),
    queryFn: () => documentApi.list(companyId),
    refetchInterval: (query) =>
      !USE_API && query.state.data?.some((d) => d.tone === 'info' || d.tone === 'neutral') ? 1_500 : false,
  });
}

export function useUploadClientDocument(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadInput) => documentApi.upload(companyId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.list(companyId) });
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
