import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import {
  User,
  Mail,
  Globe,
  Printer,
  Download,
  Shield,
  Edit2,
  Heart,
  AlertTriangle,
  Trash2,
  X,
  Star
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, showToast } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatarUrl: user?.avatarUrl || '',
    language: user?.language || 'English'
  });

  const [trips, setTrips] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatarUrl: user.avatarUrl || '',
        language: user.language || 'English'
      });
    }

    const fetchUserData = async () => {
      try {
        const [tripsRes, wishRes] = await Promise.all([
          apiFetch('/trips'),
          apiFetch('/users/wishlist')
        ]);
        setTrips(tripsRes.trips || []);
        setWishlist(wishRes.wishlist || []);
      } catch (err) {
        console.error('Fetch user data error:', err);
      }
    };
    fetchUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      showToast('Profile saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWishlist = async (cityId) => {
    try {
      await apiFetch(`/users/wishlist/${cityId}`, { method: 'POST' });
      setWishlist((prev) => prev.filter((item) => item.cityId !== cityId));
      showToast('Destination removed from wishlist', 'info');
    } catch (err) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await apiFetch('/users/profile', { method: 'DELETE' });
      showToast('Account permanently deleted', 'info');
      logout();
      navigate('/login');
    } catch (err) {
      showToast('Failed to delete account', 'error');
    } finally {
      setDeleting(false);
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
        <p className="text-sm text-slate-500">Manage personal account details, saved wishlist destinations, and export trip summaries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
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
                <span>Wishlist Cities:</span>
                <span className="font-bold text-indigo-600">{wishlist.length}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-rose-700 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Danger Zone
            </h4>
            <p className="text-xs text-rose-600 leading-relaxed">
              Permanently remove your account and all associated trip itineraries.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Delete Account
            </button>
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

          {/* Saved / Wishlist Destinations */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Saved / Wishlist Destinations ({wishlist.length})
            </h3>

            {wishlist.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No saved wishlist destinations yet. Browse the City Explorer to bookmark dream cities.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <img src={item.city?.imageUrl} alt={item.city?.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.city?.name}</p>
                        <p className="text-xs text-slate-500">{item.city?.country}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveWishlist(item.cityId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export & Backup Data */}
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

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Confirm Account Deletion
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete your account? This action will perform a cascade deletion of all your planned trips, itineraries, activities, and budget history.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-md"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
