import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ShoppingCart, Store, User, LogOut, Menu, HelpCircle, Phone, Home } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, cart, content, currentView, setCurrentView, setAuthMode, setAuthRole, logout } = useApp();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setCurrentView(user ? (user.role === 'admin' ? 'admin-dashboard' : 'store') : 'landing')}
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            AR
          </div>
          <div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
              {content.storeName}
            </span>
            <span className="block text-xs text-emerald-600 dark:text-emerald-400 font-medium">Super Market</span>
          </div>
        </div>

        {/* Navigation Links (Landing Page) */}
        {!user && (
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <button 
              onClick={() => setCurrentView('landing')} 
              className={`flex items-center gap-1.5 transition-colors ${currentView === 'landing' ? 'text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              <Home className="w-4 h-4" /> Home
            </button>
            <button 
              onClick={() => setCurrentView('store-section')} 
              className={`flex items-center gap-1.5 transition-colors ${currentView === 'store-section' ? 'text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              <Store className="w-4 h-4" /> Store
            </button>
            <button 
              onClick={() => setCurrentView('menu-section')} 
              className={`flex items-center gap-1.5 transition-colors ${currentView === 'menu-section' ? 'text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              <Menu className="w-4 h-4" /> Menu
            </button>
            <button 
              onClick={() => setCurrentView('help-section')} 
              className={`flex items-center gap-1.5 transition-colors ${currentView === 'help-section' ? 'text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              <HelpCircle className="w-4 h-4" /> Help
            </button>
            <button 
              onClick={() => setCurrentView('contact-section')} 
              className={`flex items-center gap-1.5 transition-colors ${currentView === 'contact-section' ? 'text-emerald-600 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}`}
            >
              <Phone className="w-4 h-4" /> Contact
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {!user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setAuthMode('login'); setAuthRole('customer'); setCurrentView('auth'); }}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Login
              </button>
              <button 
                onClick={() => { setAuthMode('register'); setAuthRole('customer'); setCurrentView('auth'); }}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition"
              >
                Register
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {user.role === 'customer' && (
                <button 
                  onClick={() => setCurrentView('store')}
                  className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              )}

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline font-medium text-sm text-slate-700 dark:text-slate-200">
                  {user.fullName} ({user.role})
                </span>
              </div>

              <button 
                onClick={logout}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition flex items-center gap-1 text-sm"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
