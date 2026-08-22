import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import {
  Compass,
  MapPin,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  Star,
  DollarSign,
  Briefcase,
  Sparkles,
  Search
} from 'lucide-react';

export default function DashboardPage({ onOpenNewTripModal }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [recommendedCities, setRecommendedCities] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-8 sm:p-10 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Travel Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, <span>{user?.name}</span> 👋
          </h1>
          
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            You have <strong className="text-white font-bold">{trips.length} active trip itineraries</strong>. Design new multi-city stops or monitor your daily budget limits.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onOpenNewTripModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-indigo-700 font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Plan New Trip
            </button>
            <Link
              to="/explore"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-800/60 hover:bg-indigo-800 border border-white/20 text-white font-semibold text-sm transition-all"
            >
              <Search className="w-4 h-4" />
              Explore Destinations
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Trips</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{trips.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Calculated Expenses</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">${totalSpentAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Budget Target</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">${totalBudgetTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Upcoming Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Upcoming Trips</h2>
            <p className="text-xs text-slate-500">Recent itineraries and multi-city travel plans</p>
          </div>
          <Link to="/trips" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All Trips ({trips.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-dashed border-slate-300 space-y-3">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No trips planned yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create your first multi-city trip itinerary with custom activities and budget tracking.</p>
            <button
              onClick={onOpenNewTripModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => {
              const spent = trip.calculatedCosts?.grandTotal || 0;
              const isOver = spent > trip.totalBudget && trip.totalBudget > 0;
              const percent = trip.totalBudget > 0 ? Math.min(100, Math.round((spent / trip.totalBudget) * 100)) : 0;

              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    
                    {/* Destination Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {trip.stops?.map((st) => (
                        <span key={st.id} className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 border border-slate-200">
                          {st.city?.name}
                        </span>
                      ))}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-bold leading-tight group-hover:text-indigo-200 transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-indigo-100 flex items-center gap-1.5 mt-0.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                        <span>
                          {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} -{' '}
                          {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {trip.description || 'No description provided.'}
                    </p>

                    {/* Budget Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Total Spent</span>
                        <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          ${spent.toFixed(2)} / ${trip.totalBudget.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-rose-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Destinations Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recommended Destinations</h2>
            <p className="text-xs text-slate-500">Top-rated cities with curated activity experiences</p>
          </div>
          <Link to="/explore" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Explore All Destinations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCities.map((city) => (
            <div
              key={city.id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-200 group flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                {/* Cost Index Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-md ${
                      city.costIndex === 'high'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : city.costIndex === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {city.costIndex} Cost
                  </span>
                </div>

                {/* Popularity Score */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-amber-600 border border-slate-200 text-xs font-extrabold backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{city.popularityScore}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-xl font-extrabold">{city.name}</h3>
                  <p className="text-xs text-indigo-200 font-semibold">{city.country} • {city.region}</p>
                </div>
              </div>

              <div className="p-4 space-y-3 bg-white flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {city.activities?.length || 0} Curated Activities
                  </span>

                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Explore City <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
