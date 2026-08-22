import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  Copy,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  User,
  Check,
  Sparkles,
  Printer
} from 'lucide-react';

export default function PublicTripPage() {
  const { shareSlug } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        const res = await apiFetch(`/share/${shareSlug}`);
        setTrip(res.trip);
      } catch (err) {
        console.error('Fetch public trip error:', err);
        showToast('Public trip not found or link is private', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrip();
  }, [shareSlug]);

  const handleCopyTrip = async () => {
    if (!user) {
      showToast('Please sign in to copy this itinerary to your account!', 'info');
      navigate('/login');
      return;
    }

    setCopying(true);
    try {
      const res = await apiFetch(`/share/${shareSlug}/copy`, { method: 'POST' });
      showToast('Trip copied to your account!', 'success');
      navigate(`/trips/${res.newTripId}`);
    } catch (err) {
      showToast(err.message || 'Failed to copy trip', 'error');
    } finally {
      setCopying(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading public travel itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 glass-panel rounded-3xl space-y-4 border border-slate-200 shadow-lg">
        <Globe className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-800">Shared Trip Not Found</h2>
        <p className="text-xs text-slate-500">This itinerary link may be private or expired.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Return to Globe Trotter Home
        </Link>
      </div>
    );
  }

  const grandTotal = trip.calculatedCosts?.grandTotal || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Public Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl glass-panel">
        <div className="h-72 sm:h-96 relative">
          <img
            src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

          {/* Top Banner Tag */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-extrabold text-indigo-700 border border-slate-200">
              <Globe className="w-4 h-4 text-indigo-600" />
              Public Shared Itinerary (Read-Only)
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 text-xs font-bold text-slate-800 border border-slate-200 backdrop-blur-md hover:bg-white transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Print / Export PDF</span>
            </button>
          </div>

          {/* Bottom Title & Fork Copy Action */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-indigo-100 font-semibold">
                <User className="w-4 h-4 text-indigo-300" />
                <span>Created by <strong className="text-white font-extrabold">{trip.user?.name || 'Explorer'}</strong></span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{trip.title}</h1>
              
              <p className="text-xs sm:text-sm text-indigo-100 flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-indigo-300" />
                <span>
                  {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} –{' '}
                  {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </p>
            </div>

            {/* FORK COPY BUTTON */}
            <button
              onClick={handleCopyTrip}
              disabled={copying}
              className="no-print flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Copy className="w-5 h-5" />
              <span>{copying ? 'Copying Itinerary...' : 'Copy Trip to My Plans'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview & Total */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-slate-200 space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Trip Overview
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {trip.description || 'No detailed description provided by the author.'}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-2 flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Calculated Cost</span>
          <p className="text-3xl font-extrabold text-emerald-600">${grandTotal.toFixed(2)}</p>
          <p className="text-xs text-slate-500 font-semibold">Target Budget: ${trip.totalBudget.toFixed(2)}</p>
        </div>
      </div>

      {/* Multi-city Agenda */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Multi-City Itinerary Agenda</h2>

        <div className="space-y-6">
          {trip.stops?.map((stop, index) => (
            <div key={stop.id} className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold border border-indigo-200">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{stop.city?.name}, {stop.city?.country}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(stop.arrivalDate).toLocaleDateString()} – {new Date(stop.departureDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-indigo-600">
                  Stay & Transit: ${(stop.stayCost + stop.transportCost).toFixed(2)}
                </span>
              </div>

              {/* Activities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stop.stopActivities?.map((sa) => (
                  <div key={sa.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={sa.activity?.imageUrl} alt={sa.activity?.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900">{sa.activity?.name}</p>
                        <span className="text-[10px] text-indigo-600 font-bold">{sa.activity?.category} • {sa.activity?.durationMinutes} min</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">${(sa.customCost ?? sa.activity?.cost ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
