import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Search,
  MapPin,
  Star,
  Plus,
  Clock,
  Filter,
  DollarSign,
  Sparkles,
  X
} from 'lucide-react';

export default function CityExplorerPage() {
  const { user, showToast } = useAuth();
  
  const [cities, setCities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');

  // Add to Trip Modal State
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [targetTripId, setTargetTripId] = useState('');
  const [targetStopId, setTargetStopId] = useState('');

  useEffect(() => {
    const loadExplorerData = async () => {
      try {
        const [citiesRes, tripsRes] = await Promise.all([
          apiFetch('/cities'),
          user ? apiFetch('/trips') : Promise.resolve({ trips: [] })
        ]);
        setCities(citiesRes.cities || []);
        setUserTrips(tripsRes.trips || []);
      } catch (err) {
        console.error('Explorer load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadExplorerData();
  }, [user]);

  const handleAddToTripSubmit = async (e) => {
    e.preventDefault();
    if (!targetStopId) {
      showToast('Please select a destination stop in your trip', 'error');
      return;
    }

    try {
      await apiFetch(`/trips/stops/${targetStopId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          activityId: selectedActivity.id,
          customCost: selectedActivity.cost,
          notes: selectedActivity.description
        })
      });
      showToast(`Added "${selectedActivity.name}" to trip itinerary!`, 'success');
      setSelectedActivity(null);
    } catch (err) {
      showToast(err.message || 'Failed to add activity', 'error');
    }
  };

  const filteredCities = cities.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    const matchesRegion = regionFilter === 'all' || c.region === regionFilter;
    const matchesCost = costFilter === 'all' || c.costIndex === costFilter;
    return matchesSearch && matchesRegion && matchesCost;
  });

  const selectedTrip = userTrips.find((t) => t.id === targetTripId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Compass className="w-8 h-8 text-indigo-600" />
          Destination & Activity Explorer
        </h1>
        <p className="text-sm text-slate-500">Discover 22 worldwide travel destinations and 90+ curated experiences with realistic costs</p>
      </div>

      {/* Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search city, country, or keyword (e.g. Paris, Sushi, Volcano)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 text-sm"
          />
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Africa">Africa</option>
            <option value="Middle East">Middle East</option>
            <option value="Oceania">Oceania</option>
          </select>

          {/* Cost Index Filter */}
          <select
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Budget Tiers</option>
            <option value="low">Low Cost Tier</option>
            <option value="medium">Medium Cost Tier</option>
            <option value="high">High Cost Tier</option>
          </select>
        </div>
      </div>

      {/* Cities Directory */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-slate-300 space-y-2">
          <Compass className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No destinations match filters</h3>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or filter dropdowns.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCities.map((city) => (
            <div key={city.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between">
              
              {/* Cover */}
              <div className="relative h-52 overflow-hidden">
                <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border backdrop-blur-md ${
                    city.costIndex === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    city.costIndex === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {city.costIndex} Cost
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-amber-600 border border-slate-200 text-xs font-extrabold backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{city.popularityScore}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-2xl font-extrabold">{city.name}</h3>
                  <p className="text-xs text-indigo-200 font-semibold">{city.country} • {city.region}</p>
                </div>
              </div>

              {/* Description & Activities */}
              <div className="p-5 space-y-4 bg-white flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 leading-relaxed">{city.description}</p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Curated Activities ({city.activities?.length || 0})
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {city.activities?.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all text-xs"
                      >
                        <div className="space-y-0.5 max-w-[65%]">
                          <p className="font-bold text-slate-800 truncate">{act.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="text-indigo-600 font-bold">{act.category}</span>
                            <span>• {act.durationMinutes} min</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-emerald-600 text-xs">${act.cost.toFixed(2)}</span>
                          {user && (
                            <button
                              onClick={() => setSelectedActivity(act)}
                              className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                              title="Add activity to trip"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD TO TRIP INSTANT MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Experience to Trip</h3>
                <p className="text-xs text-indigo-600 font-bold">{selectedActivity.name}</p>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userTrips.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-600">You don't have any active trip itineraries created yet.</p>
                <p className="text-xs text-slate-500">Create a trip first to schedule this activity.</p>
              </div>
            ) : (
              <form onSubmit={handleAddToTripSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Select Target Trip</label>
                  <select
                    value={targetTripId}
                    onChange={(e) => {
                      setTargetTripId(e.target.value);
                      setTargetStopId('');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm"
                  >
                    <option value="">-- Choose a trip --</option>
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                {selectedTrip && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Select Destination Stop</label>
                    <select
                      value={targetStopId}
                      onChange={(e) => setTargetStopId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm"
                    >
                      <option value="">-- Choose city stop --</option>
                      {selectedTrip.stops?.map((s) => (
                        <option key={s.id} value={s.id}>{s.city?.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!targetStopId}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Add to Itinerary
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
