import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
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
  X,
  Activity as ActivityIcon,
  Sliders,
  Eye
} from 'lucide-react';

export default function CityExplorerPage() {
  const { user, showToast } = useAuth();
  const { formatCurrency } = useCurrency();
  
  const [activeTab, setActiveTab] = useState('cities'); // 'cities' | 'activities'

  const [cities, setCities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // City Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');

  // Activity Explorer Filters
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategory, setActivityCategory] = useState('all');
  const [maxCost, setMaxCost] = useState(150);
  const [maxDuration, setMaxDuration] = useState(300);

  // Quick View Drawer & Add to Trip State
  const [quickViewActivity, setQuickViewActivity] = useState(null);
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
      setQuickViewActivity(null);
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

  const allActivities = cities.flatMap((c) => (c.activities || []).map((a) => ({ ...a, cityName: c.name, country: c.country })));

  const filteredActivities = allActivities.filter((a) => {
    const q = activitySearch.toLowerCase();
    const matchesSearch = a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.cityName.toLowerCase().includes(q);
    const matchesCat = activityCategory === 'all' || a.category === activityCategory;
    const matchesCost = a.cost <= maxCost;
    const matchesDur = a.durationMinutes <= maxDuration;
    return matchesSearch && matchesCat && matchesCost && matchesDur;
  });

  const selectedTrip = userTrips.find((t) => t.id === targetTripId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8 text-indigo-600" />
            Destination & Activity Explorer
          </h1>
          <p className="text-sm text-slate-500">Discover 22 worldwide travel destinations and 90+ curated experiences</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
          <button
            onClick={() => setActiveTab('cities')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cities' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Destination Cities ({cities.length})
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'activities' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ActivityIcon className="w-3.5 h-3.5 text-emerald-600" />
            Activity Catalog ({allActivities.length})
          </button>
        </div>
      </div>

      {/* TAB 1: CITIES EXPLORER */}
      {activeTab === 'cities' && (
        <div className="space-y-8">
          
          {/* City Filter Controls */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search city, country, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 text-sm"
              />
            </div>

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
              </select>

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

          {/* Cities Grid */}
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCities.map((city) => (
                <div key={city.id} className="glass-card rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between">
                  <div className="relative h-52 overflow-hidden">
                    <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border backdrop-blur-md ${
                        city.costIndex === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        city.costIndex === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {city.costIndex} Cost Tier
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

                  <div className="p-5 space-y-4 bg-white flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 leading-relaxed">{city.description}</p>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Curated Activities ({city.activities?.length || 0})
                      </h4>

                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {city.activities?.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                          >
                            <div className="space-y-0.5 max-w-[65%]">
                              <p className="font-bold text-slate-800 truncate">{act.name}</p>
                              <span className="text-indigo-600 font-bold text-[10px]">{act.category}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-emerald-600">{formatCurrency(act.cost)}</span>
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
        </div>
      )}

      {/* TAB 2: ACTIVITY SEARCH & EXPLORER (Screen 8) */}
      {activeTab === 'activities' && (
        <div className="space-y-8">
          
          {/* Advanced Activity Controls */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search activity name or city..."
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <select
                  value={activityCategory}
                  onChange={(e) => setActivityCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold"
                >
                  <option value="all">All Categories</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Culture">Culture</option>
                  <option value="Leisure">Leisure</option>
                </select>
              </div>

              {/* Max Duration */}
              <div>
                <select
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold"
                >
                  <option value={60}>Max 1 Hour</option>
                  <option value={180}>Max 3 Hours</option>
                  <option value={300}>Max 5 Hours</option>
                  <option value={999}>Any Duration</option>
                </select>
              </div>
            </div>

            {/* Cost Range Slider */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase text-slate-600 shrink-0 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Max Cost Slider: <strong className="text-emerald-600">{formatCurrency(maxCost)}</strong>
              </span>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={maxCost}
                onChange={(e) => setMaxCost(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Activities Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => (
              <div key={act.id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative h-40 rounded-xl overflow-hidden">
                    <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 text-indigo-700 text-[10px] font-extrabold border border-slate-200">
                      {act.category}
                    </div>
                    <div className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md">
                      {act.cityName}, {act.country}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-tight">{act.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{act.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-600">{formatCurrency(act.cost)}</span>
                    <span className="block text-[10px] text-slate-400">{act.durationMinutes} mins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuickViewActivity(act)}
                      className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Quick View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {user && (
                      <button
                        onClick={() => setSelectedActivity(act)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK VIEW DRAWER MODAL */}
      {quickViewActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Activity Details</h3>
              <button onClick={() => setQuickViewActivity(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-56 rounded-2xl overflow-hidden relative">
              <img src={quickViewActivity.imageUrl} alt={quickViewActivity.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 text-white text-sm font-bold drop-shadow-md">
                {quickViewActivity.cityName}, {quickViewActivity.country}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-extrabold text-slate-900">{quickViewActivity.name}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{quickViewActivity.description}</p>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                <span className="text-indigo-600">{quickViewActivity.category} • {quickViewActivity.durationMinutes} mins</span>
                <span className="text-emerald-600 text-sm">{formatCurrency(quickViewActivity.cost)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setQuickViewActivity(null)} className="px-4 py-2 text-xs text-slate-500">
                Close
              </button>
              {user && (
                <button
                  onClick={() => {
                    setSelectedActivity(quickViewActivity);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Add to Trip
                </button>
              )}
            </div>
          </div>
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
                  <button type="button" onClick={() => setSelectedActivity(null)} className="px-4 py-2 text-xs text-slate-500">
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
