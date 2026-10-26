import React from 'react';
import { Purchase } from '../types.ts';
import { Printer, Download, X, CheckCircle, Store } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

interface ReceiptModalProps {
  purchase: Purchase | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ purchase, onClose }) => {
  const { content } = useApp();

  if (!purchase) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Generate a clean printable receipt window or trigger print saving
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to download receipt.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Supermarket Receipt - ${purchase.invoiceNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; width: 320px; margin: 0 auto; color: #111; }
            .header { text-align: center; border-bottom: 1px dashed #444; padding-bottom: 10px; margin-bottom: 10px; }
            .title { font-size: 18px; font-weight: bold; margin: 0; }
            .meta { font-size: 12px; margin: 3px 0; }
            .table { width: 100%; font-size: 12px; border-collapse: collapse; margin: 10px 0; }
            .table th { text-align: left; border-bottom: 1px solid #444; }
            .table td { padding: 4px 0; }
            .totals { border-top: 1px dashed #444; padding-top: 10px; font-size: 13px; }
            .total-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .grand { font-size: 16px; font-weight: bold; margin-top: 8px; }
            .footer { text-align: center; font-size: 11px; margin-top: 20px; border-top: 1px dashed #444; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${content.storeName}</h1>
            <p class="meta">${content.address}</p>
            <p class="meta">GSTIN: 29AAACA1234A1Z5</p>
          </div>
          <p class="meta"><strong>Invoice:</strong> ${purchase.invoiceNumber}</p>
          <p class="meta"><strong>Date:</strong> ${new Date(purchase.purchaseDate).toLocaleString()}</p>
          <p class="meta"><strong>Customer:</strong> ${purchase.customerName}</p>
          <p class="meta"><strong>Cashier:</strong> ${purchase.cashierName}</p>
          
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${purchase.items.map(it => `
                <tr>
                  <td>${it.name.substring(0, 16)}</td>
                  <td>${it.quantity}</td>
                  <td>₹${it.price}</td>
                  <td style="text-align:right">₹${it.price * it.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div style="display:flex; justify-content:space-between; margin:3px 0">
              <span>Subtotal:</span>
              <span>₹${purchase.subtotal}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin:3px 0">
              <span>GST (5%):</span>
              <span>₹${purchase.gstAmount}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:bold; margin-top:8px">
              <span>Grand Total:</span>
              <span>₹${purchase.grandTotal}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:12px">
              <span>Payment Mode:</span>
              <span>${purchase.paymentMethod} (${purchase.paymentStatus})</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping at AR Super Market!</p>
            <p>Please keep this receipt for exchange within 7 days.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div id="receipt-modal" className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <span className="font-bold tracking-tight">POS Supermarket Receipt</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Printable Body */}
        <div className="p-6 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-4 bg-amber-50/30 dark:bg-slate-900/50 border-b border-dashed border-slate-300 dark:border-slate-700">
          <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            <h2 className="text-lg font-bold font-sans text-slate-900 dark:text-white tracking-tight">{content.storeName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">{content.address}</p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">GSTIN: 29AAACA1234A1Z5</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div>
              <span className="text-slate-500 block">Invoice Number:</span>
              <span className="font-bold">{purchase.invoiceNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Date & Time:</span>
              <span>{new Date(purchase.purchaseDate).toLocaleDateString()} {new Date(purchase.purchaseDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Customer Name:</span>
              <span className="font-semibold">{purchase.customerName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Cashier Counter:</span>
              <span>{purchase.cashierName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
                  <th className="py-1">Product Description</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Price</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchase.items.map((it, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1.5 pr-2 font-medium">{it.name}</td>
                    <td className="py-1.5 text-center">{it.quantity}</td>
                    <td className="py-1.5 text-right">₹{it.price}</td>
                    <td className="py-1.5 text-right font-semibold">₹{it.price * it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1.5 font-sans">
            <div className="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
              <span>Subtotal:</span>
              <span>₹{purchase.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
              <span>Supermarket GST (5%):</span>
              <span>₹{purchase.gstAmount}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span className="text-emerald-600 dark:text-emerald-400">₹{purchase.grandTotal}</span>
            </div>
          </div>

          {/* Payment Status Bar */}
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Status: {purchase.paymentStatus}</span>
            </div>
            <span className="text-slate-600 dark:text-slate-300">Method: <strong>{purchase.paymentMethod}</strong></span>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2 font-sans">
            Thank you for shopping with AR Super Market! <br />
            Keep invoice for returns/exchange within 7 days.
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
