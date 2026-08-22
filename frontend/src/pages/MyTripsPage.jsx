import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import FilterToolbar from '../components/FilterToolbar';
import { Map, Calendar, ArrowRight, Plus } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Page Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Trip Listing</h1>
          <p className="text-xs text-slate-500 mt-1">Categorized agenda across Ongoing, Up-coming, and Completed travels</p>
        </div>

        <button
          onClick={onOpenNewTripModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Plan New Trip
        </button>
      </div>

      {/* Reusable Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Search trips by title or city..."
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
        <div className="space-y-10">
          
          {/* SECTION 1: ONGOING TRIPS */}
          <div className="space-y-4">
            <div className="border-b border-slate-200/80 pb-2.5">
              <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                ONGOING TRIPS ({filterList(categorizedTrips.ongoing).length})
              </h2>
            </div>

            {filterList(categorizedTrips.ongoing).length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-xs text-slate-400 italic text-center">
                No trips currently in progress.
              </div>
            ) : (
              <div className="space-y-4">
                {filterList(categorizedTrips.ongoing).map((trip) => (
                  <div key={trip.id} className="border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5 flex-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold w-fit">
                        Active Now
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">{trip.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="whitespace-nowrap">{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed">{trip.description || 'Active multi-city journey'}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-emerald-600 whitespace-nowrap">
                        Spent: {formatCurrency(trip.calculatedCosts?.grandTotal || 0)}
                      </div>
                      <button
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <span>View Itinerary</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: UP-COMING TRIPS */}
          <div className="space-y-4">
            <div className="border-b border-slate-200/80 pb-2.5">
              <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                UP-COMING TRIPS ({filterList(categorizedTrips.upcoming).length})
              </h2>
            </div>

            {filterList(categorizedTrips.upcoming).length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-xs text-slate-400 italic text-center">
                No upcoming trips scheduled.
              </div>
            ) : (
              <div className="space-y-4">
                {filterList(categorizedTrips.upcoming).map((trip) => (
                  <div key={trip.id} className="border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5 flex-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold w-fit">
                        Upcoming
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">{trip.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="whitespace-nowrap">{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed">{trip.description || 'Scheduled travel itinerary'}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-indigo-600 whitespace-nowrap">
                        Budget: {formatCurrency(trip.totalBudget)}
                      </div>
                      <button
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <span>View Itinerary</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: COMPLETED TRIPS */}
          <div className="space-y-4">
            <div className="border-b border-slate-200/80 pb-2.5">
              <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                COMPLETED TRIPS ({filterList(categorizedTrips.completed).length})
              </h2>
            </div>

            {filterList(categorizedTrips.completed).length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-xs text-slate-400 italic text-center">
                No past trips recorded.
              </div>
            ) : (
              <div className="space-y-4">
                {filterList(categorizedTrips.completed).map((trip) => (
                  <div key={trip.id} className="border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-90">
                    <div className="space-y-1.5 flex-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold w-fit">
                        Completed
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">{trip.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="whitespace-nowrap">{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed">{trip.description || 'Past trip history log'}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-700 whitespace-nowrap">
                        Spent: {formatCurrency(trip.calculatedCosts?.grandTotal || 0)}
                      </div>
                      <button
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <span>View Itinerary</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
