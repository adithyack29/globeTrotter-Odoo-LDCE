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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Activity & City Search Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Explore global destinations and itemized activity options</p>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Search bar (e.g. Paragliding, Paris, Sushi)......."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        groupByValue={groupBy}
        onGroupByChange={setGroupBy}
        filterValue={filterBy}
        onFilterChange={setFilterBy}
        sortByValue={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Results Itemized List */}
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
              <div key={city.id} className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 bg-white shadow-xs">
                
                {/* Option and details */}
                <div className="flex items-center gap-6 flex-1 w-full">
                  <img src={city.imageUrl} alt={city.name} className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shrink-0" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{city.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-extrabold">{city.country}</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold">★ {city.popularityScore}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{city.description}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{city.activities?.length || 0} Curated Activities • {city.costIndex} Cost Tier</p>
                  </div>
                </div>

                {/* Action CTA: Add to Trip */}
                <div className="shrink-0 w-full md:w-auto">
                  {addingId === city.id ? (
                    <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <select
                        value={targetTripId}
                        onChange={(e) => setTargetTripId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                      >
                        {userTrips.map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setAddingId(null)} className="px-2 py-1 text-[10px] text-slate-500">Cancel</button>
                        <button onClick={() => handleAddStopToTrip(city.id)} className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">Confirm Add</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingId(city.id)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
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
