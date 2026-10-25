import type { Dto } from '@/shared/api';
import { http, mockResponse, tokenStorage } from '@/shared/api';
import { USE_API, demoPassword, features } from '@/shared/config';
import * as server from '@/mocks/server';
import type { Persona } from '../model/types';

const MOCK_DEMO_PASSWORD = 'demo-2026';

function initialsOf(text: string) {
  return text
    .replace(/[«»"]/g, '')
    .replace(/^(ООО|ИП|АО|ПАО)\s+/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

function toPersona(user: Dto.UserOut): Persona {
  const known = server.listPersonas().find((p) => p.login === user.login);
  const role = user.role === 'underwriter' ? 'bank' : 'client';
  const company = user.company;
  return {
    id: known?.id ?? user.login,
    role,
    initials: known?.initials ?? initialsOf(user.full_name),
    name: user.full_name,
    org: company?.name ?? known?.org ?? 'Кредитный аналитик',
    position: known?.position ?? user.full_name,
    outcome: '',
    outcomeTone: 'neutral',
    login: user.login,
    companyId: company ? String(company.id) : undefined,
    companyInitials: company ? initialsOf(company.name) : undefined,
    shortName: known?.shortName,
    home: role === 'bank' ? '/bank' : '/client',
  };
}

const apiSessionApi = {
  demoPassword: features.demo ? demoPassword : '',
  personas: async () =>
    server.listPersonas().map((p) => ({ ...p, outcome: '', home: p.role === 'bank' ? '/bank' : '/client' })),
  login: async (login: string, password: string) => {
    const response = await http<Dto.TokenResponse>('/auth/login', {
      method: 'POST',
      body: { login: login.trim(), password },
      auth: false,
    }).catch((error: unknown) => {
      if (/[а-яё]/i.test(login)) throw new Error('Похоже, включена русская раскладка');
      throw error;
    });
    tokenStorage.set(response.access_token);
    return toPersona(response.user);
  },
  logout: () => tokenStorage.set(null),
  switchTo: (persona: Persona) => apiSessionApi.login(persona.login, demoPassword),
};

const mockSessionApi = {
  demoPassword: features.demo ? MOCK_DEMO_PASSWORD : '',
  personas: () => mockResponse(() => server.listPersonas()),
  login: (login: string, password: string) => mockResponse(() => server.login(login, password)),
  logout: () => {},
  switchTo: async (persona: Persona) => persona,
};

export const sessionApi = USE_API ? apiSessionApi : mockSessionApi;
