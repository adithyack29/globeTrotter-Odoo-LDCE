import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import { User, Mail, Phone, MapPin, Globe, Edit2, Heart, Download, Printer, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, showToast } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
    }

    const fetchTrips = async () => {
      try {
        const res = await apiFetch('/trips');
        setTrips(res.trips || []);
      } catch (err) {
        console.error('Failed to fetch profile trips:', err);
      }
    };
    fetchTrips();
  }, [user]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const preplannedTrips = trips.filter((t) => new Date(t.startDate) > now);
  const previousTrips = trips.filter((t) => new Date(t.startDate) <= now);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Top Profile Header Panel */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-md bg-white space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          
          {/* Circular Image of the User */}
          <div className="relative shrink-0">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt="Image of the User"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
            />
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>

              {/* [ Edit Profile ] Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {isEditing ? 'Cancel Edit' : '[ Edit Profile ]'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Bio / Travel Preferences</label>
                  <textarea
                    rows="2"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Phone</span>
                  <span className="font-bold text-slate-800">{user?.phone || 'Not set'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">City</span>
                  <span className="font-bold text-slate-800">{user?.city || 'Paris'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Country</span>
                  <span className="font-bold text-slate-800">{user?.country || 'France'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Bio Notes</span>
                  <span className="font-semibold text-slate-700 truncate block">{user?.bio || 'Passionate explorer'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Split Tab Grids */}
      
      {/* 1. Preplanned Trips */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">Preplanned Trips</h2>

        {preplannedTrips.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No preplanned trips scheduled yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {preplannedTrips.map((trip) => (
              <div key={trip.id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 p-5 space-y-4 bg-white flex flex-col justify-between">
                <div>
                  <img src={trip.coverImageUrl} alt={trip.title} className="w-full h-36 rounded-xl object-cover mb-3" />
                  <h3 className="text-base font-bold text-slate-900">{trip.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    [ View ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Previous Trips */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">Previous Trips</h2>

        {previousTrips.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No previous trip history.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {previousTrips.map((trip) => (
              <div key={trip.id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 p-5 space-y-4 bg-white flex flex-col justify-between opacity-90">
                <div>
                  <img src={trip.coverImageUrl} alt={trip.title} className="w-full h-36 rounded-xl object-cover mb-3" />
                  <h3 className="text-base font-bold text-slate-900">{trip.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    [ View ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
