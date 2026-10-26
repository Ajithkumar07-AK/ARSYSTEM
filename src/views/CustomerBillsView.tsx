import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Purchase } from '../types.ts';
import { ReceiptModal } from '../components/ReceiptModal.tsx';
import { FileText, Download, Printer, Eye, Store, Calendar, CheckCircle } from 'lucide-react';

export const CustomerBillsView: React.FC = () => {
  const { token, showToast } = useApp();

  const [bills, setBills] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchBills();
  }, [token]);

  const fetchBills = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBills(data);
      }
    } catch {
      showToast('Failed to load billing invoices.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="customer-bills-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            <span>Digital Supermarket Bills & Receipts</span>
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Access, print, and download PDF copies of all your supermarket purchases
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
          <Store className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">AR Super Market Automated POS</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No bills generated yet</h3>
          <p className="text-xs text-slate-500">Your POS receipts will be archived here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => (
            <div key={bill._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 font-sans">
              <div className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{bill.invoiceNumber}</span>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(bill.purchaseDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold rounded-full uppercase">
                  {bill.paymentStatus}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Unique Items:</span>
                  <strong className="text-slate-900 dark:text-white">{bill.items.length} Products</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <strong className="text-slate-900 dark:text-white">{bill.paymentMethod}</strong>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span>Total Amount Paid:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{bill.grandTotal}</strong>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedBill(bill)}
                  className="w-full py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Eye className="w-4 h-4" /> Open Printable Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReceiptModal purchase={selectedBill} onClose={() => setSelectedBill(null)} />
    </div>
  );
};
