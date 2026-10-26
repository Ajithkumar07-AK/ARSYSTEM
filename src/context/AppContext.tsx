import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CustomerProfile, Product, CartItem, Purchase, Supplier, WebsiteContent, AppSettings } from '../types.ts';

interface AppContextType {
  user: any | null;
  token: string | null;
  customerProfile: CustomerProfile | null;
  cart: CartItem[];
  content: WebsiteContent;
  settings: AppSettings;
  currentView: string;
  authMode: 'login' | 'register';
  authRole: 'customer' | 'admin';
  toast: string | null;
  showToast: (msg: string) => void;
  setCurrentView: (view: string) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  setAuthRole: (role: 'customer' | 'admin') => void;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => void;
  register: (token: string, userData: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshContent: () => Promise<void>;
  addToCart: (product: Product) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateContent: (newContent: Partial<WebsiteContent>) => Promise<void>;
}

const defaultContent: WebsiteContent = {
  storeName: 'AR Super Market',
  storeDescription: 'Your one-stop neighborhood supermarket for farm-fresh groceries, pure dairy, crispy snacks, and refreshing beverages. Featuring instant POS billing and doorstep delivery.',
  contactEmail: 'support@arsupermarket.in',
  contactPhone: '+91 98765 43210',
  address: 'No. 42, Supermarket Plaza, MG Road, Bangalore, Karnataka - 560001',
  workingHours: 'Mon - Sun: 7:00 AM - 10:30 PM',
  aboutVision: 'To modernize retail grocery shopping with guaranteed freshness, digital POS checkout, and customer delight.',
  aboutMission: 'Delivering premium daily essentials at affordable prices with zero waiting lines.',
  heroBannerTitle: 'Fresh Groceries, Fast Digital Billing',
  heroBannerSubtitle: 'Shop the finest selection of organic vegetables, dairy, snacks & beverages at AR Super Market.',
  heroImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
  announcementText: '🎉 Special Fest Offer: Flat 10% OFF on Snacks & Beverages. Free Home Delivery above ₹500!',
  primaryColor: '#10b981',
  secondaryColor: '#0f172a'
};

const defaultSettings: AppSettings = {
  theme: 'light',
  fontSize: 'medium',
  language: 'English',
  notificationsEnabled: true
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'customer' | 'admin'>('customer');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    // Load auth token if present
    const savedToken = localStorage.getItem('ar_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    }
    refreshContent();
    // Record visitor
    fetch('/api/visitors', { method: 'POST' }).catch(() => {});
  }, []);

  // Apply theme class to document body
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.customerProfile) setCustomerProfile(data.customerProfile);

        // Determine view
        if (data.user.role === 'admin') {
          setCurrentView('admin-dashboard');
        } else {
          if (!data.user.isProfileCompleted) {
            setCurrentView('customer-profile');
          } else {
            setCurrentView('store');
          }
        }
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.customerProfile) setCustomerProfile(data.customerProfile);
      }
    } catch {}
  };

  const refreshContent = async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch {}
  };

  const login = async (authToken: string, userData: any) => {
    localStorage.setItem('ar_token', authToken);
    setToken(authToken);
    setUser(userData);
    showToast(`Welcome back, ${userData.fullName}!`);
    await refreshProfile();

    if (userData.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      if (!userData.isProfileCompleted) {
        setCurrentView('customer-profile');
      } else {
        setCurrentView('store');
      }
    }
  };

  const register = async (authToken: string, userData: any) => {
    localStorage.setItem('ar_token', authToken);
    setToken(authToken);
    setUser(userData);
    showToast(`Account created successfully! Welcome to AR Super Market.`);
    await refreshProfile();

    if (userData.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('customer-profile'); // Mandatory first page
    }
  };

  const logout = () => {
    localStorage.removeItem('ar_token');
    setToken(null);
    setUser(null);
    setCustomerProfile(null);
    setCart([]);
    setCurrentView('landing');
    showToast('Logged out successfully.');
  };

  // Cart Operations
  const addToCart = (product: Product) => {
    if (!user) {
      showToast('Please login or register to add items to cart.');
      setCurrentView('auth');
      return;
    }
    if (user.role === 'customer' && !user.isProfileCompleted) {
      showToast('Please complete your profile details first to start shopping.');
      setCurrentView('customer-profile');
      return;
    }
    setCart(prev => {
      const exist = prev.find(item => item.product._id === product._id);
      if (exist) {
        if (exist.quantity >= product.stock) {
          showToast(`Only ${product.stock} units available in stock.`);
          return prev;
        }
        showToast(`Increased quantity of ${product.name}`);
        return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        if (product.stock <= 0) {
          showToast('Product out of stock.');
          return prev;
        }
        showToast(`Added ${product.name} to cart.`);
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const increaseQty = (productId: string) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        if (item.quantity >= item.product.stock) {
          showToast('Max stock limit reached.');
          return item;
        }
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };

  const decreaseQty = (productId: string) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity - 1) };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
    showToast('Item removed from cart.');
  };

  const clearCart = () => setCart([]);

  const updateSettings = (newSet: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSet }));
    showToast('Settings updated successfully.');
  };

  const updateContent = async (newCont: Partial<WebsiteContent>) => {
    if (!token) return;
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCont)
      });
      if (res.ok) {
        const data = await res.json();
        setContent(data);
        showToast('Website content updated in MongoDB!');
      }
    } catch {
      showToast('Failed to update content.');
    }
  };

  const fontSizeClass = settings.fontSize === 'small' ? 'text-sm' : settings.fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <AppContext.Provider value={{
      user, token, customerProfile, cart, content, settings, currentView, authMode, authRole, toast,
      showToast, setCurrentView, setAuthMode, setAuthRole, login, logout, register, refreshProfile,
      refreshContent, addToCart, increaseQty, decreaseQty, removeItem, clearCart, updateSettings, updateContent
    }}>
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-200 ${fontSizeClass}`}>
        {toast && (
          <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
            <span className="text-xl">✨</span>
            <span className="font-medium">{toast}</span>
          </div>
        )}
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
