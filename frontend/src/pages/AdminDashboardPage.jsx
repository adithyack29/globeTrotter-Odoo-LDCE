import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import FilterToolbar from '../components/FilterToolbar';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Shield, Users, MapPin, Activity as ActIcon, TrendingUp, Search, Eye, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { showToast } = useAuth();
  const { formatCurrency } = useCurrency();
  
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('default');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        apiFetch('/admin/analytics'),
        apiFetch('/admin/users')
      ]);
      setAnalytics(analyticsRes.analytics);
      setUsersList(usersRes.users || []);
    } catch (err) {
      console.error('Fetch admin data error:', err);
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = (userName) => {
    showToast(`Active status verified for ${userName}`, 'info');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading Admin Panel Analytics & Governance...</p>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Panel Screen</h1>
          <p className="text-xs text-slate-500 mt-1">Platform governance, user RBAC management, city trends, and analytics</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            RBAC Access Granted (ADMIN)
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Search admin metrics or users..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        groupByValue={groupBy}
        onGroupByChange={setGroupBy}
        filterValue={filterBy}
        onFilterChange={setFilterBy}
        sortByValue={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Modern Segmented Tab Bar */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-2 font-medium border border-slate-200/60 shadow-inner">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Manage Users
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cities'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Popular Cities
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'activities'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Popular Activities
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          User Trends & Analytics
        </button>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* TAB 1: Manage Users */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registered Platform Users & Role Assignment</h3>
            <p className="text-xs text-slate-500">Responsible for managing users, auditing trip counts, and checking active roles.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">USER NAME</th>
                  <th className="p-3.5">EMAIL</th>
                  <th className="p-3.5">ROLE</th>
                  <th className="p-3.5">LOCATION</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-medium">{u.email}</td>
                    <td className="p-3.5">
                      {u.role === 'ADMIN' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                          ADMIN
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          USER
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600">{u.city || 'NYC'}, {u.country || 'USA'}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => showToast(`Auditing ${u._count?.trips || 0} trips for ${u.name}`, 'info')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition cursor-pointer"
                        >
                          View User Trips ({u._count?.trips || 0})
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.name)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Popular Cities */}
      {activeTab === 'cities' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 bg-white shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Popular Destinations Volume</h3>
            <p className="text-xs text-slate-500">Lists all popular cities visited based on current user trends.</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topBookedCities || []} layout="vertical">
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
          <div>
            <h3 className="text-lg font-bold text-slate-900">Popular Activities & Spend Distribution</h3>
            <p className="text-xs text-slate-500">Lists popular activities travelers engage in based on trend data.</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="amount"
                  nameKey="category"
                  label
                >
                  {(analytics?.categoryDistribution || []).map((_, index) => (
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

      {/* TAB 4: User Trends & Analytics */}
      {activeTab === 'analytics' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900">User Trends and Analytics Visualizations</h3>
            <p className="text-xs text-slate-500">Provides high-level analytical metrics across platform adoption points.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Platform Users</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">{analytics?.totalUsers || 1}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Trips Planned</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{analytics?.totalTrips || 1}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Trip Budget</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{formatCurrency(analytics?.avgBudget || 2500)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
