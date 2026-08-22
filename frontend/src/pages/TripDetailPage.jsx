import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  MapPin,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Share2,
  Check,
  AlertTriangle,
  Clock,
  DollarSign,
  Sparkles,
  LayoutList,
  CalendarDays,
  PieChart as AnalyticsIcon,
  Building,
  Activity as ActivityIcon,
  X,
  GripVertical,
  ArrowRight,
  ListOrdered,
  Zap,
  CheckSquare,
  Printer,
  Shield,
  FileText
} from 'lucide-react';

const CATEGORY_COLORS = {
  stay: '#3b82f6',
  transport: '#6366f1',
  activity: '#10b981',
  meal: '#f59e0b',
  misc: '#8b5cf6'
};

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const { formatCurrency } = useCurrency();

  const [trip, setTrip] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'daywise' | 'calendar' | 'checklist' | 'analytics'
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Drag and Drop
  const [draggedStopIndex, setDraggedStopIndex] = useState(null);

  // Modals
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [stopFormData, setStopFormData] = useState({
    cityId: '',
    arrivalDate: '',
    departureDate: '',
    stayCost: 0,
    transportCost: 0
  });

  const [selectedStopForActivity, setSelectedStopForActivity] = useState(null);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({ category: 'meal', amount: 50, note: '' });

  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [selectedStopToOptimize, setSelectedStopToOptimize] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistCategory, setNewChecklistCategory] = useState('Essentials');

  const fetchTripDetails = async () => {
    try {
      const [tripRes, checklistRes, citiesRes] = await Promise.all([
        apiFetch(`/trips/${id}`),
        apiFetch(`/trips/${id}/checklist`),
        apiFetch('/cities')
      ]);
      setTrip(tripRes.trip);
      setChecklistItems(checklistRes.items || []);
      setCities(citiesRes.cities || []);

      if (citiesRes.cities?.length > 0 && !stopFormData.cityId) {
        setStopFormData((prev) => ({ ...prev, cityId: citiesRes.cities[0].id }));
      }
    } catch (err) {
      console.error('Fetch trip error:', err);
      showToast('Trip not found', 'error');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading trip workspace & analytics...</p>
      </div>
    );
  }

  if (!trip) return null;

  const totalSpent = trip.calculatedCosts?.grandTotal || 0;
  const isOverBudget = totalSpent > trip.totalBudget && trip.totalBudget > 0;

  // Add Stop
  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!stopFormData.cityId || !stopFormData.arrivalDate || !stopFormData.departureDate) {
      showToast('Please fill in city and dates', 'error');
      return;
    }

    try {
      await apiFetch(`/trips/${trip.id}/stops`, {
        method: 'POST',
        body: JSON.stringify({
          cityId: stopFormData.cityId,
          arrivalDate: stopFormData.arrivalDate,
          departureDate: stopFormData.departureDate,
          stayCost: parseFloat(stopFormData.stayCost) || 0,
          transportCost: parseFloat(stopFormData.transportCost) || 0
        })
      });
      showToast('Destination stop added to trip!', 'success');
      setIsAddStopOpen(false);
      fetchTripDetails();
    } catch (err) {
      showToast(err.message || 'Failed to add stop', 'error');
    }
  };

  // Drag Stop Reorder
  const handleDragStart = (index) => setDraggedStopIndex(index);
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (dropIndex) => {
    if (draggedStopIndex === null || draggedStopIndex === dropIndex) return;

    const reorderedStops = [...trip.stops];
    const [moved] = reorderedStops.splice(draggedStopIndex, 1);
    reorderedStops.splice(dropIndex, 0, moved);

    setTrip({ ...trip, stops: reorderedStops });
    setDraggedStopIndex(null);

    try {
      const stopOrders = reorderedStops.map((stop, idx) => ({ id: stop.id, orderIndex: idx }));
      await apiFetch(`/trips/${trip.id}/stops/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ stopOrders })
      });
      showToast('Itinerary stops reordered!', 'success');
      fetchTripDetails();
    } catch (err) {
      showToast('Failed to sync stop order', 'error');
    }
  };

  // Delete Stop
  const handleDeleteStop = async (stopId) => {
    try {
      await apiFetch(`/trips/stops/${stopId}`, { method: 'DELETE' });
      showToast('Destination stop removed', 'info');
      fetchTripDetails();
    } catch (err) {
      showToast('Failed to delete stop', 'error');
    }
  };

  // Add Activity to Stop
  const handleAddActivityToStop = async (stopId, activity) => {
    try {
      await apiFetch(`/trips/stops/${stopId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          activityId: activity.id,
          customCost: activity.cost,
          notes: activity.description
        })
      });
      showToast(`Added "${activity.name}" to stop schedule!`, 'success');
      fetchTripDetails();
    } catch (err) {
      showToast(err.message || 'Failed to add activity', 'error');
    }
  };

  // Remove Activity
  const handleRemoveActivity = async (stopActivityId) => {
    try {
      await apiFetch(`/trips/stop-activities/${stopActivityId}`, { method: 'DELETE' });
      showToast('Activity removed from schedule', 'info');
      fetchTripDetails();
    } catch (err) {
      showToast('Failed to remove activity', 'error');
    }
  };

  // Algorithmic Optimizer Execution
  const handleRunOptimizer = async (stopId) => {
    setOptimizing(true);
    try {
      await apiFetch(`/trips/stops/${stopId}/optimize`, { method: 'POST' });
      showToast('Smart Itinerary Optimizer applied! Activities scheduled logically.', 'success');
      setIsOptimizerOpen(false);
      fetchTripDetails();
    } catch (err) {
      showToast('Failed to optimize schedule', 'error');
    } finally {
      setOptimizing(false);
    }
  };

  // Checklist Actions
  const handleToggleChecklist = async (itemId) => {
    try {
      await apiFetch(`/checklist/${itemId}`, { method: 'PUT' });
      setChecklistItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item))
      );
      showToast('Checklist item updated', 'info');
    } catch (err) {
      showToast('Failed to update checklist item', 'error');
    }
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    try {
      const res = await apiFetch(`/trips/${trip.id}/checklist`, {
        method: 'POST',
        body: JSON.stringify({ title: newChecklistTitle, category: newChecklistCategory })
      });
      setChecklistItems((prev) => [...prev, res.item]);
      setNewChecklistTitle('');
      showToast('Packing item added!', 'success');
    } catch (err) {
      showToast('Failed to add checklist item', 'error');
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    try {
      await apiFetch(`/checklist/${itemId}`, { method: 'DELETE' });
      setChecklistItems((prev) => prev.filter((i) => i.id !== itemId));
      showToast('Item removed', 'info');
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // Log Custom Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/trips/${trip.id}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          category: expenseFormData.category,
          amount: parseFloat(expenseFormData.amount) || 0,
          note: expenseFormData.note
        })
      });
      showToast('Custom expense logged!', 'success');
      setIsAddExpenseOpen(false);
      fetchTripDetails();
    } catch (err) {
      showToast(err.message || 'Failed to log expense', 'error');
    }
  };

  // Copy Share Link
  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/share/${trip.shareSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    showToast('Share URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedShareLink(false), 3000);
  };

  // Recharts Donut & Bar Data
  const pieData = [
    { name: 'Lodging / Stay', value: trip.calculatedCosts?.stayCostTotal || 0, color: CATEGORY_COLORS.stay },
    { name: 'Transit / Flight', value: trip.calculatedCosts?.transportCostTotal || 0, color: CATEGORY_COLORS.transport },
    { name: 'Activities', value: trip.calculatedCosts?.activityCostTotal || 0, color: CATEGORY_COLORS.activity },
    { name: 'Meals', value: trip.calculatedCosts?.mealCostTotal || 0, color: CATEGORY_COLORS.meal },
    { name: 'Misc', value: trip.calculatedCosts?.miscCostTotal || 0, color: CATEGORY_COLORS.misc }
  ].filter((item) => item.value > 0);

  const barData = (trip.stops || []).map((stop) => {
    const actCost = stop.stopActivities?.reduce((sum, sa) => sum + (sa.customCost ?? sa.activity?.cost ?? 0), 0) || 0;
    return {
      cityName: stop.city?.name || 'Stop',
      Stay: stop.stayCost,
      Transport: stop.transportCost,
      Activities: actCost
    };
  });

  const completedChecklistCount = checklistItems.filter((i) => i.isCompleted).length;
  const checklistPercent = checklistItems.length > 0 ? Math.round((completedChecklistCount / checklistItems.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg glass-panel">
        <div className="h-64 sm:h-80 relative">
          <img
            src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Share & Print Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-bold text-slate-800 shadow-md backdrop-blur-md transition-all cursor-pointer border border-slate-200"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Export PDF / Print</span>
            </button>

            {trip.isPublic && (
              <button
                onClick={handleCopyShareLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-bold text-slate-800 shadow-md backdrop-blur-md transition-all cursor-pointer border border-slate-200"
              >
                {copiedShareLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-indigo-600" />}
                <span>{copiedShareLink ? 'Copied!' : 'Share'}</span>
              </button>
            )}
          </div>

          {/* Title & Real-Time Header Cost Badge */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {trip.stops?.map((st) => (
                  <span key={st.id} className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 text-xs font-extrabold border border-slate-200">
                    {st.city?.name}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{trip.title}</h1>
              
              <p className="text-xs sm:text-sm text-indigo-100 flex items-center gap-2 font-medium">
                <CalendarIcon className="w-4 h-4 text-indigo-300" />
                <span>
                  {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} –{' '}
                  {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </p>
            </div>

            {/* Header Real-Time Cost Badge with Multi-Currency Format */}
            <div className="p-4 rounded-2xl bg-white/95 text-slate-900 border border-slate-200 shadow-xl backdrop-blur-md min-w-[230px]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Real-Time Cost Aggregate</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-extrabold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(totalSpent)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ {formatCurrency(trip.totalBudget)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVER-BUDGET WARNING BANNER */}
      {isOverBudget && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 animate-fade-in shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold block">Over-Budget Warning!</span>
            <span>Your total calculated trip expenses ({formatCurrency(totalSpent)}) exceed your target budget ({formatCurrency(trip.totalBudget)}) by {formatCurrency(totalSpent - trip.totalBudget)}. Consider trimming stay or transit expenses.</span>
          </div>
        </div>
      )}

      {/* FLOATING PILL TABS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-1 bg-slate-200/80 p-1.5 rounded-full border border-slate-300 w-full sm:w-auto justify-center">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'timeline' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            Timeline View
          </button>

          <button
            onClick={() => setViewMode('daywise')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'daywise' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Day-Wise List
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar View
          </button>

          <button
            onClick={() => setViewMode('checklist')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'checklist' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            Smart Checklist ({checklistPercent}%)
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'analytics' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AnalyticsIcon className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAddStopOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Stop
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Add Expense
          </button>
        </div>
      </div>

      {/* VIEW 1: TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          
          {/* Route Connection Line */}
          {trip.stops?.length > 1 && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Itinerary Route:</span>
              {trip.stops.map((st, idx) => (
                <React.Fragment key={st.id}>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {st.city?.name}
                  </span>
                  {idx < trip.stops.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {trip.stops?.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-slate-300 space-y-3">
              <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No destination stops added yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Add cities from our database of 22+ worldwide destinations to begin scheduling activities.</p>
              <button
                onClick={() => setIsAddStopOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add First Stop
              </button>
            </div>
          ) : (
            trip.stops?.map((stop, index) => (
              <div
                key={stop.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-6 relative overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1" title="Drag to reorder stop">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-extrabold text-base">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{stop.city?.name}, {stop.city?.country}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {new Date(stop.arrivalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
                          {new Date(stop.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <span className="block text-slate-500 font-medium">Stay & Transit</span>
                      <span className="font-extrabold text-indigo-600">{formatCurrency(stop.stayCost + stop.transportCost)}</span>
                    </div>

                    {/* SMART OPTIMIZER BUTTON */}
                    <button
                      onClick={() => {
                        setSelectedStopToOptimize(stop);
                        setIsOptimizerOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-600 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title="Run Algorithmic Schedule Optimizer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Smart Optimize
                    </button>

                    <button
                      onClick={() => setSelectedStopForActivity(stop)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Activity
                    </button>

                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Stop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scheduled Activities */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4 text-emerald-600" />
                    Scheduled Stop Activities ({stop.stopActivities?.length || 0})
                  </h4>

                  {stop.stopActivities?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No activities scheduled yet for this stop. Click "Add Activity" or "Smart Optimize" to build your day.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stop.stopActivities?.map((sa) => (
                        <div
                          key={sa.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={sa.activity?.imageUrl}
                              alt={sa.activity?.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                {sa.scheduledTime && (
                                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-extrabold text-[10px]">
                                    {sa.scheduledTime}
                                  </span>
                                )}
                                <p className="text-sm font-bold text-slate-900">{sa.activity?.name}</p>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                                  {sa.activity?.category}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {sa.activity?.durationMinutes} min
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-emerald-600">
                              {formatCurrency(sa.customCost ?? sa.activity?.cost ?? 0)}
                            </span>
                            <button
                              onClick={() => handleRemoveActivity(sa.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: DAY-WISE LIST */}
      {viewMode === 'daywise' && (
        <div className="space-y-6">
          <div className="p-6 glass-panel rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-600" />
              Day-Wise Agenda
            </h3>

            <div className="divide-y divide-slate-100">
              {trip.stops?.map((stop, idx) => (
                <div key={stop.id} className="py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-indigo-600">Stop #{idx + 1}: {stop.city?.name}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pl-4 border-l-2 border-indigo-200 space-y-2">
                    {stop.stopActivities?.map((sa) => (
                      <div key={sa.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2">
                          {sa.scheduledTime && <span className="font-bold text-indigo-600">[{sa.scheduledTime}]</span>}
                          <span className="font-semibold text-slate-800">{sa.activity?.name}</span>
                        </div>
                        <span className="font-bold text-emerald-600">{formatCurrency(sa.customCost ?? sa.activity?.cost ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-indigo-600" />
                Itinerary Calendar Grid
              </h3>
              <p className="text-xs text-slate-500">Day-by-day scheduled city stops and activity agenda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trip.stops?.flatMap((stop) => {
              const start = new Date(stop.arrivalDate);
              const end = new Date(stop.departureDate);
              const days = [];
              let current = new Date(start);

              while (current <= end) {
                days.push({
                  dateStr: current.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
                  stop
                });
                current.setDate(current.getDate() + 1);
              }
              return days;
            }).map((dayObj, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-indigo-600">{dayObj.dateStr}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {dayObj.stop.city?.name}
                  </span>
                </div>

                <div className="space-y-2">
                  {dayObj.stop.stopActivities?.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Free exploration day in {dayObj.stop.city?.name}</p>
                  ) : (
                    dayObj.stop.stopActivities?.map((sa) => (
                      <div key={sa.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800">{sa.activity?.name}</span>
                        <span className="text-emerald-600 font-bold">{formatCurrency(sa.customCost ?? sa.activity?.cost ?? 0)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: SMART PACKING CHECKLIST VIEW */}
      {viewMode === 'checklist' && (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-emerald-600" />
                Smart Contextual Packing Checklist
              </h3>
              <p className="text-xs text-slate-500">Auto-generated & personalized travel items based on your trip activities</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Checklist Progress</span>
                <span className="text-emerald-600">{checklistPercent}% ({completedChecklistCount}/{checklistItems.length})</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${checklistPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Add Custom Item */}
          <form onSubmit={handleAddChecklistItem} className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom packing item..."
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
            <select
              value={newChecklistCategory}
              onChange={(e) => setNewChecklistCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
            >
              <option value="Essentials">Essentials</option>
              <option value="Packing">Packing</option>
              <option value="Adventure">Adventure</option>
              <option value="Culture">Culture</option>
              <option value="Food">Food</option>
              <option value="Documents">Documents</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              + Add
            </button>
          </form>

          {/* Checklist Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  item.isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => {}} // handled by parent onClick
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <p className={`text-xs font-bold ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChecklistItem(item.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: BUDGET ANALYTICS */}
      {viewMode === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Accommodation</span>
              <p className="text-xl font-extrabold text-blue-600 mt-1">{formatCurrency(trip.calculatedCosts?.stayCostTotal || 0)}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Transit & Flight</span>
              <p className="text-xl font-extrabold text-indigo-600 mt-1">{formatCurrency(trip.calculatedCosts?.transportCostTotal || 0)}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Activities</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatCurrency(trip.calculatedCosts?.activityCostTotal || 0)}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Meals & Misc</span>
              <p className="text-xl font-extrabold text-amber-600 mt-1">{formatCurrency((trip.calculatedCosts?.mealCostTotal || 0) + (trip.calculatedCosts?.miscCostTotal || 0))}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AnalyticsIcon className="w-5 h-5 text-indigo-600" />
                Category Expense Breakdown
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-600" />
                Expenses Per City Stop
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="cityName" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Bar dataKey="Stay" fill={CATEGORY_COLORS.stay} stackId="a" />
                    <Bar dataKey="Transport" fill={CATEGORY_COLORS.transport} stackId="a" />
                    <Bar dataKey="Activities" fill={CATEGORY_COLORS.activity} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPTIMIZER MODAL */}
      {isOptimizerOpen && selectedStopToOptimize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                Smart Schedule Optimizer Algorithm
              </h3>
              <button onClick={() => setIsOptimizerOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Optimizing schedule for <span className="text-indigo-600 font-bold">{selectedStopToOptimize.city?.name}</span>
              </p>
              <p>The algorithm will:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sequence Morning Sightseeing/Walking activities first.</li>
                <li>Position Afternoon Museums/Culture tours next.</li>
                <li>Schedule Evening Dinners/Leisure cruises last.</li>
                <li>Calculate 30-minute travel buffer slots between activities.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setIsOptimizerOpen(false)} className="px-4 py-2 text-xs text-slate-500">
                Cancel
              </button>
              <button
                onClick={() => handleRunOptimizer(selectedStopToOptimize.id)}
                disabled={optimizing}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                {optimizing ? 'Running Algorithm...' : 'Apply Optimized Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT / PRINT PDF MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                Printable Travel Itinerary PDF / A4 View
              </h3>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content Container */}
            <div className="space-y-6 text-slate-900 p-4 border border-slate-200 rounded-2xl bg-white">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">{trip.title}</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 block">Globe Trotter Itinerary</span>
                  <span className="text-[10px] text-slate-400">Total Budget: {formatCurrency(trip.totalBudget)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-700 border-b border-slate-100 pb-1">Itinerary Stops & Activity Agenda</h3>
                {trip.stops?.map((stop, idx) => (
                  <div key={stop.id} className="space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-indigo-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span>Stop #{idx + 1}: {stop.city?.name}, {stop.city?.country}</span>
                      <span>Stay/Transit: {formatCurrency(stop.stayCost + stop.transportCost)}</span>
                    </div>
                    <div className="pl-3 space-y-1">
                      {stop.stopActivities?.map((sa) => (
                        <div key={sa.id} className="flex justify-between py-1 border-b border-slate-100">
                          <span>{sa.scheduledTime ? `[${sa.scheduledTime}] ` : ''}{sa.activity?.name} ({sa.activity?.category})</span>
                          <span className="font-semibold text-emerald-600">{formatCurrency(sa.customCost ?? sa.activity?.cost ?? 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Emergency Contacts & Support</h4>
                  <p className="text-[11px] text-slate-500">Local Emergency: 112 / 911</p>
                  <p className="text-[11px] text-slate-500">Embassy Helpline: Active</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Travel Notes</h4>
                  <p className="text-[11px] text-slate-500">{trip.description || 'No additional notes.'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 no-print">
              <button onClick={() => setIsPrintModalOpen(false)} className="px-4 py-2 text-xs text-slate-500">
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Print Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STOP */}
      {isAddStopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Add Destination Stop
              </h3>
              <button onClick={() => setIsAddStopOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Select City *</label>
                <select
                  value={stopFormData.cityId}
                  onChange={(e) => setStopFormData({ ...stopFormData, cityId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country} ({c.costIndex} cost)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Arrival Date *</label>
                  <input
                    type="date"
                    value={stopFormData.arrivalDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, arrivalDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Departure Date *</label>
                  <input
                    type="date"
                    value={stopFormData.departureDate}
                    onChange={(e) => setStopFormData({ ...stopFormData, departureDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Stay Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={stopFormData.stayCost}
                    onChange={(e) => setStopFormData({ ...stopFormData, stayCost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Transport Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={stopFormData.transportCost}
                    onChange={(e) => setStopFormData({ ...stopFormData, transportCost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsAddStopOpen(false)} className="px-4 py-2 text-xs text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACTIVITY PICKER */}
      {selectedStopForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Add Activities for {selectedStopForActivity.city?.name}
                </h3>
                <p className="text-xs text-slate-500">Browse curated experiences for this city</p>
              </div>
              <button onClick={() => setSelectedStopForActivity(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['all', 'Sightseeing', 'Food', 'Adventure', 'Culture', 'Leisure'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActivityCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activityCategoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {(selectedStopForActivity.city?.activities || [])
                .filter((a) => activityCategoryFilter === 'all' || a.category === activityCategoryFilter)
                .map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <img src={act.imageUrl} alt={act.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{act.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{act.description}</p>
                        <div className="flex items-center gap-2 text-[11px] text-indigo-600 mt-1 font-semibold">
                          <span>{act.category}</span>
                          <span>• {act.durationMinutes} mins</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(act.cost)}</span>
                      <button
                        onClick={() => handleAddActivityToStop(selectedStopForActivity.id, act)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM EXPENSE */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Log Custom Expense Item
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm"
                >
                  <option value="meal">Meal / Dining</option>
                  <option value="transport">Transit / Flight</option>
                  <option value="stay">Hotel / Stay</option>
                  <option value="activity">Activity / Sightseeing</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Amount ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Seafood dinner at harbor"
                  value={expenseFormData.note}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, note: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="px-4 py-2 text-xs text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
