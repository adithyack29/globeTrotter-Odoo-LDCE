import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { apiFetch } from '../api';
import FilterToolbar from '../components/FilterToolbar';
import {
  Compass,
  Plus,
  ArrowRight,
  Star,
  DollarSign,
  Briefcase,
  TrendingUp,
  Calendar,
  Wallet,
  Globe
} from 'lucide-react';

export default function DashboardPage({ onOpenNewTripModal }) {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [recommendedCities, setRecommendedCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('default');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, recRes] = await Promise.all([
          apiFetch('/trips'),
          apiFetch('/cities/recommended')
        ]);
        setTrips(tripsRes.trips || []);
        setRecommendedCities(recRes.cities || []);
      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSpentAll = trips.reduce((acc, t) => acc + (t.calculatedCosts?.grandTotal || 0), 0);
  const totalBudgetTarget = trips.reduce((acc, t) => acc + (t.totalBudget || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-8 animate-fade-in relative pb-20">
      
      {/* Hero Banner Section with Proper Spacing and Vertical Alignment */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        <div className="min-h-[340px] sm:min-h-[380px] relative flex items-end p-8 sm:p-10">
          <img
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
            alt="Banner Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Banner Content Overlay */}
          <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-white">
            <div className="space-y-3 max-w-2xl">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30 text-white shadow-sm mb-3">
                  Customized Multi-City Itineraries
                </span>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Explore The World with GlobalTrotter
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
                Trip Planning & Itinerary Management: Design multi-section itineraries, track daily budget metrics, and discover curated regional activities.
              </p>
            </div>

            {/* Overlaid Call To Action Button */}
            <button
              onClick={onOpenNewTripModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>Plan a trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Universal Filter Toolbar */}
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

      {/* "Top Regional Selections" (Local Relational Data Explorer) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Top Regional Selections</h2>
            <p className="text-xs text-slate-500 font-medium">Local Relational Data Explorer</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
            View All Cities ➔
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {recommendedCities.slice(0, 5).map((city) => (
            <div
              key={city.id}
              onClick={() => navigate('/explore')}
              className="glass-card rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-amber-600 text-[10px] font-extrabold backdrop-blur-xs">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{city.popularityScore}</span>
                </div>
                <div className="absolute bottom-2 left-2 text-white">
                  <p className="text-sm font-bold leading-tight">{city.name}</p>
                  <p className="text-[10px] text-indigo-200">{city.country}</p>
                </div>
              </div>
              <div className="p-2.5 bg-white text-[11px] font-semibold text-slate-500 flex justify-between">
                <span>{city.costIndex} Tier</span>
                <span className="text-indigo-600 font-bold">Avg $120/day</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "Previous / Recent Trips" (Interactive Budget & Expense Tracker) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Previous / Recent Trips</h2>
            <p className="text-xs text-slate-500 font-medium">Interactive Budget & Expense Tracker</p>
          </div>
          <Link to="/trips" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
            All Trips ({trips.length}) ➔
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => {
              const spent = trip.calculatedCosts?.grandTotal || 0;
              const percent = trip.totalBudget > 0 ? Math.min(100, Math.round((spent / trip.totalBudget) * 100)) : 0;

              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="glass-card rounded-3xl overflow-hidden border border-slate-200 group cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={trip.coverImageUrl} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-bold leading-tight">{trip.title}</h3>
                      <p className="text-xs text-indigo-100 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                        <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Expenses</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(spent)} / {formatCurrency(trip.totalBudget)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom-Right Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onOpenNewTripModal}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer border border-indigo-500"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a trip</span>
        </button>
      </div>
    </div>
  );
}
