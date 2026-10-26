import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ShoppingBag, CheckCircle2, Truck, ShieldCheck, Clock, MapPin, Phone, Mail, HelpCircle, ArrowRight, Star, Heart, Award, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { currentView, content, setCurrentView, setAuthMode, setAuthRole } = useApp();

  useEffect(() => {
    if (['store-section', 'help-section', 'contact-section'].includes(currentView)) {
      const el = document.getElementById(currentView);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (currentView === 'menu-section') {
      const el = document.getElementById('store-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (currentView === 'contact-page') {
      const el = document.getElementById('contact-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (currentView === 'help-page') {
      const el = document.getElementById('help-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (currentView === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  const handleStartShopping = () => {
    setAuthMode('register');
    setAuthRole('customer');
    setCurrentView('auth');
  };

  const categories = [
    { name: 'Grocery', icon: '🌾', desc: 'Rice, wheat, pulses, organic oils & daily staples', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { name: 'Dairy', icon: '🥛', desc: 'Fresh farm milk, Greek yogurt, butter & artisan cheese', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { name: 'Snacks', icon: '🥨', desc: 'Crispy namkeen, baked cookies, chips & dry fruits', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    { name: 'Beverages', icon: '🧃', desc: 'Pure fruit juices, gold leaf black tea & roast coffee', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    { name: 'Personal Care', icon: '🧼', desc: 'Skin care soaps, herbal shampoos & oral hygiene', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' }
  ];

  return (
    <div id="landing-page" className="space-y-16 pb-16">
      {/* Announcement Bar */}
      {content.announcementText && (
        <div className="bg-emerald-600 text-white text-center py-2.5 px-4 text-sm font-medium shadow-sm flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{content.announcementText}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> India's Premier Digital Supermarket
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
              {content.heroBannerTitle}
            </h1>
            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl leading-relaxed">
              {content.heroBannerSubtitle}
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <button 
                onClick={handleStartShopping}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-3 text-base"
              >
                <ShoppingBag className="w-5 h-5" /> Start Shopping Online
              </button>
              <button 
                onClick={() => setCurrentView('help-section')}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2 text-base"
              >
                How POS Works <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> 100% Farm Fresh
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400 shrink-0" /> Instant Doorstep Delivery
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" /> Automated POS Invoicing
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 transform rotate-1 hover:rotate-0 transition duration-300">
              <img 
                src={content.heroImage} 
                alt="Supermarket Fresh Groceries" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About AR Super Market Section */}
      <section id="about-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 dark:border-slate-700 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">About {content.storeName}</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
              {content.storeDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Vision</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{content.aboutVision}</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                🚀
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{content.aboutMission}</p>
            </div>
          </div>

          {/* Core Contributions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
            <div className="p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">10,000+</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Delighted Customers</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Quality Guaranteed</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">&lt; 3 Sec</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Fast POS Billing</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">24/7</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Online Ordering</div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Section Overview */}
      <section id="store-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Explore Store Categories</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Browse our carefully sorted supermarket inventory aisles</p>
          </div>
          <button 
            onClick={handleStartShopping} 
            className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline flex items-center gap-1"
          >
            View All Catalog <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              onClick={handleStartShopping}
              className={`p-6 rounded-2xl transition transform hover:-translate-y-1 cursor-pointer border border-slate-200/60 dark:border-slate-700 shadow-sm flex flex-col justify-between h-48 bg-white dark:bg-slate-800`}
            >
              <div className="space-y-2">
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{cat.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{cat.desc}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-4">
                Explore Aisle &rarr;
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Help Section Guide */}
      <section id="help-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" /> Customer Ordering Guide
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">How To Order in 8 Simple Steps</h2>
            <p className="text-slate-400 text-sm">Our streamlined digital checkout process ensures zero counter delays</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: 'Step 1', title: 'Register Account', desc: 'Sign up with name, unique email & mobile number' },
              { step: 'Step 2', title: 'Login Securely', desc: 'Access your account with email and password' },
              { step: 'Step 3', title: 'Complete Profile', desc: 'Mandatory profile & delivery address setup' },
              { step: 'Step 4', title: 'Browse Products', desc: 'Explore grocery, dairy, snacks & personal care' },
              { step: 'Step 5', title: 'Add to Cart', desc: 'Select desired items and adjust exact quantities' },
              { step: 'Step 6', title: 'POS Checkout', desc: 'Automated 5% GST computation & stock deduction' },
              { step: 'Step 7', title: 'Instant Payment', desc: 'Pay via Cash at Counter or Online UPI / QR Code' },
              { step: 'Step 8', title: 'Download Bill', desc: 'Print receipt or export PDF invoice in real time' },
            ].map((st, i) => (
              <div key={i} className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl relative">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{st.step}</span>
                <h4 className="text-base font-bold text-white mt-1 mb-2">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Payment Mode Guides */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
            <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/60">
              <h4 className="font-bold text-emerald-400 text-sm mb-1">💵 Cash Purchase Guide</h4>
              <p className="text-xs text-slate-300 leading-relaxed">Select Cash during checkout. Pay at the physical cashier desk. Cashier marks status Paid or Delivered immediately.</p>
            </div>
            <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/60">
              <h4 className="font-bold text-blue-400 text-sm mb-1">📱 UPI Purchase Guide</h4>
              <p className="text-xs text-slate-300 leading-relaxed">Select Online mode. Enter your VPA / UPI ID (e.g. user@okaxis) and confirm instant payment. Invoice saves in MongoDB.</p>
            </div>
            <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/60">
              <h4 className="font-bold text-purple-400 text-sm mb-1">🔳 QR Code Payment Guide</h4>
              <p className="text-xs text-slate-300 leading-relaxed">Scan the store dynamic QR code displayed on screen using Google Pay, PhonePe, or Paytm. Bill activates instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 dark:border-slate-700 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Get In Touch</span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Contact {content.storeName}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">We are here to assist you with store queries, bulk orders, and support.</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white">Store Address</strong>
                  <span className="text-slate-600 dark:text-slate-300">{content.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <strong className="block text-slate-900 dark:text-white">Customer Support & Emergency</strong>
                  <span className="text-slate-600 dark:text-slate-300">{content.contactPhone}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <strong className="block text-slate-900 dark:text-white">Official Email</strong>
                  <span className="text-slate-600 dark:text-slate-300">{content.contactEmail}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <strong className="block text-slate-900 dark:text-white">Working Hours</strong>
                  <span className="text-slate-600 dark:text-slate-300">{content.workingHours}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between">
            {/* Google Map Placeholder */}
            <div className="w-full h-64 sm:h-80 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 overflow-hidden relative flex items-center justify-center text-center p-6">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative z-10 space-y-2">
                <MapPin className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Google Map Integration Placeholder</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">{content.address}</p>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(content.storeName + ' ' + content.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow hover:bg-emerald-700 transition"
                >
                  Open in Google Maps &nearr;
                </a>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center text-xs text-slate-500">
              <span>Follow us on Instagram, Facebook & Twitter @arsupermarket</span>
              <span>&copy; {new Date().getFullYear()} AR Super Market</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
