import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { X, Calendar, DollarSign, Image, FileText, Sparkles, Globe, Lock, AlertCircle } from 'lucide-react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

const tripFormSchema = z.object({
  title: z.string().min(3, 'Trip title must be at least 3 characters long'),
  description: z.string().optional(),
  coverImageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  startDate: z.string().min(1, 'Please select a start date'),
  endDate: z.string().min(1, 'Please select an end date'),
  totalBudget: z.number({ invalid_type_error: 'Budget must be a positive number' }).min(0, 'Budget cannot be negative'),
  isPublic: z.boolean().default(false)
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date cannot be before start date',
  path: ['endDate']
});

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80'
];

export default function TripModal({ isOpen, onClose, onSaveSuccess, initialData = null }) {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImageUrl: DEFAULT_COVERS[0],
    startDate: '',
    endDate: '',
    totalBudget: 1500,
    isPublic: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        coverImageUrl: initialData.coverImageUrl || DEFAULT_COVERS[0],
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        totalBudget: initialData.totalBudget !== undefined ? initialData.totalBudget : 1500,
        isPublic: initialData.isPublic || false
      });
    } else {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      setFormData({
        title: '',
        description: '',
        coverImageUrl: DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)],
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        totalBudget: 1500,
        isPublic: false
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const budgetValue = parseFloat(formData.totalBudget) || 0;

    const payload = {
      ...formData,
      totalBudget: budgetValue
    };

    // Zod client validation
    const result = tripFormSchema.safeParse(payload);
    if (!result.success) {
      const formatted = {};
      result.error.errors.forEach((err) => {
        formatted[err.path[0]] = err.message;
      });
      setErrors(formatted);
      return;
    }

    setLoading(true);
    try {
      if (initialData?.id) {
        await apiFetch(`/trips/${initialData.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Trip updated successfully!', 'success');
      } else {
        await apiFetch('/trips', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Trip plan created! Now add destination stops.', 'success');
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        showToast(err.message || 'Failed to save trip', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Trip Details' : 'Plan a New Trip'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Trip Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Trip Title *
            </label>
            <input
              type="text"
              placeholder="e.g., European Grand Summer Tour 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white border ${
                errors.title ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
              } text-slate-900 focus:outline-none focus:border-indigo-600 text-sm transition-colors`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-500 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows="2"
              placeholder="What is the goal of this journey?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 text-sm transition-colors"
            />
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl bg-white border ${
                  errors.startDate ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                } text-slate-900 focus:outline-none focus:border-indigo-600 text-sm`}
              />
              {errors.startDate && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl bg-white border ${
                  errors.endDate ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                } text-slate-900 focus:outline-none focus:border-indigo-600 text-sm`}
              />
              {errors.endDate && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.endDate}</p>}
            </div>
          </div>

          {/* Total Budget Target */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Target Total Budget ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="0"
                step="50"
                placeholder="1500"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border ${
                  errors.totalBudget ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                } text-slate-900 focus:outline-none focus:border-indigo-600 text-sm`}
              />
            </div>
            {errors.totalBudget && <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.totalBudget}</p>}
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 text-xs mb-2"
            />
            {/* Quick Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DEFAULT_COVERS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImageUrl: url })}
                  className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-transform cursor-pointer ${
                    formData.coverImageUrl === url ? 'border-indigo-600 scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`cover-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Public Sharing Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              {formData.isPublic ? (
                <Globe className="w-5 h-5 text-indigo-600" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900">Public Shareable Itinerary</p>
                <p className="text-[11px] text-slate-500">Allow anyone with the link to view and copy this trip</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : initialData ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
