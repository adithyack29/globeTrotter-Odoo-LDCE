import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Compass, Map, Compass as ExploreIcon, User, LogOut, PlusCircle, Globe, Shield, DollarSign } from 'lucide-react';

export default function Navbar({ onOpenNewTripModal }) {
  const { user, logout } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Globe Trotter
            </span>
            <span className="block text-[10px] text-indigo-600 font-semibold uppercase tracking-widest -mt-1">
              Travel Intelligence
            </span>
          </div>
        </Link>

        {/* Center Nav Items */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive('/dashboard')
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/trips"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive('/trips') || location.pathname.startsWith('/trips/')
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Map className="w-4 h-4" />
              My Trips
            </Link>

            <Link
              to="/explore"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive('/explore')
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ExploreIcon className="w-4 h-4" />
              Explore Cities
            </Link>

            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive('/admin')
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Platform Admin Analytics"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Currency Selector */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
            <DollarSign className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (CA$)</option>
            </select>
          </div>

          {user ? (
            <>
              <button
                onClick={onOpenNewTripModal}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Plan New Trip
              </button>

              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors"
                title="Profile & Settings"
              >
                <span className="text-xs font-semibold text-slate-700 hidden lg:inline max-w-[100px] truncate">
                  {user.name}
                </span>
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-500/40"
                />
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
