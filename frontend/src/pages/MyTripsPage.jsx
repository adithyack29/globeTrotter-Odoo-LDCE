import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Map,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Copy,
  Edit2,
  Trash2,
  Globe,
  Lock,
  AlertTriangle
} from 'lucide-react';

export default function MyTripsPage({ onOpenNewTripModal, onEditTripModal }) {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchTrips = async () => {
    try {
      const res = await apiFetch('/trips');
      setTrips(res.trips || []);
      // Local resilience cache
      localStorage.setItem('gt_trips_cache', JSON.stringify(res.trips || []));
    } catch (err) {
      console.error('Fetch trips error:', err);
      // Offline fallback
      const cached = localStorage.getItem('gt_trips_cache');
      if (cached) {
        setTrips(JSON.parse(cached));
        showToast('Loaded offline cached trips', 'info');
      } else {
        showToast('Failed to load trips', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDuplicate = async (e, tripId) => {
    e.stopPropagation();
    try {
      await apiFetch(`/trips/${tripId}/duplicate`, { method: 'POST' });
      showToast('Trip duplicated successfully!', 'success');
      fetchTrips();
    } catch (err) {
      showToast('Failed to duplicate trip', 'error');
    }
  };

  const handleDelete = async (e, tripId) => {
    e.stopPropagation();
    try {
      await apiFetch(`/trips/${tripId}`, { method: 'DELETE' });
      showToast('Trip deleted successfully', 'info');
      setDeleteConfirmId(null);
      fetchTrips();
    } catch (err) {
      showToast('Failed to delete trip', 'error');
    }
  };

  const filteredTrips = trips.filter((t) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = t.title.toLowerCase().includes(q);
    const descMatch = t.description?.toLowerCase().includes(q);
    const cityMatch = t.stops?.some((s) => s.city?.name?.toLowerCase().includes(q));
    return titleMatch || descMatch || cityMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Map className="w-8 h-8 text-indigo-600" />
            My Trip Itineraries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage, organize, duplicate, and audit all your custom travel plans</p>
        </div>

        <button
          onClick={onOpenNewTripModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Plan New Trip
        </button>
      </div>

      {/* Search Control */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by trip name or destination city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 text-sm transition-colors"
        />
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-slate-300 space-y-4">
          <Map className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No trips found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery ? `No matching trips for "${searchQuery}"` : 'You haven\'t created any travel itineraries yet.'}
          </p>
          <button
            onClick={onOpenNewTripModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const spent = trip.calculatedCosts?.grandTotal || 0;
            const isOver = spent > trip.totalBudget && trip.totalBudget > 0;
            const percent = trip.totalBudget > 0 ? Math.min(100, Math.round((spent / trip.totalBudget) * 100)) : 0;

            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="glass-card rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer flex flex-col justify-between"
              >
                {/* Cover Header */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Share Public Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-800 border border-slate-200">
                    {trip.isPublic ? (
                      <>
                        <Globe className="w-3 h-3 text-indigo-600" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Private</span>
                      </>
                    )}
                  </div>

                  {/* Actions Dropdown */}
                  <div className="absolute top-3 right-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTripModal(trip);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:text-indigo-600 hover:bg-white transition-colors border border-slate-200 shadow-xs cursor-pointer"
                      title="Edit Trip"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(e, trip.id)}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:text-indigo-600 hover:bg-white transition-colors border border-slate-200 shadow-xs cursor-pointer"
                      title="Duplicate Trip"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(deleteConfirmId === trip.id ? null : trip.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-rose-200 shadow-xs cursor-pointer"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Badges */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-bold leading-tight group-hover:text-indigo-200 transition-colors">
                      {trip.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {trip.stops?.map((st) => (
                        <span key={st.id} className="px-2 py-0.5 rounded-md bg-white/90 text-slate-800 text-[10px] font-bold border border-slate-200">
                          {st.city?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 bg-white flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {trip.description || 'No notes provided.'}
                    </p>
                  </div>

                  {/* Delete Confirmation Box */}
                  {deleteConfirmId === trip.id ? (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                      <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Delete this trip permanently?
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, trip.id)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-rose-600 text-white font-bold hover:bg-rose-700"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Budget Progress Bar */
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Total Expenses</span>
                        <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          ${spent.toFixed(2)} / ${trip.totalBudget.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-rose-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
