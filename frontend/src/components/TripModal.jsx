import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';
import { X, Calendar, DollarSign, Image as ImageIcon, MapPin, Globe, Clock, Sparkles } from 'lucide-react';

const tripFormSchema = z.object({
  title: z.string().min(2, 'Trip title must be at least 2 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalBudget: z.number().min(0, 'Budget must be a non-negative number'),
  description: z.string().optional(),
  coverImageUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  isPublic: z.boolean().optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date cannot be before start date',
  path: ['endDate']
});

const DEFAULT_COVER_PHOTOS = [
  { name: 'European Architecture', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Tropical Paradise', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Neon Cityscape', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Alpine Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80' }
];

export default function TripModal({ isOpen, onClose, onSaveSuccess, initialData = null }) {
  const { showToast } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalBudget: 1500,
    coverImageUrl: DEFAULT_COVER_PHOTOS[0].url,
    isPublic: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        totalBudget: initialData.totalBudget || 0,
        coverImageUrl: initialData.coverImageUrl || DEFAULT_COVER_PHOTOS[0].url,
        isPublic: initialData.isPublic ?? true
      });
    } else {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      setFormData({
        title: '',
        description: '',
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        totalBudget: 1500,
        coverImageUrl: DEFAULT_COVER_PHOTOS[0].url,
        isPublic: true
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto-calculate trip duration in days
  let calculatedDays = 0;
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end >= start) {
      calculatedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const rawData = {
      ...formData,
      totalBudget: parseFloat(formData.totalBudget) || 0
    };

    const validation = tripFormSchema.safeParse(rawData);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);
    try {
      if (initialData) {
        await apiFetch(`/trips/${initialData.id}`, {
          method: 'PUT',
          body: JSON.stringify(rawData)
        });
        showToast('Trip itinerary updated successfully!', 'success');
      } else {
        await apiFetch('/trips', {
          method: 'POST',
          body: JSON.stringify(rawData)
        });
        showToast('New trip created successfully!', 'success');
      }
      onSaveSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to save trip', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {initialData ? 'Edit Trip Itinerary' : 'Plan New Multi-City Trip'}
            </h3>
            <p className="text-xs text-slate-500">Configure dates, target budget, and cover photos</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Trip Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Trip Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Summer Escape in Southern Europe"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl bg-white border text-slate-900 text-sm focus:outline-none transition-colors ${
                errors.title ? 'border-rose-500' : 'border-slate-300 focus:border-indigo-600'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title}</p>}
          </div>

          {/* Dates & Duration Auto-Calculator */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl bg-white border text-slate-900 text-xs focus:outline-none ${
                    errors.endDate ? 'border-rose-500' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>
            {errors.endDate && <p className="text-xs text-rose-600 font-medium">{errors.endDate}</p>}

            {/* LIVE DURATION BADGE */}
            {calculatedDays > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Calculated Duration: {calculatedDays} Days Tour</span>
              </div>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Target Budget ($ USD) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-slate-900 text-sm focus:outline-none ${
                  errors.totalBudget ? 'border-rose-500' : 'border-slate-300 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.totalBudget && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.totalBudget}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Trip Description / Travel Notes
            </label>
            <textarea
              rows="3"
              placeholder="Notes on travel companions, museum passes, flight times..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Cover Photo Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Cover Image Preset or Custom URL
            </label>
            
            <div className="grid grid-cols-4 gap-2 mb-2">
              {DEFAULT_COVER_PHOTOS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setFormData({ ...formData, coverImageUrl: preset.url })}
                  className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    formData.coverImageUrl === preset.url ? 'border-indigo-600 ring-2 ring-indigo-600/30' : 'border-slate-200'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or paste custom image URL..."
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Public Shared Itinerary</span>
                <span className="text-[11px] text-slate-500">Allow anyone with share link to copy or view</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
