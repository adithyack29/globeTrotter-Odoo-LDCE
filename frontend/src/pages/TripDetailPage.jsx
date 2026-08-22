import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { MapPin, Calendar, DollarSign, ArrowDown, Plus, Share2, Sparkles, Check, ChevronRight, Edit2, Sliders } from 'lucide-react';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const { formatCurrency } = useCurrency();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  const fetchTrip = async () => {
    try {
      const res = await apiFetch(`/trips/${id}`);
      setTrip(res.trip);
    } catch (err) {
      console.error('Fetch trip error:', err);
      showToast('Trip not found', 'error');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleAutoSchedule = async () => {
    const firstStop = trip?.stops?.[0];
    if (!firstStop) {
      showToast('No city stops available to auto-schedule', 'error');
      return;
    }

    try {
      await apiFetch(`/trips/stops/${firstStop.id}/optimize`, { method: 'POST' });
      showToast('Activities sorted and auto-scheduled by route & time slots!', 'success');
      fetchTrip();
    } catch (err) {
      showToast('Failed to auto-schedule day', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading Itinerary View with Budget Section...</p>
      </div>
    );
  }

  if (!trip) return null;

  const allActivities = trip.stops?.flatMap((s) => s.stopActivities || []) || [];

  const dayGroups = [
    { dayNumber: 1, title: 'Day 1', items: allActivities.slice(0, 2) },
    { dayNumber: 2, title: 'Day 2', items: allActivities.slice(2, 4) },
    { dayNumber: 3, title: 'Day 3', items: allActivities.slice(4) }
  ];

  const currentDayGroup = dayGroups[activeDayIdx] || dayGroups[0];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-md bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Itenary for {trip.title}</h1>
            <p className="text-xs text-slate-500 mt-1">{trip.description || 'Structured physical activity flowchart and cost breakdown'}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoSchedule}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-[0.98] transition"
              title="Sort activities logically from morning to evening"
            >
              <Sliders className="w-3.5 h-3.5" />
              Auto-Schedule Day
            </button>

            <button
              onClick={() => navigate(`/builder/${trip.id}`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-[0.98] transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Sections
            </button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Target Budget</span>
            <p className="text-lg font-black text-indigo-700">{formatCurrency(trip.totalBudget)}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Total Expenses</span>
            <p className="text-lg font-black text-emerald-700">{formatCurrency(trip.calculatedCosts?.grandTotal || 0)}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Stops Planned</span>
            <p className="text-lg font-black text-slate-900">{trip.stops?.length || 0} Cities</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Share Status</span>
            <p className="text-xs font-bold text-indigo-600 mt-1">{trip.isPublic ? 'Public Share' : 'Private'}</p>
          </div>
        </div>
      </div>

      {/* Day Pills */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        {dayGroups.map((d, idx) => (
          <button
            key={d.dayNumber}
            onClick={() => setActiveDayIdx(idx)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeDayIdx === idx
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* Two-Column Connected Diagram with Staggered Entrance Animation */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-md bg-white space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200 pb-3 text-center md:text-left">
          <div className="md:col-span-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Physical Activity Flowchart</h3>
            <p className="text-xs text-slate-500">Sequential physical events connected by vertical arrows</p>
          </div>
          <div>
            <h3 className="text-lg font-black text-emerald-700 tracking-tight">Corresponding Expense</h3>
            <p className="text-xs text-slate-500">Cost tag per scheduled activity</p>
          </div>
        </div>

        {currentDayGroup.items.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">No scheduled activities recorded for {currentDayGroup.title}.</p>
        ) : (
          <div className="space-y-6">
            {currentDayGroup.items.map((item, idx) => {
              const actCost = item.customCost !== null && item.customCost !== undefined ? item.customCost : (item.activity?.cost || 0);

              return (
                <React.Fragment key={item.id}>
                  <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center animate-stagger-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    
                    {/* Left Column: Physical Activity Card */}
                    <div className="md:col-span-2 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2 shadow-xs hover:border-indigo-300 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase">
                          Activity {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{item.scheduledTime || '10:00 AM'}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{item.activity?.name || 'Sightseeing Activity'}</h4>
                      <p className="text-xs text-slate-600">{item.activity?.description || 'Curated physical exploration activity.'}</p>
                    </div>

                    {/* Right Column: Expense Card */}
                    <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1 shadow-xs hover:border-emerald-300 transition-colors text-center md:text-left">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700">Expense Tag</span>
                      <p className="text-xl font-black text-emerald-700">{formatCurrency(actCost)}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{item.activity?.category || 'General'}</p>
                    </div>
                  </div>

                  {idx < currentDayGroup.items.length - 1 && (
                    <div className="flex justify-center py-1 animate-stagger-in" style={{ animationDelay: `${idx * 100 + 50}ms` }}>
                      <div className="p-2 rounded-full bg-slate-100 border border-slate-200 text-indigo-600 shadow-xs">
                        <ArrowDown className="w-5 h-5 animate-bounce" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
