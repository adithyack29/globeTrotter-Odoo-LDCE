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

  const isActive = (path) => {
    if (path === '/trips') {
      return location.pathname === '/trips' || location.pathname.startsWith('/trips/');
    }
    return location.pathname === path;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Home' },
    { path: '/trips', label: 'My Trips' },
    { path: '/explore', label: 'Explore' },
    { path: '/community', label: 'Community' },
    { path: '/calendar', label: 'Calendar' },
    ...(user?.role === 'ADMIN' ? [{ path: '/admin', label: 'Admin' }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print transition-all">
      <div className="h-16 w-full max-w-6xl mx-auto px-6 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none font-sans">
              GlobalTrotter
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-tight mt-1 whitespace-nowrap">
              Multi-City Travel Planner
            </span>
          </div>
        </Link>

        {/* Center: Segmented Nav Bar (Admin pill restricted to user.role === 'ADMIN') */}
        {user && (
          <nav className="hidden lg:flex items-center justify-center shrink-0">
            <div className="relative bg-slate-100/90 p-1 rounded-full border border-slate-200/70 flex items-center gap-1 shadow-inner">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative z-10 px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-colors duration-200 ${
                      active
                        ? 'text-indigo-600 font-black'
                        : 'text-slate-600 hover:text-indigo-600'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-0 bg-white rounded-full shadow-xs -z-10 transition-all duration-300 ease-out" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* Right: Currency & Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="h-9 border border-slate-200 text-xs font-semibold px-2.5 rounded-xl bg-white flex items-center gap-1 shadow-xs hover:border-slate-300 transition">
            <DollarSign className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs text-slate-800"
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
                className="hidden sm:flex items-center gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-100 text-white text-xs font-bold px-3.5 rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Plan a trip
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="h-9 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-center gap-2 shrink-0 shadow-xs transition active:scale-[0.98] cursor-pointer"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-slate-200 object-cover"
                  />
                  <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
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
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      User Profile
                    </Link>

                    <Link
                      to="/calendar"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
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
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer transition-colors"
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
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-[0.98]"
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
