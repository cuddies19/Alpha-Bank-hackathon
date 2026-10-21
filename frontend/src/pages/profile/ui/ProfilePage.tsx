import { useState } from 'react';
import { useCompanyProfile, useRevokeConsent, useSetNotificationPref, type Consent } from '@/entities/company';
import { useCompanyId } from '@/entities/session';
import {
  AsyncContent,
  Badge,
  Button,
  Checkbox,
  Columns,
  DescriptionList,
  Modal,
  PageContainer,
  PageHeader,
  Section,
  Table,
  Td,
  Text,
  Th,
  useToast,
} from '@/shared/ui';

export function ProfilePage() {
  const companyId = useCompanyId();
  const profile = useCompanyProfile(companyId);
  const setPref = useSetNotificationPref(companyId);
  const revoke = useRevokeConsent(companyId);
  const toast = useToast();
  const [revoking, setRevoking] = useState<Consent | null>(null);

  return (
    <PageContainer spacing="tight">
      <PageHeader title="Профиль компании" />
      <AsyncContent query={profile}>
        {({ company, consents, prefs, accounts }) => (
          <Columns
            main={
              <>
                <Section title="Реквизиты" aside={<Badge icon="document">Из ЕГРЮЛ</Badge>}>
                  <DescriptionList
                    items={[
                      { term: 'Полное название', details: company.fullName, full: true },
                      { term: 'ИНН', details: company.inn, valueClassName: 'tabular' },
                      { term: 'ОГРН', details: company.ogrn, valueClassName: 'tabular' },
                      { term: 'Дата регистрации', details: company.registeredAt },
                      { term: 'ОКВЭД', details: company.okved },
                      { term: 'Юридический адрес', details: company.address, full: true },
                      { term: 'Руководитель', details: `${company.director}, ${company.directorPosition}`, full: true },
                    ]}
                  />
                </Section>
                <Section title="Согласия" gap={3}>
                  <Table plain flat caption="Согласия">
                    <thead>
                      <tr>
                        <Th>Согласие</Th>
                        <Th>Дано</Th>
                        <Th>Действует до</Th>
                        <Th srOnly>Действие</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {consents.map((consent) => (
                        <tr key={consent.id}>
                          <Td>{consent.shortTitle}</Td>
                          <Td nowrap tone={consent.givenAt ? 'default' : 'secondary'}>
                            {consent.givenAt ?? 'не дано'}
                          </Td>
                          <Td nowrap>{consent.validUntil ?? '—'}</Td>
                          <Td align="right">
                            {consent.givenAt ? (
                              <Button size="sm" onClick={() => setRevoking(consent)}>
                                Отозвать
                              </Button>
                            ) : null}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Text variant="body-sm" tone="secondary">
                    Без согласий банк не сможет рассматривать новые заявки. Отзыв не влияет на уже выданные кредиты.
                  </Text>
                </Section>
              </>
            }
            side={
              <>
                <Section title="Контакты" gap={3}>
                  <DescriptionList
                    variant="rows"
                    items={[
                      { term: 'Контактное лицо', details: company.contactName },
                      { term: 'Телефон', details: company.phone },
                    ]}
                  />
                </Section>
                <Section title="Подключённые счета" gap={3}>
                  <DescriptionList
                    variant="rows"
                    items={accounts.map((a) => ({
                      term: a.title,
                      details: a.note,
                      tone: a.primary ? 'success' : 'secondary',
                      regular: !a.primary,
                    }))}
                  />
                </Section>
                <Section title="Уведомления в кабинете" gap={3}>
                  {prefs.map((pref) => (
                    <Checkbox
                      key={pref.id}
                      compact
                      checked={pref.enabled}
                      onChange={(enabled) => setPref.mutate({ id: pref.id, enabled })}
                    >
                      {pref.label}
                    </Checkbox>
                  ))}
                  <Text variant="body-sm" tone="secondary">
                    Решения по заявкам приходят всегда — их отключить нельзя.
                  </Text>
                </Section>
              </>
            }
          />
        )}
      </AsyncContent>
      <Modal
        open={Boolean(revoking)}
        onClose={() => setRevoking(null)}
        title="Отозвать согласие?"
        actions={
          <>
            <Button onClick={() => setRevoking(null)}>Оставить</Button>
            <Button
              variant="primary"
              loading={revoke.isPending}
              onClick={() =>
                revoking &&
                revoke.mutate(revoking.id, {
                  onSuccess: () => {
                    toast.show({ tone: 'info', title: 'Согласие отозвано', description: revoking.shortTitle });
                    setRevoking(null);
                  },
                })
              }
            >
              Отозвать
            </Button>
          </>
        }
      >
        <p className="body">
          {revoking?.shortTitle}. Без этого согласия банк не сможет рассматривать новые заявки. Уже выданные кредиты это
          не затронет.
        </p>
      </Modal>
    </PageContainer>
  );
}
