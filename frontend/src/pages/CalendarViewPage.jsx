import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import FilterToolbar from '../components/FilterToolbar';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Eye } from 'lucide-react';

export default function CalendarViewPage() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('default');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await apiFetch('/trips');
        setTrips(res.trips || []);
      } catch (err) {
        console.error('Fetch calendar trips error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTripsForDay = (dayNum) => {
    const targetDate = new Date(year, month, dayNum);
    return trips.filter((t) => {
      const s = new Date(t.startDate);
      const e = new Date(t.endDate);
      return targetDate >= s && targetDate <= e;
    });
  };

  const dayCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dayCells.push(d);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Calendar View</h1>
          <p className="text-xs text-slate-500 mt-1">Interactive month calendar grid showing scheduled multi-day trip intervals</p>
        </div>
      </div>

      {/* Filter Toolbar */}
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

      {/* Interactive Calendar Grid */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md bg-white space-y-6">
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {monthNames[month]} {year}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header (Fixed SUN Typo!) */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {dayCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[90px] rounded-2xl bg-slate-50/50" />;
            }

            const dayTrips = getTripsForDay(day);

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[95px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                  dayTrips.length > 0
                    ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-extrabold text-slate-700">{day}</span>

                <div className="space-y-1 mt-1">
                  {dayTrips.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/trips/${t.id}`)}
                      className="px-2 py-1 rounded-md bg-indigo-600 text-white text-[9px] font-extrabold truncate cursor-pointer hover:bg-indigo-700 shadow-xs"
                      title={`${t.title} (${formatCurrency(t.totalBudget)})`}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
