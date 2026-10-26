export interface Company {
  id: string;
  shortName: string;
  fullName: string;
  initials: string;
  inn: string;
  ogrn: string;
  registeredAt: string;
  age: string;
  okved: string;
  okvedTitle: string;
  address: string;
  director: string;
  directorShort: string;
  directorPosition: string;
  directorShare?: string;
  contactName: string;
  phone: string;
  accountMask: string;
  accountSince: string;
  employees: number;
  salesChannels?: string;
  externalAccountStatement?: string;
  passportMasked: string;
  birthDateMasked: string;
  verifiedAt: string;
}

export type ConsentId = 'bki' | 'pd' | 'ops';

export interface Consent {
  id: ConsentId;
  title: string;
  shortTitle: string;
  text: string;
  givenAt?: string;
  validUntil?: string;
}

export type NotificationPrefId = 'docs' | 'pay' | 'tips' | 'news';

export interface NotificationPref {
  id: NotificationPrefId;
  label: string;
  enabled: boolean;
}

export interface CompanyProfile {
  company: Company;
  consents: Consent[];
  prefs: NotificationPref[];
  accounts: Array<{ title: string; note: string; primary?: boolean }>;
}
