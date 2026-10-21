import { useState } from 'react';
import { CONSENT_IDS } from '../consents';
import { useCompanyProfile } from '@/entities/company';
import {
  Alert,
  AsyncContent,
  Badge,
  Button,
  CardSkeleton,
  Cluster,
  ConsentItem,
  DescriptionList,
  Grid,
  Section,
  Stack,
  Text,
  TextField,
} from '@/shared/ui';
import type { StepProps } from './ParametersStep';

export function CompanyStep({ app, onChange, onSave }: StepProps) {
  const profile = useCompanyProfile(app.companyId);
  const [reported, setReported] = useState(false);
  const [contact, setContact] = useState<{ name: string; phone: string } | null>(null);

  return (
    <AsyncContent query={profile} skeleton={<CardSkeleton lines={6} />}>
      {({ company, consents }) => {
        const name = contact?.name ?? company.contactName;
        const phone = contact?.phone ?? company.phone;
        const setField = (patch: Partial<{ name: string; phone: string }>) => {
          const next = { name, phone, ...patch };
          setContact(next);
          onChange({ contactName: next.name, phone: next.phone }, next.name.trim() ? null : 'Укажите контактное лицо');
        };
        return (
          <>
            <Section title="Компания" gap={5} aside={<Badge icon="document">Из ЕГРЮЛ</Badge>}>
              <DescriptionList
                items={[
                  { term: 'ИНН', details: company.inn, valueClassName: 'tabular' },
                  { term: 'ОГРН', details: company.ogrn, valueClassName: 'tabular' },
                  { term: 'Дата регистрации', details: company.registeredAt },
                  { term: 'Полное название', details: company.fullName, full: true },
                  { term: 'ОКВЭД', details: `${company.okved} — ${company.okvedTitle}`, full: true },
                  { term: 'Юридический адрес', details: company.address, full: true },
                  { term: 'Руководитель', details: `${company.director}, ${company.directorPosition}`, full: true },
                ]}
              />
              <Cluster gap={3} justify="between">
                <Text variant="body-sm" tone="secondary">
                  Данные только для чтения: их обновляет ЕГРЮЛ, проверено {company.verifiedAt}.
                </Text>
                <Button variant="link" onClick={() => setReported(true)} disabled={reported}>
                  Данные неверны
                </Button>
              </Cluster>
              {reported ? (
                <Alert tone="info" title="Передали запрос на проверку реквизитов">
                  Специалист сверит данные с ЕГРЮЛ и напишет в кабинет. Заявку можно продолжать.
                </Alert>
              ) : null}
            </Section>
            <Section title="Контактное лицо" gap={5}>
              <Grid min={240} gap={5}>
                <TextField
                  label="Имя и фамилия"
                  value={name}
                  onChange={(e) => setField({ name: e.target.value })}
                  autoComplete="name"
                  error={name.trim() ? undefined : 'Укажите, с кем связаться по заявке'}
                />
                <TextField
                  label="Телефон"
                  type="tel"
                  value={phone}
                  onChange={(e) => setField({ phone: e.target.value })}
                  autoComplete="tel"
                  hint="Сообщения по заявке банк присылает только в кабинет"
                />
              </Grid>
            </Section>
            <Section
              title="Согласия"
              subtitle="Без них банк не сможет проверить заявку. Отозвать согласие можно в профиле."
            >
              <Stack gap={3}>
                {consents
                  .filter((c) => CONSENT_IDS.includes(c.id))
                  .map((consent) => (
                    <ConsentItem
                      key={consent.id}
                      title={consent.title}
                      text={consent.text}
                      checked={Boolean(app.consents[consent.id])}
                      onChange={(checked) => onSave({ consents: { [consent.id]: checked } })}
                    />
                  ))}
              </Stack>
            </Section>
          </>
        );
      }}
    </AsyncContent>
  );
}
