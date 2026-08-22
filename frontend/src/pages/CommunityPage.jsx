import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import FilterToolbar from '../components/FilterToolbar';
import { MessageSquare, Star, Plus, MapPin, User, Send } from 'lucide-react';

export default function CommunityPage() {
  const { user, showToast } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('default');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // New Post Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postData, setPostData] = useState({
    cityName: 'Paris',
    rating: 5,
    title: '',
    content: ''
  });
  const [posting, setPosting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await apiFetch(`/community/reviews?search=${encodeURIComponent(searchQuery)}`);
      setReviews(res.reviews || []);
    } catch (err) {
      console.error('Fetch community error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [searchQuery]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postData.title || !postData.content) {
      showToast('Please enter title and experience notes', 'error');
      return;
    }

    setPosting(true);
    try {
      await apiFetch('/community/reviews', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
      showToast('Review shared with GlobalTrotter community!', 'success');
      setIsPostModalOpen(false);
      setPostData({ cityName: 'Paris', rating: 5, title: '', content: '' });
      fetchReviews();
    } catch (err) {
      showToast('Failed to share review', 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Community tab</h1>
          <p className="text-xs text-slate-500 mt-1">Share and discover real travel stories, reviews, and activity recommendations</p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Share Experience
        </button>
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

      {/* Community Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-3xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl border border-dashed border-slate-300">
            <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-800">No community reviews found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Be the first traveler to share an experience!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="glass-panel p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-start gap-6 bg-white shadow-xs">
              
              {/* User Avatar Circle */}
              <div className="relative shrink-0">
                <img
                  src={rev.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.user?.name || 'User'}`}
                  alt={rev.user?.name || 'User'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-xs"
                />
              </div>

              {/* Review Content Card */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{rev.user?.name || 'Elena Rostova'}</h3>
                    <p className="text-[11px] text-slate-400 font-semibold">{rev.user?.city || 'Paris'}, {rev.user?.country || 'France'} • {new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-extrabold border border-indigo-100">
                      📍 {rev.cityName}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>★ {rev.rating}</span>
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-extrabold text-indigo-900">{rev.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SHARE REVIEW MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Share Community Experience</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Destination City</label>
                <input
                  type="text"
                  placeholder="Paris, Tokyo, Rome..."
                  value={postData.cityName}
                  onChange={(e) => setPostData({ ...postData, cityName: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Rating Star (1 to 5)</label>
                <select
                  value={postData.rating}
                  onChange={(e) => setPostData({ ...postData, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-bold"
                >
                  <option value="5">★★★★★ (5 Stars - Exceptional)</option>
                  <option value="4">★★★★☆ (4 Stars - Great)</option>
                  <option value="3">★★★☆☆ (3 Stars - Average)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Unforgettable Sunset on the Seine River"
                  value={postData.title}
                  onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Trip Story / Review Notes</label>
                <textarea
                  rows="4"
                  placeholder="Share details about activities, food, budget tips..."
                  value={postData.content}
                  onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="px-4 py-2 text-xs text-slate-500">
                  Cancel
                </button>
                <button type="submit" disabled={posting} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                  {posting ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
