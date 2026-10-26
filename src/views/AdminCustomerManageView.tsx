import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { User, Search, Trash2, Edit, ShieldAlert, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';

export const AdminCustomerManageView: React.FC = () => {
  const { token, showToast } = useApp();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const fetchCustomers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch {
      showToast('Error loading customer directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete customer "${name}" and all associated invoices?`)) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCustomers(customers.filter(c => c._id !== id));
        showToast('Customer account & purchases wiped immediately.');
      }
    } catch {
      showToast('Failed to delete customer.');
    }
  };

  const filtered = customers.filter(c => 
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobileNumber?.includes(search)
  );

  return (
    <div id="admin-customer-manage-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-8 h-8 text-emerald-600" />
            <span>Customer Universal Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, edit, or wipe customer accounts and transactional histories in real time
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, email, mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border space-y-3">
          <User className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No registered customers found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold text-xs">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4">Residential Address</th>
                  <th className="p-4">Profile Status</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
                {filtered.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {cust.fullName ? cust.fullName.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <span>{cust.fullName || 'Unnamed'}</span>
                    </td>
                    <td className="p-4 text-slate-500">{cust.email}</td>
                    <td className="p-4 font-mono">{cust.mobileNumber || 'N/A'}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{cust.address || 'Pending'}</td>
                    <td className="p-4">
                      {cust.isProfileCompleted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium text-xs">Incomplete</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(cust._id, cust.fullName || cust.email)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                        title="Delete customer immediately"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
