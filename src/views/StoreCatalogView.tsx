import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product, Purchase } from '../types.ts';
import { ReceiptModal } from '../components/ReceiptModal.tsx';
import { 
  Search, Filter, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, 
  Tag, Award, Zap, ArrowRight, QrCode, CreditCard, DollarSign, Store, X
} from 'lucide-react';

export const StoreCatalogView: React.FC<{ initialMode?: string }> = ({ initialMode }) => {
  const { user, cart, addToCart, increaseQty, decreaseQty, removeItem, clearCart, customerProfile, showToast, setCurrentView } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>(initialMode || 'all'); // 'all', 'featured', 'offer', 'bestseller'
  
  // Checkout & Cart Drawer State
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');
  const [onlineType, setOnlineType] = useState<'upi' | 'qr'>('qr');
  const [upiId, setUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Receipt Popup
  const [completedPurchase, setCompletedPurchase] = useState<Purchase | null>(null);

  const categories = ['All', 'Grocery', 'Dairy', 'Snacks', 'Beverages', 'Personal Care'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCat, searchQuery, filterType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCat !== 'All') params.append('category', selectedCat);
      if (searchQuery) params.append('search', searchQuery);
      if (filterType === 'featured') params.append('featured', 'true');
      if (filterType === 'offer') params.append('offer', 'true');
      if (filterType === 'bestseller') params.append('bestSeller', 'true');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      showToast('Error loading supermarket catalog.');
    } finally {
      setLoading(false);
    }
  };

  // Compute Cart Totals
  const subtotal = cart.reduce((acc, it) => acc + (it.product.price * it.quantity), 0);
  const gstAmount = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gstAmount;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (paymentMethod === 'Online' && onlineType === 'upi' && !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. user@okaxis)');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('ar_token');
    
    const itemsPayload = cart.map(it => ({
      productId: it.product._id,
      name: it.product.name,
      price: it.product.price,
      quantity: it.quantity,
      itemTotal: it.product.price * it.quantity
    }));

    const payload = {
      customerName: customerProfile?.name || user?.fullName || 'Valued Customer',
      customerEmail: customerProfile?.email || user?.email || '',
      customerMobile: customerProfile?.mobileNumber || user?.mobileNumber || '',
      customerAddress: customerProfile?.address || 'Store Pickup / Counter POS',
      items: itemsPayload,
      paymentMethod,
      upiIdOrTransaction: paymentMethod === 'Online' ? (onlineType === 'upi' ? upiId : 'POS_DYNAMIC_QR_TXN') : 'CASH_COUNTER'
    };

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedPur = await res.json();
        setCompletedPurchase(savedPur);
        clearCart();
        setShowCartDrawer(false);
        setCheckoutStep('cart');
        fetchProducts(); // Refresh stocks
        showToast('🎉 Purchase complete! Receipt generated.');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to process checkout');
      }
    } catch {
      showToast('Network error during checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="store-catalog-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="w-8 h-8 text-emerald-600" />
            <span>AR Supermarket Inventory & Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time MongoDB stock pricing in Indian Rupees (₹)
          </p>
        </div>

        {/* Floating Cart Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2.5 text-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>View POS Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
            {grandTotal > 0 && <span className="bg-emerald-800 px-2 py-0.5 rounded-md text-xs">₹{grandTotal}</span>}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="lg:col-span-5 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search groceries, milk, snacks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="lg:col-span-7 flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                selectedCat === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Filters (Featured, Offers, Bestsellers) */}
      <div className="flex items-center gap-3 text-xs font-semibold">
        <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Quick Filter:
        </span>
        {[
          { id: 'all', label: 'All Catalog' },
          { id: 'featured', label: '⭐ Featured' },
          { id: 'offer', label: '🔥 Offers' },
          { id: 'bestseller', label: '👑 Best Sellers' }
        ].map((ft) => (
          <button
            key={ft.id}
            onClick={() => setFilterType(ft.id)}
            className={`px-3 py-1.5 rounded-lg transition ${filterType === ft.id ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            {ft.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Retrieving real-time stock from MongoDB...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No supermarket items found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or aisle category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((prod) => {
            const inCart = cart.find(c => c.product._id === prod._id);
            const isOutOfStock = prod.stock <= 0;

            return (
              <div
                key={prod._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between transition hover:shadow-md group"
              >
                <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-md uppercase">
                      {prod.category}
                    </span>
                    {prod.isOffer && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md flex items-center gap-0.5 shadow">
                        <Tag className="w-2.5 h-2.5" /> {prod.discountPercentage || 10}% OFF
                      </span>
                    )}
                    {prod.isBestSeller && (
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-md flex items-center gap-0.5 shadow">
                        <Award className="w-2.5 h-2.5" /> Best Seller
                      </span>
                    )}
                  </div>

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{prod.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Price</span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">₹{prod.price}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Available Stock</span>
                      <span className={`text-xs font-bold ${prod.stock < 10 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {prod.stock} Units
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Controls */}
                  <div className="pt-2">
                    {!inCart ? (
                      <button
                        onClick={() => addToCart(prod)}
                        disabled={isOutOfStock}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => decreaseQty(prod._id)}
                          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition text-slate-700 dark:text-slate-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sm text-slate-900 dark:text-white px-3">
                          {inCart.quantity} in Cart
                        </span>
                        <button
                          onClick={() => increaseQty(prod._id)}
                          className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition text-slate-700 dark:text-slate-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POS Cart Drawer Modal */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-base">Supermarket Billing Cart</span>
              </div>
              <button onClick={() => setShowCartDrawer(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium text-slate-500">Your POS basket is empty</p>
                  <button onClick={() => setShowCartDrawer(false)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                    Browse Aisles
                  </button>
                </div>
              ) : checkoutStep === 'cart' ? (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 text-xs text-slate-400">
                    <span>{cart.length} Unique Items</span>
                    <button onClick={clearCart} className="text-rose-600 hover:underline flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Clear All
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-700/70">
                    {cart.map((item) => (
                      <div key={item.product._id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 shrink-0">
                          <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">₹{item.product.price} each</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg">
                            <button onClick={() => decreaseQty(item.product._id)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="text-xs font-bold px-2">{item.quantity}</span>
                            <button onClick={() => increaseQty(item.product._id)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white w-14 text-right">₹{item.product.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Payment Selection Step */
                <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">Supermarket POS Billing Summary</div>
                    <div className="text-slate-600 dark:text-slate-400">Customer: <strong>{customerProfile?.name || user?.fullName}</strong></div>
                    <div className="text-slate-600 dark:text-slate-400 line-clamp-1">Address: {customerProfile?.address || 'Counter Pickup'}</div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Select Payment Mode *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Cash')}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition ${paymentMethod === 'Cash' ? 'border-emerald-600 bg-emerald-600/5 ring-2 ring-emerald-600' : 'border-slate-200 dark:border-slate-700'}`}
                      >
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                        <div>
                          <strong className="block text-sm">Cash at Desk</strong>
                          <span className="text-[10px] text-slate-400">Counter Physical Cash</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Online')}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition ${paymentMethod === 'Online' ? 'border-emerald-600 bg-emerald-600/5 ring-2 ring-emerald-600' : 'border-slate-200 dark:border-slate-700'}`}
                      >
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <div>
                          <strong className="block text-sm">Online UPI / QR</strong>
                          <span className="text-[10px] text-slate-400">Instant Digital Pay</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'Online' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setOnlineType('qr')}
                          className={`flex-1 py-1.5 rounded-lg transition ${onlineType === 'qr' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}
                        >
                          🔳 Scan QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setOnlineType('upi')}
                          className={`flex-1 py-1.5 rounded-lg transition ${onlineType === 'upi' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}
                        >
                          📱 Enter UPI ID
                        </button>
                      </div>

                      {onlineType === 'qr' ? (
                        <div className="text-center py-4 space-y-2">
                          <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-md border mx-auto flex items-center justify-center">
                            <QrCode className="w-32 h-32 text-slate-900" />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 block">Scan with GPay, PhonePe, or Paytm</span>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Amount to Scan: ₹{grandTotal}</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Your UPI VPA / ID</label>
                          <input
                            type="text"
                            required
                            placeholder="user@okaxis or user@ybl"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2"
                    >
                      {submitting ? 'Recording in MongoDB...' : `Confirm Payment of ₹${grandTotal}`}
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mt-2 text-center block"
                    >
                      &larr; Back to Item List
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Drawer Footer Totals */}
            {cart.length > 0 && checkoutStep === 'cart' && (
              <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-900 dark:text-white">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Supermarket GST (5%):</span>
                    <span className="font-medium text-slate-900 dark:text-white">₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      showToast('Please login to complete purchase.');
                      setCurrentView('auth');
                      return;
                    }
                    if (user.role === 'customer' && !user.isProfileCompleted) {
                      showToast('Please complete your profile details first.');
                      setCurrentView('customer-profile');
                      return;
                    }
                    setCheckoutStep('payment');
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  Proceed to POS Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POS Receipt Modal Popup */}
      <ReceiptModal purchase={completedPurchase} onClose={() => setCompletedPurchase(null)} />
    </div>
  );
};
