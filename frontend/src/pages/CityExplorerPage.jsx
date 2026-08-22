import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import FilterToolbar from '../components/FilterToolbar';
import { Compass, Plus, Star, MapPin, Check } from 'lucide-react';

export default function CityExplorerPage() {
  const { showToast } = useAuth();
  const { formatCurrency } = useCurrency();

  const [cities, setCities] = useState([]);
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('default');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

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
        if (tripsRes.trips?.length > 0) {
          setTargetTripId(tripsRes.trips[0].id);
        }
      } catch (err) {
        console.error('Fetch directory error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddStopToTrip = async (cityId) => {
    if (!targetTripId) {
      showToast('Please select a target trip first', 'error');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await apiFetch(`/trips/${targetTripId}/stops`, {
        method: 'POST',
        body: JSON.stringify({
          cityId,
          arrivalDate: today,
          departureDate: today,
          stayCost: 180,
          transportCost: 90
        })
      });
      showToast('City added to trip itinerary!', 'success');
      setAddingId(null);
    } catch (err) {
      showToast('Failed to add to trip', 'error');
    }
  };

  const filteredCities = cities.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Activity & City Search Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Explore global destinations and itemized activity options</p>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Search cities, activities, or destinations..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        groupByValue={groupBy}
        onGroupByChange={setGroupBy}
        filterValue={filterBy}
        onFilterChange={setFilterBy}
        sortByValue={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Results Itemized Compact Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-2">Results ({filteredCities.length})</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredCities.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No matching results found for "{searchQuery}".</p>
        ) : (
          <div className="space-y-4">
            {filteredCities.map((city) => (
              <div key={city.id} className="flex items-center gap-6 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-indigo-200 transition">
                
                {/* 100x100 Cover Image */}
                <img src={city.imageUrl} alt={city.name} className="w-[100px] h-[100px] rounded-xl object-cover border border-slate-200 shrink-0" />

                {/* Content Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{city.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-extrabold">{city.country}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold">★ {city.popularityScore}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{city.description}</p>
                  <p className="text-[11px] text-slate-400 font-semibold pt-0.5">
                    {city.activities?.length || 0} Curated Activities · {city.costIndex} Cost Tier
                  </p>
                </div>

                {/* Compact CTA */}
                <div className="shrink-0">
                  {addingId === city.id ? (
                    <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 w-48">
                      <select
                        value={targetTripId}
                        onChange={(e) => setTargetTripId(e.target.value)}
                        className="w-full px-2 py-1 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                      >
                        {userTrips.map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setAddingId(null)} className="px-2 py-1 text-[10px] text-slate-500">Cancel</button>
                        <button onClick={() => handleAddStopToTrip(city.id)} className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">Confirm</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingId(city.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Trip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
