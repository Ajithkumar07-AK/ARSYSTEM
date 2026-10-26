import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { User, Mail, Phone, MapPin, Camera, CheckCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const CustomerProfileView: React.FC = () => {
  const { user, token, customerProfile, refreshProfile, setCurrentView, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    if (customerProfile) {
      setName(customerProfile.name || user?.fullName || '');
      setEmail(customerProfile.email || user?.email || '');
      setMobileNumber(customerProfile.mobileNumber || user?.mobileNumber || '');
      setAddress(customerProfile.address || '');
      setProfileImage(customerProfile.profileImage || '');
    } else if (user) {
      setName(user.fullName || '');
      setEmail(user.email || '');
      setMobileNumber(user.mobileNumber || '');
    }
  }, [customerProfile, user]);

  // Save automatically when profile details change with debouncing
  useEffect(() => {
    if (!token || !user || user.role !== 'customer') return;
    if (!name || !mobileNumber) return;

    const timer = setTimeout(() => {
      saveProfileAuto();
    }, 1200);

    return () => clearTimeout(timer);
  }, [name, email, mobileNumber, address, profileImage]);

  const saveProfileAuto = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/customers/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, mobileNumber, address, profileImage })
      });
      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString());
        await refreshProfile();
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
      showToast('Profile image updated & auto-saved!');
    };
    reader.readAsDataURL(file);
  };

  const isComplete = Boolean(name && mobileNumber && address);

  return (
    <div id="customer-profile-view" className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome & Status Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> First Step After Login
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Profile Details</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Please complete your mandatory profile information and delivery address. Your details save automatically in MongoDB.
          </p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shrink-0 text-center">
          <div className="text-xs text-slate-400 mb-1">Profile Status</div>
          {isComplete ? (
            <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-4 h-4" /> 100% Completed
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Pending Address
            </div>
          )}
          {saving && <div className="text-[10px] text-emerald-400 mt-1 animate-pulse">⏳ Auto saving...</div>}
          {lastSaved && !saving && <div className="text-[10px] text-slate-400 mt-1">✓ Saved at {lastSaved}</div>}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-md border border-slate-200 dark:border-slate-700 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Avatar Column */}
        <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 pb-8 lg:pb-0 lg:pr-8">
          <div className="relative group">
            <div className="w-36 h-36 rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-emerald-500/30 overflow-hidden shadow-inner flex items-center justify-center text-4xl font-bold text-slate-400">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                name ? name.charAt(0).toUpperCase() : 'C'
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition transform group-hover:scale-110">
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{name || 'Customer Account'}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{email}</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 w-full text-left flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Click camera icon to upload custom profile photo. Saves automatically!</span>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Mobile Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address (Read Only)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                disabled
                value={email}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Complete Residential / Delivery Address *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                rows={3}
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="House No, Street name, Landmark, City, State, PIN Code"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400 italic">
              {saving ? '⏳ Synchronizing with MongoDB...' : '✨ Changes are auto-saved as you type'}
            </span>

            <button
              type="button"
              onClick={() => {
                if (!isComplete) {
                  showToast('Please provide your residential address to proceed.');
                  return;
                }
                setCurrentView('store');
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-sm"
            >
              Browse Products Catalog <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
