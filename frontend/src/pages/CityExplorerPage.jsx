import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Search, Plus, Star, MapPin, ChevronDown } from 'lucide-react';

const REGIONS = ['All', 'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'];
const COST_TIERS = [
  { value: 'all', label: 'All Budgets' },
  { value: 'budget', label: '$ Budget' },
  { value: 'medium', label: '$$ Medium' },
  { value: 'high', label: '$$$ High' },
];
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'cost_asc', label: 'Cost: Low to High' },
  { value: 'cost_desc', label: 'Cost: High to Low' },
];
const COST_BADGE = {
  budget: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  high: 'bg-rose-50 text-rose-700 border border-rose-200',
};
const COST_LABEL = { budget: '$ Budget', medium: '$$ Medium', high: '$$$ High' };

export default function CityExplorerPage() {
  const { showToast } = useAuth();
  const { formatCurrency } = useCurrency();

  const [cities, setCities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [costFilter, setCostFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  const [targetTripId, setTargetTripId] = useState('');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesRes, tripsRes] = await Promise.all([
          apiFetch('/cities'),
          apiFetch('/trips')
        ]);
        setCities(citiesRes.cities || []);
        setUserTrips(tripsRes.trips || []);
        if (tripsRes.trips?.length > 0) setTargetTripId(tripsRes.trips[0].id);
      } catch (err) {
        console.error('Fetch directory error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddStopToTrip = async (cityId) => {
    if (!targetTripId) { showToast('Please select a target trip first', 'error'); return; }
    try {
      const today = new Date().toISOString().split('T')[0];
      await apiFetch(`/trips/${targetTripId}/stops`, {
        method: 'POST',
        body: JSON.stringify({ cityId, arrivalDate: today, departureDate: today, stayCost: 180, transportCost: 90 })
      });
      showToast('City added to trip itinerary!', 'success');
      setAddingId(null);
    } catch (err) {
      showToast('Failed to add to trip', 'error');
    }
  };

  const filteredCities = cities
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const matchRegion = activeRegion === 'All' || c.region === activeRegion;
      const matchCost = costFilter === 'all' || c.costIndex === costFilter;
      return matchSearch && matchRegion && matchCost;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.popularityScore - a.popularityScore;
      const costOrder = { budget: 1, medium: 2, high: 3 };
      if (sortBy === 'cost_asc') return (costOrder[a.costIndex] || 2) - (costOrder[b.costIndex] || 2);
      if (sortBy === 'cost_desc') return (costOrder[b.costIndex] || 2) - (costOrder[a.costIndex] || 2);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Explore Cities &amp; Activities</h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover {cities.length} curated global destinations with hand-picked experiences
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search destinations, countries, or activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium shadow-xs placeholder:text-slate-400 transition"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Region Chips */}
        <div className="flex flex-wrap gap-2 flex-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeRegion === r
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Cost + Sort Dropdowns */}
        <div className="flex gap-2 shrink-0">
          <div className="relative">
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="h-9 appearance-none pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {COST_TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 appearance-none pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm font-semibold text-slate-500">
        {filteredCities.length} destination{filteredCities.length !== 1 ? 's' : ''}
        {activeRegion !== 'All' ? ` in ${activeRegion}` : ''}
        {searchQuery ? ` matching "${searchQuery}"` : ''}
      </p>

      {/* 3-Column Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-slate-500 font-semibold">No destinations found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col"
            >
              {/* Cover Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold backdrop-blur-sm ${COST_BADGE[city.costIndex] || 'bg-white/80 text-slate-700'}`}>
                    {COST_LABEL[city.costIndex] || city.costIndex}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-white text-[11px] font-bold">{city.popularityScore}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-black text-slate-900">{city.name}</h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">{city.region}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{city.country}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{city.description}</p>
                </div>

                {/* Activity Category Pills */}
                {city.activities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(city.activities.map((a) => a.category))].slice(0, 3).map((cat) => (
                      <span key={cat} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-semibold rounded-md">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-slate-400 font-semibold">
                  {city.activities?.length || 0} curated activities
                </p>

                {/* Add to Trip CTA */}
                <div className="mt-auto">
                  {addingId === city.id ? (
                    <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <select
                        value={targetTripId}
                        onChange={(e) => setTargetTripId(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900"
                      >
                        {userTrips.map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setAddingId(null)} className="px-2 py-1 text-[10px] text-slate-500 cursor-pointer">Cancel</button>
                        <button onClick={() => handleAddStopToTrip(city.id)} className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg cursor-pointer">Confirm Add</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingId(city.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
