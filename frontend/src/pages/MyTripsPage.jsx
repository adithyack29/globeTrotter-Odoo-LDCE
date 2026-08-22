import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import FilterToolbar from '../components/FilterToolbar';
import { Map, Calendar, Eye, Edit2, Copy, Trash2, ArrowRight, Plus } from 'lucide-react';

export default function MyTripsPage({ onOpenNewTripModal, onEditTripModal }) {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const { formatCurrency } = useCurrency();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('default');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const fetchTrips = async () => {
    try {
      const res = await apiFetch('/trips');
      setTrips(res.trips || []);
    } catch (err) {
      console.error('Fetch trips error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const now = new Date();
  
  const categorizedTrips = trips.reduce(
    (acc, t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);

      if (now >= start && now <= end) {
        acc.ongoing.push(t);
      } else if (now < start) {
        acc.upcoming.push(t);
      } else {
        acc.completed.push(t);
      }
      return acc;
    },
    { ongoing: [], upcoming: [], completed: [] }
  );

  const filterList = (list) => {
    return list.filter((t) => {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Page Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Trip Listing</h1>
          <p className="text-xs text-slate-500 mt-1">Categorized agenda across Ongoing, Up-coming, and Completed travels</p>
        </div>

        <button
          onClick={onOpenNewTripModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Plan New Trip
        </button>
      </div>

      {/* Reusable Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Search bar......."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        groupByValue={groupBy}
        onGroupByChange={setGroupBy}
        filterValue={filterBy}
        onFilterChange={setFilterBy}
        sortByValue={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Categorized Sections */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECTION 1: Ongoing */}
          <div className="space-y-3">
            <h2 className="text-lg font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Ongoing Trips ({filterList(categorizedTrips.ongoing).length})
            </h2>

            {filterList(categorizedTrips.ongoing).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No trips currently in progress.</p>
            ) : (
              filterList(categorizedTrips.ongoing).map((trip) => (
                <div key={trip.id} className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active Now</span>
                    <h3 className="text-xl font-bold text-slate-900">{trip.title}</h3>
                    <p className="text-xs text-slate-500">Short Over View of the Trip: {trip.description || 'Current active multi-city journey'}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(trip.calculatedCosts?.grandTotal || 0)}</span>
                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      [ View ]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SECTION 2: Up-coming */}
          <div className="space-y-3">
            <h2 className="text-lg font-black text-indigo-700 uppercase tracking-wider border-b border-slate-200 pb-2">
              Up-coming Trips ({filterList(categorizedTrips.upcoming).length})
            </h2>

            {filterList(categorizedTrips.upcoming).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No upcoming trips scheduled.</p>
            ) : (
              filterList(categorizedTrips.upcoming).map((trip) => (
                <div key={trip.id} className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">Upcoming</span>
                    <h3 className="text-xl font-bold text-slate-900">{trip.title}</h3>
                    <p className="text-xs text-slate-500">Short Over View of the Trip: {trip.description || 'Scheduled travel itinerary'}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-indigo-600">Budget: {formatCurrency(trip.totalBudget)}</span>
                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      [ View ]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SECTION 3: Completed */}
          <div className="space-y-3">
            <h2 className="text-lg font-black text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-2">
              Completed Trips ({filterList(categorizedTrips.completed).length})
            </h2>

            {filterList(categorizedTrips.completed).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No past trips recorded.</p>
            ) : (
              filterList(categorizedTrips.completed).map((trip) => (
                <div key={trip.id} className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-white opacity-90">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">Completed</span>
                    <h3 className="text-xl font-bold text-slate-900">{trip.title}</h3>
                    <p className="text-xs text-slate-500">Short Over View of the Trip: {trip.description || 'Past trip history log'}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-700">Spent: {formatCurrency(trip.calculatedCosts?.grandTotal || 0)}</span>
                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      [ View ]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
