import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { isActive, useCompanyApplications } from '@/entities/application';
import { useNotifications } from '@/entities/notification';
import { useSession } from '@/entities/session';
import { DemoModeButton } from '@/features/demo-mode';
import { routes } from '@/shared/config';
import { useRouteHandle } from '@/shared/lib';
import { AppShell } from '@/widgets/app-shell';
import { AssistantFab, AssistantPanel, AssistantPanelContext } from '@/widgets/assistant-panel';
import { MobileNav, MobileTopBar, type MobileNavItem } from '@/widgets/mobile-nav';
import { SideNav } from '@/widgets/side-nav';
import { useLogout } from './useLogout';

const MOBILE_ITEMS: MobileNavItem[] = [
  { to: routes.client.home(), label: 'Главная', icon: 'home', end: true },
  { to: routes.client.financing(), label: 'Подбор', icon: 'trend-up' },
  { to: routes.client.applications(), label: 'Заявки', icon: 'document' },
  { to: routes.client.loans(), label: 'Кредиты', icon: 'wallet' },
  { to: routes.client.profile(), label: 'Профиль', icon: 'user' },
];

export function ClientLayout() {
  const { persona } = useSession();
  const companyId = persona?.companyId ?? '';
  const { pathname } = useLocation();
  const logout = useLogout();
  const handle = useRouteHandle();
  const applications = useCompanyApplications(companyId);
  const notifications = useNotifications(companyId);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const assistant = useMemo(
    () => ({
      open: assistantOpen,
      show: () => setAssistantOpen(true),
      hide: () => setAssistantOpen(false),
      toggle: () => setAssistantOpen((v) => !v),
    }),
    [assistantOpen],
  );

  if (!persona) return null;
  const activeCount = applications.data?.filter(isActive).length;
  const unread = notifications.data?.filter((n) => n.unread).length ?? 0;
  const initials = persona.companyInitials ?? persona.initials;

  return (
    <AssistantPanelContext.Provider value={assistant}>
      <AppShell
        sidebar={
          <SideNav
            onLogout={logout}
            label="Разделы кабинета"
            home={routes.client.home()}
            subtitle="для бизнеса"
            pathname={pathname}
            groups={[
              [{ to: routes.client.notifications(), label: 'Уведомления', icon: 'bell', count: unread }],
              [
                { to: routes.client.home(), label: 'Главная', icon: 'home', end: true },
                {
                  to: routes.client.financing(),
                  label: 'Финансирование',
                  icon: 'trend-up',
                  alsoActiveOn: [routes.client.catalog()],
                },
                { to: routes.client.applications(), label: 'Мои заявки', icon: 'document', count: activeCount },
                { to: routes.client.loans(), label: 'Мои кредиты', icon: 'wallet' },
                { to: routes.client.documents(), label: 'Документы', icon: 'folder' },
                { to: routes.client.profile(), label: 'Профиль компании', icon: 'user' },
              ],
            ]}
            footer={<DemoModeButton />}
            user={{ initials, name: persona.org, subtitle: persona.name, to: routes.client.profile() }}
          />
        }
        mobileHeader={
          <MobileTopBar
            onLogout={logout}
            initials={initials}
            title={persona.org}
            subtitle={persona.name}
            notificationsTo={routes.client.notifications()}
            unread={unread}
          />
        }
        mobileNav={<MobileNav label="Разделы кабинета" items={MOBILE_ITEMS} />}
        assistant={
          assistantOpen ? (
            <AssistantPanel
              scenario={handle?.assistant ?? 'start'}
              screen={handle?.title ?? 'Главная'}
              firstName={persona.name.split(' ')[0]}
              onClose={assistant.hide}
            />
          ) : null
        }
        onAssistantClose={assistant.hide}
        floating={
          <>
            <DemoModeButton floating />
            {!assistantOpen ? <AssistantFab onClick={assistant.show} /> : null}
          </>
        }
      >
        <Outlet />
      </AppShell>
    </AssistantPanelContext.Provider>
  );
}
