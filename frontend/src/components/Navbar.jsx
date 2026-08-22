import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Compass, Map, Compass as ExploreIcon, LogOut, Plus, Globe, Shield, DollarSign, ChevronDown, User, Heart, CalendarDays, Users } from 'lucide-react';

export default function Navbar({ onOpenNewTripModal }) {
  const { user, logout } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print transition-all">
      <div className="h-16 w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none font-sans">
              GlobalTrotter
            </span>
            <span className="block text-[10px] tracking-widest uppercase text-slate-400 font-semibold mt-1">
              End-to-End Multi-City Travel Planner
            </span>
          </div>
        </Link>

        {/* Center: Nav Pills */}
        {user && (
          <nav className="hidden lg:flex items-center justify-center">
            <div className="bg-slate-100/80 p-1 rounded-full border border-slate-200/60 flex items-center gap-1 shadow-inner">
              <Link
                to="/dashboard"
                className={
                  isActive('/dashboard')
                    ? 'bg-white text-indigo-600 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-medium transition'
                }
              >
                Home
              </Link>

              <Link
                to="/trips"
                className={
                  isActive('/trips') || location.pathname.startsWith('/trips/')
                    ? 'bg-white text-indigo-600 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-medium transition'
                }
              >
                My Trips
              </Link>

              <Link
                to="/explore"
                className={
                  isActive('/explore')
                    ? 'bg-white text-indigo-600 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-medium transition'
                }
              >
                Explore
              </Link>

              <Link
                to="/community"
                className={
                  isActive('/community')
                    ? 'bg-white text-indigo-600 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-medium transition'
                }
              >
                Community
              </Link>

              <Link
                to="/calendar"
                className={
                  isActive('/calendar')
                    ? 'bg-white text-indigo-600 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-medium transition'
                }
              >
                Calendar
              </Link>

              <Link
                to="/admin"
                className={
                  isActive('/admin')
                    ? 'bg-white text-indigo-600 shadow-sm rounded-full px-4 py-1.5 text-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-medium transition'
                }
              >
                Admin
              </Link>
            </div>
          </nav>
        )}

        {/* Right: Currency & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="border border-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer text-xs text-slate-800"
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
                className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Plan a trip
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all cursor-pointer"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      User Profile
                    </Link>

                    <Link
                      to="/calendar"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <CalendarDays className="w-4 h-4 text-indigo-600" />
                      Calendar View
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
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
