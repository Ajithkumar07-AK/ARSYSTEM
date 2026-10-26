import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';

import { LandingPage } from './views/LandingPage.tsx';
import { StoreCatalogView } from './views/StoreCatalogView.tsx';
import { CustomerProfileView } from './views/CustomerProfileView.tsx';
import { PurchaseHistoryView } from './views/PurchaseHistoryView.tsx';
import { CustomerBillsView } from './views/CustomerBillsView.tsx';
import { AuthView } from './views/AuthView.tsx';
import { AdminDashboardView } from './views/AdminDashboardView.tsx';
import { AdminCustomerManageView } from './views/AdminCustomerManageView.tsx';
import { AdminProductManageView } from './views/AdminProductManageView.tsx';
import { AdminReportsView } from './views/AdminReportsView.tsx';
import { AdminSuppliersView } from './views/AdminSuppliersView.tsx';
import { AdminContentView } from './views/AdminContentView.tsx';
import { SettingsView } from './views/SettingsView.tsx';

const MainLayout: React.FC = () => {
  const { currentView, user } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
      case 'contact-page':
      case 'help-page':
      case 'store-section':
      case 'menu-section':
      case 'help-section':
      case 'contact-section':
        return <LandingPage />;
      case 'store':
      case 'menu-catalog':
        return <StoreCatalogView />;
      case 'customer-profile':
        return <CustomerProfileView />;
      case 'purchase-history':
      case 'admin-purchases':
        return <PurchaseHistoryView />;
      case 'customer-bills':
        return <CustomerBillsView />;
      case 'auth':
      case 'login':
      case 'register':
        return <AuthView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'admin-customers':
        return <AdminCustomerManageView />;
      case 'admin-products':
        return <AdminProductManageView />;
      case 'admin-reports':
        return <AdminReportsView />;
      case 'admin-suppliers':
        return <AdminSuppliersView />;
      case 'admin-content':
        return <AdminContentView />;
      case 'settings':
        return <SettingsView />;
      default:
        return user ? (user.role === 'admin' ? <AdminDashboardView /> : <StoreCatalogView />) : <LandingPage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <div className="flex flex-1 relative">
        {user && <Sidebar />}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
