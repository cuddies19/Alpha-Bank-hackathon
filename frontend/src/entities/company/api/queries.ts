import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Dto } from '@/shared/api';
import { cachedGet, http, mockResponse } from '@/shared/api';
import { USE_API } from '@/shared/config';
import { formatDay, formatStamp, plural } from '@/shared/lib';
import * as server from '@/mocks/server';
import type { Company, CompanyProfile, ConsentId, NotificationPrefId } from '../model/types';

export const companyKeys = {
  profile: (companyId: string) => ['company', 'profile', companyId] as const,
};

const CONSENT_KEYS: Record<ConsentId, string> = { pd: 'personal_data', bki: 'bki_request', ops: 'terms' };

function initials(name: string) {
  return name
    .replace(/[«»"]/g, '')
    .replace(/^(ООО|ИП|АО|ПАО)\s+/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function ageOf(date: string | null | undefined) {
  if (!date) return '—';
  const months = Math.max(
    0,
    (new Date().getFullYear() - new Date(date).getFullYear()) * 12 + new Date().getMonth() - new Date(date).getMonth(),
  );
  return `${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`;
}

function toCompany(dto: Dto.CompanyOut): Company {
  const director = dto.director ?? '—';
  const [last, first, middle] = director.split(' ');
  return {
    id: String(dto.id),
    shortName: dto.name,
    fullName: dto.name,
    initials: initials(dto.name),
    inn: dto.inn,
    ogrn: dto.ogrn,
    registeredAt: dto.registration_date ? formatDay(dto.registration_date, { year: true }) : '—',
    age: ageOf(dto.registration_date),
    okved: dto.okved ?? '—',
    okvedTitle: '',
    address: dto.address ?? '—',
    director,
    directorShort: first ? `${last} ${first[0]}.${middle ? ` ${middle[0]}.` : ''}` : director,
    directorPosition: dto.type === 'ИП' ? 'индивидуальный предприниматель' : 'генеральный директор',
    contactName: first ? `${first} ${last}` : director,
    phone: dto.phone ?? '—',
    accountMask: '',
    accountSince: '',
    employees: 0,
    passportMasked: '—',
    birthDateMasked: '—',
    verifiedAt: formatStamp(new Date()),
  };
}

async function apiProfile(companyId: string): Promise<CompanyProfile> {
  const [me, list] = await Promise.all([
    cachedGet<Dto.UserOut>('/me'),
    http<Dto.ApplicationList>('/applications', { query: { limit: 50 } }),
  ]);
  if (!me.company) throw new Error('У пользователя нет компании');
  const latest = list.items.find((a) => a.submitted_at);
  const detail = latest ? await http<Dto.ApplicationDetail>(`/applications/${latest.id}`) : null;
  const revoked = server.listRevokedConsents(companyId);
  return {
    company: toCompany(me.company),
    consents: server.listConsentTexts().map((consent) => {
      const given =
        detail?.consents?.[CONSENT_KEYS[consent.id]] === true && !revoked.includes(consent.id) && detail.submitted_at;
      return {
        ...consent,
        givenAt: given ? formatStamp(given) : undefined,
        validUntil: given ? (consent.id === 'bki' ? 'на 6 месяцев' : 'бессрочно') : undefined,
      };
    }),
    prefs: server.listPrefs(companyId),
    accounts: [{ title: 'Расчётный счёт', note: 'Основной', primary: true }],
  };
}

export const companyApi = {
  profile: (companyId: string) => (USE_API ? apiProfile(companyId) : mockResponse(() => server.getProfile(companyId))),
  setPref: (companyId: string, id: NotificationPrefId, enabled: boolean) =>
    mockResponse(() => server.setPref(companyId, id, enabled)),
  revokeConsent: (companyId: string, id: ConsentId) => mockResponse(() => server.revokeConsent(companyId, id)),
};

export function useCompanyProfile(companyId: string) {
  return useQuery({ queryKey: companyKeys.profile(companyId), queryFn: () => companyApi.profile(companyId) });
}

export function useSetNotificationPref(companyId: string) {
  const queryClient = useQueryClient();
  const queryKey = companyKeys.profile(companyId);
  const mutationKey = ['set-notification-pref', companyId];
  return useMutation({
    mutationKey,
    mutationFn: ({ id, enabled }: { id: NotificationPrefId; enabled: boolean }) =>
      companyApi.setPref(companyId, id, enabled),
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CompanyProfile>(queryKey);
      if (previous) {
        queryClient.setQueryData<CompanyProfile>(queryKey, {
          ...previous,
          prefs: previous.prefs.map((p) => (p.id === id ? { ...p, enabled } : p)),
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey }) === 1) void queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useRevokeConsent(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ConsentId) => companyApi.revokeConsent(companyId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.profile(companyId) }),
  });
}
