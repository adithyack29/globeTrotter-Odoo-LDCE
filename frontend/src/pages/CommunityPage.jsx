import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import FilterToolbar from '../components/FilterToolbar';
import { MessageSquare, Star, Plus, ThumbsUp, MapPin, User, Send } from 'lucide-react';

export default function CommunityPage() {
  const { user, showToast } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('default');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    title: '',
    cityName: 'Paris',
    content: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await apiFetch('/community/reviews');
      setReviews(res.reviews || []);
    } catch (err) {
      console.error('Fetch community reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReview.title || !newReview.content) {
      showToast('Please enter title and content', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/community/reviews', {
        method: 'POST',
        body: JSON.stringify(newReview)
      });
      showToast('Story published to community feed!', 'success');
      setIsModalOpen(false);
      setNewReview({ title: '', cityName: 'Paris', content: '', rating: 5 });
      fetchReviews();
    } catch (err) {
      showToast('Failed to post story', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q) ||
      r.cityName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Community Tab</h1>
          <p className="text-xs text-slate-500 mt-1">Community feed of verified traveler reviews, itineraries, and tips</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Share Experience
        </button>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchPlaceholder="Filter community stories..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        groupByValue={groupBy}
        onGroupByChange={setGroupBy}
        filterValue={filterBy}
        onFilterChange={setFilterBy}
        sortByValue={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Social Proof Review Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-3xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-8">No community reviews match "{searchQuery}".</p>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition bg-white space-y-3">
              
              {/* User Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.user?.name}`}
                    alt={rev.user?.name}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rev.user?.name || 'Explorer'}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {rev.cityName} · {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-extrabold flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {rev.cityName}
                  </span>
                  <div className="flex text-amber-400 text-xs tracking-tighter">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
              </div>

              {/* Review Body */}
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">{rev.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">{rev.content}</p>
              </div>

              {/* Footer Likes */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-500 font-semibold cursor-pointer hover:text-indigo-600">
                  <ThumbsUp className="w-3.5 h-3.5" /> 12 Travelers found this helpful
                </span>
                <span>Verified Traveler</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Share Travel Story</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Story Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unforgettable 3 Days in Tokyo"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Destination City</label>
                  <input
                    type="text"
                    value={newReview.cityName}
                    onChange={(e) => setNewReview({ ...newReview, cityName: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Rating (1 to 5)</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900"
                  >
                    <option value={5}>★★★★★ (5/5)</option>
                    <option value={4}>★★★★☆ (4/5)</option>
                    <option value={3}>★★★☆☆ (3/5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Story Details</label>
                <textarea
                  rows="4"
                  placeholder="Share recommendations, hidden spots, budget insights..."
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-slate-500">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                  {submitting ? 'Publishing...' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
