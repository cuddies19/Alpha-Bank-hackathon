import type { Tone } from '@/shared/ui';

export type Role = 'client' | 'bank';

export type PersonaId = 'igor' | 'anna' | 'marina' | 'sergey' | 'olga';

export interface Persona {
  id: PersonaId | string;
  role: Role;
  initials: string;
  name: string;
  org: string;
  position: string;
  outcome: string;
  outcomeTone: Tone;
  login: string;
  companyId?: string;
  companyInitials?: string;
  shortName?: string;
  home: string;
}
