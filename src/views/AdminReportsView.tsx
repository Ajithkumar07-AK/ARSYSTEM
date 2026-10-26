import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { BarChart3, PieChart as PieIcon, TrendingUp, Download, Calendar, Filter, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export const AdminReportsView: React.FC = () => {
  const { token, showToast } = useApp();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'category'>('daily');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        showToast('Failed to load analytics data');
      }
    } catch {
      showToast('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const exportCSV = () => {
    if (!stats) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'daily') {
      csvContent += "Date,Revenue (INR)\n" + stats.dailyRevenue?.map((d: any) => `${d.date},${d.revenue}`).join("\n");
    } else if (reportType === 'weekly') {
      csvContent += "Week,Revenue (INR)\n" + stats.weeklyRevenue?.map((d: any) => `${d.week},${d.revenue}`).join("\n");
    } else if (reportType === 'monthly') {
      csvContent += "Month,Revenue (INR)\n" + stats.monthlyRevenue?.map((d: any) => `${d.month},${d.revenue}`).join("\n");
    } else {
      csvContent += "Category,Sales Volume\n" + stats.categorySales?.map((d: any) => `${d.category},${d.sales}`).join("\n");
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Supermarket_Report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report downloaded as CSV!');
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Generating supermarket analytics & sales charts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            Supermarket Analytics & Financial Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze POS sales velocity, daily billing revenue trends, and inventory category turnover.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-md transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report (CSV)
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-200/60 dark:bg-slate-800/80 p-1.5 rounded-xl w-fit">
        <button
          onClick={() => setReportType('daily')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            reportType === 'daily' ? 'bg-white dark:bg-slate-700 text-emerald-600 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
          }`}
        >
          Daily Billing Trends
        </button>
        <button
          onClick={() => setReportType('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            reportType === 'weekly' ? 'bg-white dark:bg-slate-700 text-emerald-600 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
          }`}
        >
          Weekly Performance
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            reportType === 'monthly' ? 'bg-white dark:bg-slate-700 text-emerald-600 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
          }`}
        >
          Monthly Revenue
        </button>
        <button
          onClick={() => setReportType('category')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            reportType === 'category' ? 'bg-white dark:bg-slate-700 text-emerald-600 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
          }`}
        >
          Category Turnover
        </button>
      </div>

      {/* Main Active Report Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            {reportType === 'category' ? 'Product Sales by Category' : `${reportType} Revenue Velocity`}
          </h2>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
            Verified POS Engine
          </span>
        </div>

        <div className="h-96 w-full pt-4">
          {reportType === 'daily' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.dailyRevenue || []}>
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem' }}
                  formatter={(val: number) => [`₹${val}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorDaily)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {reportType === 'weekly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weeklyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem' }}
                  formatter={(val: number) => [`₹${val}`, 'Weekly Sales']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {reportType === 'monthly' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem' }}
                  formatter={(val: number) => [`₹${val}`, 'Monthly Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {reportType === 'category' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categorySales || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {(stats?.categorySales || []).map((_: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem' }}
                  formatter={(val: number) => [val, 'Units Sold']}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid of Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-500" />
            Category Revenue Share
          </h3>
          <div className="space-y-3">
            {(stats?.categorySales || []).map((cat: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="font-medium">{cat.category}</span>
                </div>
                <span className="font-mono font-semibold">{cat.sales} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Audit & GST Tax Summary</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              All digital billing transactions are automatically computed with standard 5% GST tax brackets suitable for Indian retail filing.
            </p>
          </div>
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Total Revenue Collected:</span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">₹{stats?.totalRevenue?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
