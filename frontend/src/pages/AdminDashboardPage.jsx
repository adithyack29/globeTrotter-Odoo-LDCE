import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Shield,
  Briefcase,
  Users,
  Building,
  DollarSign,
  TrendingUp,
  MapPin,
  Search,
  ExternalLink,
  Globe
} from 'lucide-react';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminDashboardPage() {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await apiFetch('/admin/analytics');
        setData(res.analytics);
      } catch (err) {
        console.error('Failed to fetch admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading platform admin analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  const filteredPublicTrips = (data.publicTrips || []).filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-600" />
          Platform Admin Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-500">Real-time telemetry, platform user growth, expense distributions, and destination metrics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Trips Created</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{data.totalTrips}</p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Platform Users</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{data.totalUsers}</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Budget per Trip</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">{formatCurrency(data.avgBudget)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Destinations & Activities</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{data.totalCities} / {data.totalActivities}</p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Horizontal Bar Chart: Top 5 Booked Cities */}
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Top 5 Booked Destinations (Horizontal Bar Chart)
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topBookedCities} layout="vertical">
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="cityName" type="category" stroke="#64748b" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }}
                />
                <Bar dataKey="tripCount" fill="#4f46e5" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Expense Distribution across all trips */}
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Platform Expense Distribution by Category
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Public Trips Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Public Shared Itineraries Exploration Table
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search public trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Trip Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Route Stops</th>
                <th className="px-4 py-3">Target Budget</th>
                <th className="px-4 py-3 text-right">Share Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPublicTrips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{t.title}</td>
                  <td className="px-4 py-3 font-medium text-slate-600">{t.user?.name || 'Explorer'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.stops?.map((s) => (
                        <span key={s.id} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 text-[10px]">
                          {s.city?.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{formatCurrency(t.totalBudget)}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/share/${t.shareSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      View Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
