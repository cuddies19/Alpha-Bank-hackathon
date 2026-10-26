import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { NotFoundPage, RouteErrorPage } from '@/pages/system';
import type { RouteHandle } from '@/shared/config';
import { BankLayout } from '../layouts/BankLayout';
import { IndexRedirect } from '../layouts/IndexRedirect';
import { ClientLayout } from '../layouts/ClientLayout';
import { RequireRole } from '../layouts/RequireRole';
import { RootLayout } from '../layouts/RootLayout';

function page<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  return async () => ({ Component: pick(await load()) });
}

const handle = (title: string, assistant?: RouteHandle['assistant']): RouteHandle => ({ title, assistant });

const clientRoutes: RouteObject[] = [
  {
    index: true,
    handle: handle('Главная'),
    lazy: page(
      () => import('@/pages/home'),
      (m) => m.HomePage,
    ),
  },
  {
    path: 'financing',
    handle: handle('Подбор финансирования', 'start'),
    lazy: page(
      () => import('@/pages/financing-need'),
      (m) => m.FinancingNeedPage,
    ),
  },
  {
    path: 'financing/dialog',
    handle: handle('Подбор финансирования', 'dialog'),
    lazy: page(
      () => import('@/pages/financing-dialog'),
      (m) => m.FinancingDialogPage,
    ),
  },
  {
    path: 'financing/goal',
    handle: handle('Подбор через цель', 'simplified'),
    lazy: page(
      () => import('@/pages/financing-goal'),
      (m) => m.FinancingGoalPage,
    ),
  },
  {
    path: 'financing/offers',
    handle: handle('Варианты финансирования'),
    lazy: page(
      () => import('@/pages/offers'),
      (m) => m.OffersPage,
    ),
  },
  {
    path: 'catalog',
    handle: handle('Каталог продуктов'),
    lazy: page(
      () => import('@/pages/catalog'),
      (m) => m.CatalogPage,
    ),
  },
  {
    path: 'applications',
    handle: handle('Мои заявки'),
    lazy: page(
      () => import('@/pages/applications'),
      (m) => m.ApplicationsPage,
    ),
  },
  {
    path: 'applications/:id',
    handle: handle('Статус заявки'),
    lazy: page(
      () => import('@/pages/application-status'),
      (m) => m.ApplicationStatusPage,
    ),
  },
  { path: 'applications/:id/form', element: <Navigate to="parameters" replace /> },
  {
    path: 'applications/:id/form/:step',
    handle: handle('Заявка'),
    lazy: page(
      () => import('@/pages/application-form'),
      (m) => m.ApplicationFormPage,
    ),
  },
  {
    path: 'applications/:id/sent',
    handle: handle('Заявка отправлена'),
    lazy: page(
      () => import('@/pages/application-sent'),
      (m) => m.ApplicationSentPage,
    ),
  },
  {
    path: 'applications/:id/decision',
    handle: handle('Решение банка'),
    lazy: page(
      () => import('@/pages/decision'),
      (m) => m.DecisionPage,
    ),
  },
  {
    path: 'applications/:id/sign',
    handle: handle('Подписание документов'),
    lazy: page(
      () => import('@/pages/sign'),
      (m) => m.SignPage,
    ),
  },
  {
    path: 'applications/:id/issued',
    handle: handle('Деньги зачислены'),
    lazy: page(
      () => import('@/pages/issued'),
      (m) => m.IssuedPage,
    ),
  },
  {
    path: 'loans',
    handle: handle('Мои кредиты'),
    lazy: page(
      () => import('@/pages/loans'),
      (m) => m.LoansPage,
    ),
  },
  {
    path: 'documents',
    handle: handle('Документы'),
    lazy: page(
      () => import('@/pages/documents'),
      (m) => m.DocumentsPage,
    ),
  },
  {
    path: 'notifications',
    handle: handle('Уведомления'),
    lazy: page(
      () => import('@/pages/notifications'),
      (m) => m.NotificationsPage,
    ),
  },
  {
    path: 'profile',
    handle: handle('Профиль компании'),
    lazy: page(
      () => import('@/pages/profile'),
      (m) => m.ProfilePage,
    ),
  },
];

const bankCase = () => import('@/pages/bank-case');

const bankRoutes: RouteObject[] = [
  {
    index: true,
    handle: handle('Очередь заявок'),
    lazy: page(
      () => import('@/pages/bank-queue'),
      (m) => m.QueuePage,
    ),
  },
  {
    path: 'applications/:id',
    handle: handle('Карточка заявки'),
    lazy: page(bankCase, (m) => m.CaseLayout),
    children: [
      { index: true, lazy: page(bankCase, (m) => m.SummaryTab) },
      { path: 'client', lazy: page(bankCase, (m) => m.ClientTab) },
      { path: 'checks', lazy: page(bankCase, (m) => m.ChecksTab) },
      { path: 'risk', lazy: page(bankCase, (m) => m.RiskTab) },
      { path: 'documents', lazy: page(bankCase, (m) => m.DocumentsTab) },
      { path: 'history', lazy: page(bankCase, (m) => m.HistoryTab) },
    ],
  },
  {
    path: 'pipeline',
    handle: handle('Конвейер'),
    lazy: page(
      () => import('@/pages/bank-pipeline'),
      (m) => m.PipelinePage,
    ),
  },
  {
    path: 'integrations',
    handle: handle('Внешние источники'),
    lazy: page(
      () => import('@/pages/bank-integrations'),
      (m) => m.IntegrationsPage,
    ),
  },
  {
    path: 'audit',
    handle: handle('Журнал аудита'),
    lazy: page(
      () => import('@/pages/bank-audit'),
      (m) => m.AuditPage,
    ),
  },
  {
    path: 'rules',
    handle: handle('Продукты и правила'),
    lazy: page(
      () => import('@/pages/bank-rules'),
      (m) => m.RulesPage,
    ),
  },
];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <IndexRedirect /> },
      {
        path: 'login',
        handle: handle('Вход'),
        lazy: page(
          () => import('@/pages/login'),
          (m) => m.LoginPage,
        ),
      },
      {
        path: 'client',
        element: (
          <RequireRole role="client">
            <ClientLayout />
          </RequireRole>
        ),
        children: clientRoutes,
      },
      {
        path: 'bank',
        element: (
          <RequireRole role="bank">
            <BankLayout />
          </RequireRole>
        ),
        children: bankRoutes,
      },
      { path: '*', handle: handle('Страница не найдена'), element: <NotFoundPage /> },
    ],
  },
]);
