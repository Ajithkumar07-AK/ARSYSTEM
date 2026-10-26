import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { WebsiteContent } from '../types.ts';
import { Globe, Save, Check, RefreshCw, LayoutTemplate, Phone, Mail, Clock, MapPin, Sparkles } from 'lucide-react';

export const AdminContentView: React.FC = () => {
  const { token, showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [content, setContent] = useState<WebsiteContent>({
    storeName: 'AR Supermarket',
    storeDescription: 'Your one-stop destination for fresh groceries, farm produce, dairy, and household essentials.',
    contactEmail: 'support@arsupermarket.com',
    contactPhone: '+91 98765 43210',
    address: 'No 12, Main Bazaar Road, Greenfield City, India - 600001',
    workingHours: 'Mon - Sun: 7:00 AM to 10:30 PM',
    aboutVision: 'To empower local communities by providing affordable, uncompromised daily fresh food supplies.',
    aboutMission: 'Partnering directly with local farmers and top FMCG brands for lightning fast doorstep retail.',
    heroBannerTitle: 'Freshness Delivered to Your Kitchen Everyday',
    heroBannerSubtitle: 'Save up to 35% on organic vegetables, pure dairy products, and daily pantry staples.',
    heroImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
    announcementText: '🎉 Grand Festive Sale: Free Home Delivery on all orders above ₹499!',
    primaryColor: '#10b981',
    secondaryColor: '#3b82f6'
  });

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch {
      showToast('Error loading website content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        const data = await res.json();
        setContent(data);
        showToast('Website content updated live across the portal!');
      } else {
        showToast('Failed to save website content');
      }
    } catch {
      showToast('Network error while saving content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-mono">Loading CMS configuration...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-7 h-7 text-emerald-600" />
            Live Website Content Management (CMS)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customize homepage hero banners, announcement tickers, store descriptions, and customer support info.
          </p>
        </div>
        <button
          onClick={fetchContent}
          className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition self-start sm:self-auto"
          title="Reset / Reload"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section Banner Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <LayoutTemplate className="w-5 h-5 text-emerald-600" />
            Homepage Hero Banner & Ticker
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Brand Title *</label>
              <input
                type="text"
                required
                value={content.storeName}
                onChange={(e) => setContent({...content, storeName: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Top Announcement Bar Ticker
              </label>
              <input
                type="text"
                value={content.announcementText || ''}
                onChange={(e) => setContent({...content, announcementText: e.target.value})}
                placeholder="🎉 Free delivery above ₹499!"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="text-sm space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hero Main Banner Headline *</label>
              <input
                type="text"
                required
                value={content.heroBannerTitle}
                onChange={(e) => setContent({...content, heroBannerTitle: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hero Subtitle / Promo Copy *</label>
              <textarea
                rows={2}
                required
                value={content.heroBannerSubtitle}
                onChange={(e) => setContent({...content, heroBannerSubtitle: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hero Background Image URL</label>
              <input
                type="url"
                value={content.heroImage}
                onChange={(e) => setContent({...content, heroImage: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Store Contact & Location Details */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Store Location, Hours & Helpline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Customer Support Email
              </label>
              <input
                type="email"
                required
                value={content.contactEmail}
                onChange={(e) => setContent({...content, contactEmail: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Support Helpline Number
              </label>
              <input
                type="text"
                required
                value={content.contactPhone}
                onChange={(e) => setContent({...content, contactPhone: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Working Retail Hours
              </label>
              <input
                type="text"
                required
                value={content.workingHours}
                onChange={(e) => setContent({...content, workingHours: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="text-sm pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supermarket Physical Address *</label>
            <input
              type="text"
              required
              value={content.address}
              onChange={(e) => setContent({...content, address: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="text-sm pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store About / Description</label>
            <textarea
              rows={2}
              value={content.storeDescription}
              onChange={(e) => setContent({...content, storeDescription: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
            Company Vision & Mission Statements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Our Vision</label>
              <textarea
                rows={3}
                value={content.aboutVision}
                onChange={(e) => setContent({...content, aboutVision: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Our Mission</label>
              <textarea
                rows={3}
                value={content.aboutMission}
                onChange={(e) => setContent({...content, aboutMission: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Publishing Changes...' : 'Save & Publish Live CMS'}
          </button>
        </div>
      </form>
    </div>
  );
};
