import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import {
  User,
  Mail,
  Globe,
  Printer,
  Download,
  Shield,
  Edit2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, showToast } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatarUrl: user?.avatarUrl || '',
    language: user?.language || 'English'
  });

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatarUrl: user.avatarUrl || '',
        language: user.language || 'English'
      });
    }

    const fetchUserTrips = async () => {
      try {
        const res = await apiFetch('/trips');
        setTrips(res.trips || []);
      } catch (err) {
        console.error('Fetch user trips error:', err);
      }
    };
    fetchUserTrips();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trips, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `globe_trotter_trips_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Trip data exported to JSON file!', 'success');
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-indigo-600" />
          User Profile & Preferences
        </h1>
        <p className="text-sm text-slate-500">Manage personal account details, language, and export trip summaries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 text-center shadow-xs">
          <div className="relative inline-block">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-indigo-200 mx-auto shadow-md"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              {user?.email}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Account Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Total Trips Planned:</span>
              <span className="font-bold text-slate-900">{trips.length}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Language:</span>
              <span className="font-bold text-indigo-600">{user?.language || 'English'}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Edit Form */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-600" />
              Edit Account Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Language Preference</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Japanese">Japanese</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Export & Print */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 no-print shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Export & Backup Data
            </h3>
            <p className="text-xs text-slate-500">Download your full trip itineraries or print a summary document for offline travel</p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Export Trips JSON
              </button>

              <button
                onClick={handlePrintSummary}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                Print Trip Summary Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
