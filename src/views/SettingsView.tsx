import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Settings, Moon, Sun, Bell, Shield, Key, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, user, showToast } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword) return;
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters');
      return;
    }
    showToast('Security password updated successfully!');
    setCurrPassword('');
    setNewPassword('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-emerald-600" />
            Account & System Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage portal appearance, notification preferences, and account security credentials.
          </p>
        </div>
      </div>

      {/* Portal Appearance */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          Display & Appearance
        </h2>

        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Portal Theme Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light daytime retail mode and high-contrast dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium transition ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-amber-400' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-600" /> Email Order Notifications & Offers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Receive instant invoice receipts and promotional grocery discounts via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => {
                setNotifications(!notifications);
                showToast(notifications ? 'Notifications disabled' : 'Notifications enabled');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Account Credentials & Password
        </h2>

        <div className="text-xs text-slate-500 mb-2">
          Logged in as <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.fullName} ({user?.email})</span> - Role: <span className="uppercase font-mono text-emerald-600 font-bold">{user?.role}</span>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={currPassword}
                onChange={(e) => setCurrPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password (min 6 chars)</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
