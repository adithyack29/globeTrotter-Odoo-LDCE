import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Calendar, MapPin, Plus, Sparkles, Star, ArrowRight } from 'lucide-react';

export default function PlanTripPage() {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const { formatCurrency } = useCurrency();

  const [cities, setCities] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await apiFetch('/cities');
        setCities(res.cities || []);
        if (res.cities?.length > 0) {
          setSelectedPlaceId(res.cities[0].id);
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  const selectedCityObj = cities.find((c) => c.id === selectedPlaceId);

  const handleCreateTripSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlaceId || !startDate || !endDate) {
      showToast('Please fill in start date, select a place, and end date', 'error');
      return;
    }

    setCreating(true);
    try {
      const placeName = selectedCityObj ? selectedCityObj.name : 'New Tour';
      const title = tripTitle || `${placeName} Vacation Tour`;

      const newTripRes = await apiFetch('/trips', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: `Planned trip to ${placeName}`,
          startDate,
          endDate,
          totalBudget: 1500,
          coverImageUrl: selectedCityObj?.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
          isPublic: true
        })
      });

      await apiFetch(`/trips/${newTripRes.trip.id}/stops`, {
        method: 'POST',
        body: JSON.stringify({
          cityId: selectedPlaceId,
          arrivalDate: startDate,
          departureDate: endDate,
          stayCost: 300,
          transportCost: 150
        })
      });

      showToast(`Trip created for ${placeName}! Opening itinerary builder...`, 'success');
      navigate(`/builder/${newTripRes.trip.id}`);
    } catch (err) {
      showToast(err.message || 'Failed to create trip', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Create a new Trip Form Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 max-w-3xl mx-auto bg-white">
        <div className="border-b border-slate-100 pb-3">
          <h1 className="text-2xl font-black text-slate-900">Plan a new trip</h1>
          <p className="text-xs text-slate-500 mt-1">Pick dates and destination city to generate itinerary sections</p>
        </div>

        <form onSubmit={handleCreateTripSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Trip Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Summer Escape Tour"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Select a Place :</label>
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-bold focus:border-indigo-600"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country} ({c.costIndex} tier)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
            >
              {creating ? 'Creating Trip...' : 'Proceed to Build Itinerary ➔'}
            </button>
          </div>
        </form>
      </div>

      {/* Suggestions for Places to Visit / Activities to perform */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-xl font-black text-slate-900">Suggestion for Places to Visit/Activites to perform</h2>
          <p className="text-xs text-slate-500">Live curated activities in {selectedCityObj ? selectedCityObj.name : 'Selected Place'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(selectedCityObj?.activities || []).slice(0, 6).map((act) => (
            <div key={act.id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <img src={act.imageUrl} alt={act.name} className="w-full h-36 rounded-xl object-cover" />
                <h3 className="text-sm font-bold text-slate-900">{act.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{act.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-emerald-600">{formatCurrency(act.cost)}</span>
                <span className="text-indigo-600 font-semibold">{act.category} • {act.durationMinutes} min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
