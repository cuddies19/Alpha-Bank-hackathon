import { Outlet, ScrollRestoration } from 'react-router';
import { DemoModeProvider } from '@/features/demo-mode';
import { ToastProvider } from '@/shared/ui';
import { useDocumentTitle } from '@/widgets/app-shell';
import { NavigationProgress } from './NavigationProgress';

export function RootLayout() {
  useDocumentTitle();
  return (
    <ToastProvider>
      <DemoModeProvider>
        <NavigationProgress />
        <Outlet />
        <ScrollRestoration />
      </DemoModeProvider>
    </ToastProvider>
  );
}
