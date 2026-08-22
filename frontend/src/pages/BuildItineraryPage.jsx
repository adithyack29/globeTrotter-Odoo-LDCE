import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Layers, Plus, Calendar, DollarSign, Trash2, ArrowRight, Check } from 'lucide-react';

export default function BuildItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const { formatCurrency } = useCurrency();

  const [trip, setTrip] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingSection, setAddingSection] = useState(false);

  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [newSectionData, setNewSectionData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: 300
  });

  const fetchTripSections = async () => {
    try {
      const res = await apiFetch(`/trips/${id}`);
      setTrip(res.trip);
      setSections(res.trip.sections || []);
    } catch (err) {
      console.error('Failed to fetch trip sections:', err);
      showToast('Trip not found', 'error');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripSections();
  }, [id]);

  const handleAddSectionSubmit = async (e) => {
    e.preventDefault();
    setAddingSection(true);
    try {
      await apiFetch(`/trips/${id}/sections`, {
        method: 'POST',
        body: JSON.stringify({
          title: newSectionData.title || `Section ${sections.length + 1}`,
          description: newSectionData.description || 'Necessary information about this section (travel, hotel stay, or tour).',
          startDate: newSectionData.startDate || trip?.startDate,
          endDate: newSectionData.endDate || trip?.endDate,
          budget: parseFloat(newSectionData.budget) || 0
        })
      });
      showToast(`Section ${sections.length + 1} appended to itinerary!`, 'success');
      setIsAddSectionModalOpen(false);
      setNewSectionData({ title: '', description: '', startDate: '', endDate: '', budget: 300 });
      fetchTripSections();
    } catch (err) {
      showToast('Failed to append section', 'error');
    } finally {
      setAddingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await apiFetch(`/trips/sections/${sectionId}`, { method: 'DELETE' });
      showToast('Section removed', 'info');
      fetchTripSections();
    } catch (err) {
      showToast('Failed to delete section', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500">Loading Section-Based Itinerary Builder...</p>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center bg-white">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Build Itenary Screen</h1>
          <p className="text-xs text-slate-500 mt-0.5">{trip.title} • Target Budget: {formatCurrency(trip.totalBudget)}</p>
        </div>

        <button
          onClick={() => navigate(`/trips/${trip.id}`)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
        >
          <span>View Final Itinerary Flow</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Multi-Section Stack */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={section.id} className="glass-panel p-6 rounded-3xl border border-slate-300 space-y-4 shadow-sm bg-white relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-indigo-700">
                Section {idx + 1}: {section.title}
              </h3>

              {sections.length > 1 && (
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
              {section.description || 'All the necessary information about this section. This can be anything like travel section, hotel or any other activity.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date Range:
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {section.startDate ? new Date(section.startDate).toLocaleDateString() : 'xxx'} to {section.endDate ? new Date(section.endDate).toLocaleDateString() : 'yyy'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Budget of this section:
                </span>
                <p className="text-sm font-extrabold text-emerald-700">
                  {formatCurrency(section.budget || 0)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prominent [ Add another Section ] Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => setIsAddSectionModalOpen(true)}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-indigo-500"
        >
          <Plus className="w-5 h-5" />
          <span>Add another Section</span>
        </button>
      </div>

      {/* ADD SECTION MODAL */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Section {sections.length + 1}</h3>
              <button onClick={() => setIsAddSectionModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleAddSectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Section Title</label>
                <input
                  type="text"
                  placeholder="e.g. Hotel Stay & Culinary Excursions"
                  value={newSectionData.title}
                  onChange={(e) => setNewSectionData({ ...newSectionData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Section Description / Travel Type</label>
                <textarea
                  rows="2"
                  placeholder="Details regarding transportation, hotel accommodation, or tours..."
                  value={newSectionData.description}
                  onChange={(e) => setNewSectionData({ ...newSectionData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Budget of this section ($)</label>
                <input
                  type="number"
                  min="0"
                  value={newSectionData.budget}
                  onChange={(e) => setNewSectionData({ ...newSectionData, budget: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddSectionModalOpen(false)} className="px-4 py-2 text-xs text-slate-500">
                  Cancel
                </button>
                <button type="submit" disabled={addingSection} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                  {addingSection ? 'Appending...' : 'Append Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
