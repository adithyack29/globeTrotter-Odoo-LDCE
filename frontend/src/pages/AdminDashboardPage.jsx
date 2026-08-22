import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import FilterToolbar from '../components/FilterToolbar';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { Shield, Users, MapPin, Activity as ActIcon, TrendingUp, Search } from 'lucide-react';

export default function AdminDashboardPage() {
  const { formatCurrency } = useCurrency();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('default');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiFetch('/admin/analytics');
        setAnalytics(res.analytics);
      } catch (err) {
        console.error('Fetch admin analytics error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading Admin Panel Analytics...</p>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Panel Screen</h1>
          <p className="text-xs text-slate-500 mt-1">Platform governance, user management, city trends, and analytics</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Search bar......."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        groupByValue={groupBy}
        onGroupByChange={setGroupBy}
        filterValue={filterBy}
        onFilterChange={setFilterBy}
        sortByValue={sortBy}
        onSortByChange={setSortBy}
      />

      {/* 4 Segmented Tab Buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          [ Manage Users ]
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cities'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          [ Popular cities ]
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'activities'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          [ Popular Activities ]
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          [ User Trends and Analytics ]
        </button>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* TAB 1: Manage Users */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Registered Platform Users</h3>
          <p className="text-xs text-slate-500">Responsible for managing users and auditing their trip creation actions.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Elena Rostova</td>
                  <td className="p-3 text-slate-500">elena@globetrotter.com</td>
                  <td className="p-3">Paris, France</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Popular cities */}
      {activeTab === 'cities' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Popular Destinations Volume</h3>
          <p className="text-xs text-slate-500">Lists all popular cities visited based on current user trends.</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topDestinations || []} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="cityName" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value} Trips`, 'Bookings']} />
                <Bar dataKey="tripCount" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: Popular Activities */}
      {activeTab === 'activities' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Popular Activities & Spend Distribution</h3>
          <p className="text-xs text-slate-500">Lists popular activities travelers engage in based on trend data.</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryExpenses || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="totalSpent"
                  nameKey="category"
                  label
                >
                  {(analytics?.categoryExpenses || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [formatCurrency(val), 'Total Spend']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 4: User Trends and Analytics */}
      {activeTab === 'analytics' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">User Trends and Analytics Visualizations</h3>
          <p className="text-xs text-slate-500">Provides high-level analytical metrics across platform adoption points.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Platform Users</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">{analytics?.kpis?.totalUsers || 1}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Trips Planned</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{analytics?.kpis?.totalTrips || 1}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Trip Budget</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{formatCurrency(analytics?.kpis?.avgBudget || 2500)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
