import React from 'react';
import { Search, ChevronDown, Filter, Layers, ArrowUpDown } from 'lucide-react';

export default function FilterToolbar({
  searchPlaceholder = 'Search trips, cities, or activities...',
  searchValue = '',
  onSearchChange,
  groupByValue = 'default',
  onGroupByChange,
  filterValue = 'all',
  onFilterChange,
  sortByValue = 'recent',
  onSortByChange
}) {
  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="glass-panel p-2.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 shadow-xs bg-white">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition shadow-xs placeholder:text-slate-400"
          />
        </div>

        {/* Dropdown Control Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          
          {/* Group by */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={groupByValue}
              onChange={(e) => onGroupByChange && onGroupByChange(e.target.value)}
              className="w-full sm:w-auto h-11 appearance-none pl-4 pr-9 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">Group by</option>
              <option value="city">By Destination City</option>
              <option value="status">By Status</option>
              <option value="category">By Category</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-4 pointer-events-none" />
          </div>

          {/* Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filterValue}
              onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
              className="w-full sm:w-auto h-11 appearance-none pl-4 pr-9 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Filter</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Up-coming</option>
              <option value="completed">Completed</option>
              <option value="public">Public Only</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-4 pointer-events-none" />
          </div>

          {/* Sort by */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortByValue}
              onChange={(e) => onSortByChange && onSortByChange(e.target.value)}
              className="w-full sm:w-auto h-11 appearance-none pl-4 pr-9 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="recent">Sort by</option>
              <option value="date_asc">Date (Ascending)</option>
              <option value="date_desc">Date (Descending)</option>
              <option value="budget_high">Budget (High to Low)</option>
              <option value="budget_low">Budget (Low to High)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-4 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
