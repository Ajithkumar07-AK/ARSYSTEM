import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Purchase } from '../types.ts';
import { ReceiptModal } from '../components/ReceiptModal.tsx';
import { History, Search, Download, Printer, Eye, CheckCircle2, ShoppingBag, Store } from 'lucide-react';

export const PurchaseHistoryView: React.FC = () => {
  const { token, user, showToast } = useApp();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases(data);
      }
    } catch {
      showToast('Error loading purchase history.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = purchases.filter(p => 
    p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="purchase-history-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-8 h-8 text-emerald-600" />
            <span>{user?.role === 'admin' ? 'Store Universal Transactions' : 'My Purchase History'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.role === 'admin' ? 'Comprehensive MongoDB POS transaction logs' : 'View past bills and download instant PDF invoices'}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search invoice or name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No purchase transactions logged yet</h3>
          <p className="text-xs text-slate-500">Completed billing invoices will appear here immediately.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold text-xs">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Date & Time</th>
                  {user?.role === 'admin' && <th className="p-4">Customer Name</th>}
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Grand Total</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">POS Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
                {filtered.map((pur) => (
                  <tr key={pur._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{pur.invoiceNumber}</td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(pur.purchaseDate).toLocaleDateString()} {new Date(pur.purchaseDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                    {user?.role === 'admin' && <td className="p-4 font-semibold text-slate-900 dark:text-white">{pur.customerName}</td>}
                    <td className="p-4">{pur.items.reduce((a, b) => a + b.quantity, 0)} Units</td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">₹{pur.grandTotal}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded font-medium">{pur.paymentMethod}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {pur.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(pur)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition inline-flex items-center gap-1 text-xs shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal purchase={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
