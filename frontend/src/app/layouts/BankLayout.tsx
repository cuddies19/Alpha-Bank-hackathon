import { Outlet, useLocation } from 'react-router';
import { useApplicationQueue } from '@/entities/application';
import { useSources } from '@/entities/integration';
import { useSession } from '@/entities/session';
import { DemoModeButton } from '@/features/demo-mode';
import { routes } from '@/shared/config';
import { AppShell } from '@/widgets/app-shell';
import { MobileNav, MobileTopBar, type MobileNavItem } from '@/widgets/mobile-nav';
import { SideNav } from '@/widgets/side-nav';
import { useLogout } from './useLogout';

const MOBILE_ITEMS: MobileNavItem[] = [
  { to: routes.bank.queue(), label: 'Очередь', icon: 'list', end: true },
  { to: routes.bank.pipeline(), label: 'Конвейер', icon: 'trend-up' },
  { to: routes.bank.integrations(), label: 'Источники', icon: 'alert' },
  { to: routes.bank.audit(), label: 'Аудит', icon: 'clock' },
  { to: routes.bank.rules(), label: 'Правила', icon: 'shield' },
];

export function BankLayout() {
  const { persona } = useSession();
  const { pathname } = useLocation();
  const logout = useLogout();
  const queue = useApplicationQueue();
  const sources = useSources();
  if (!persona) return null;

  const manual = queue.data?.filter((a) => a.bankStage === 'manual').length;
  const down = sources.data?.filter((s) => s.state === 'down').length;

  return (
    <AppShell
      sidebar={
        <SideNav
          onLogout={logout}
          label="Разделы консоли"
          home={routes.bank.queue()}
          subtitle="Консоль аналитика"
          pathname={pathname}
          groups={[
            [
              {
                to: routes.bank.queue(),
                label: 'Очередь заявок',
                icon: 'list',
                end: true,
                count: manual,
                alsoActiveOn: [routes.bank.applications()],
              },
              { to: routes.bank.pipeline(), label: 'Конвейер', icon: 'trend-up' },
              { to: routes.bank.integrations(), label: 'Внешние источники', icon: 'alert', alert: down || undefined },
              { to: routes.bank.audit(), label: 'Журнал аудита', icon: 'clock' },
              { to: routes.bank.rules(), label: 'Продукты и правила', icon: 'shield' },
            ],
          ]}
          footer={<DemoModeButton />}
          user={{ initials: persona.initials, name: persona.name, subtitle: persona.org }}
        />
      }
      mobileHeader={
        <MobileTopBar onLogout={logout} initials={persona.initials} title="Консоль аналитика" subtitle={persona.name} />
      }
      mobileNav={<MobileNav label="Разделы консоли" items={MOBILE_ITEMS} />}
      floating={<DemoModeButton floating />}
    >
      <Outlet />
    </AppShell>
  );
}
