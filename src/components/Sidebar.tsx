import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { 
  Home, Store, Menu as MenuIcon, User, ShoppingBag, History, FileText, 
  Phone, HelpCircle, Settings, LogOut, LayoutDashboard, Users, Package, 
  BarChart3, PieChart, Truck, Globe
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, currentView, setCurrentView, logout } = useApp();

  if (!user) return null;

  const customerNavItems = [
    { label: 'Home', view: 'landing', icon: Home },
    { label: 'Store', view: 'store', icon: Store },
    { label: 'Menu', view: 'menu-catalog', icon: MenuIcon },
    { label: 'Profile', view: 'customer-profile', icon: User },
    { label: 'Customer Details', view: 'customer-profile', icon: User },
    { label: 'Purchase Products', view: 'store', icon: ShoppingBag },
    { label: 'Purchase History', view: 'purchase-history', icon: History },
    { label: 'Bills', view: 'customer-bills', icon: FileText },
    { label: 'Contact', view: 'contact-page', icon: Phone },
    { label: 'Help', view: 'help-page', icon: HelpCircle },
    { label: 'Settings', view: 'settings', icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Dashboard', view: 'admin-dashboard', icon: LayoutDashboard },
    { label: 'Customers', view: 'admin-customers', icon: Users },
    { label: 'Products', view: 'admin-products', icon: Package },
    { label: 'Purchases', view: 'admin-purchases', icon: ShoppingBag },
    { label: 'Reports', view: 'admin-reports', icon: BarChart3 },
    { label: 'Analytics', view: 'admin-reports', icon: PieChart },
    { label: 'Suppliers', view: 'admin-suppliers', icon: Truck },
    { label: 'Website Content', view: 'admin-content', icon: Globe },
    { label: 'Settings', view: 'settings', icon: Settings },
  ];

  const navItems = user.role === 'admin' ? adminNavItems : customerNavItems;

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
      <div>
        <div className="px-3 py-2 mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {user.role === 'admin' ? 'Supermarket Admin' : 'Customer Portal'}
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={idx}
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-emerald-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
