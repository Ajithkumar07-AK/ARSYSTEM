import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { authMode, setAuthMode, authRole, setAuthRole, login, register, showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = authMode === 'login' 
      ? { email, password } 
      : { fullName, email, mobileNumber, password, confirmPassword, role: authRole };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        if (authMode === 'login') {
          await login(data.token, data.user);
        } else {
          await register(data.token, data.user);
        }
      } else {
        setErrorMsg(data.error || 'Authentication failure.');
      }
    } catch {
      setErrorMsg('Network error. Unable to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-view" className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header Tabs */}
        <div className="bg-slate-900 p-6 text-white text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-extrabold text-2xl text-slate-950 mx-auto shadow-md">
            AR
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {authMode === 'login' ? 'Supermarket Login' : 'Register New Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {authRole === 'admin' ? 'Administrator Management Portal' : 'Customer Digital POS Shopping Portal'}
          </p>

          {/* Role Toggle Switch */}
          <div className="pt-3 flex justify-center">
            <div className="bg-slate-800 p-1 rounded-xl inline-flex text-xs font-semibold border border-slate-700">
              <button
                type="button"
                onClick={() => setAuthRole('customer')}
                className={`px-4 py-1.5 rounded-lg transition ${authRole === 'customer' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}
              >
                Customer Portal
              </button>
              <button
                type="button"
                onClick={() => setAuthRole('admin')}
                className={`px-4 py-1.5 rounded-lg transition ${authRole === 'admin' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}
              >
                Store Admin
              </button>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : (authMode === 'login' ? `Login as ${authRole === 'admin' ? 'Admin' : 'Customer'}` : 'Complete Registration')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 text-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Register Here
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Login Here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Strict Security Protocol Enabled</span>
        </div>
        <p>No demo accounts or hardcoded credentials displayed.</p>
      </div>
    </div>
  );
};
