import React from 'react';
import { Search, ChevronDown, Filter, Layers, ArrowUpDown } from 'lucide-react';

export default function FilterToolbar({
  searchPlaceholder = 'Search bar.......',
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
    <div className="glass-panel p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 w-full">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 font-medium"
        />
      </div>

      {/* Dropdown Control Pills */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        
        {/* Group by */}
        <div className="relative flex-1 sm:flex-initial">
          <select
            value={groupByValue}
            onChange={(e) => onGroupByChange && onGroupByChange(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="default">Group by ▾</option>
            <option value="city">By Destination City</option>
            <option value="status">By Status</option>
            <option value="category">By Category</option>
          </select>
        </div>

        {/* Filter */}
        <div className="relative flex-1 sm:flex-initial">
          <select
            value={filterValue}
            onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">Filter ▾</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Up-coming</option>
            <option value="completed">Completed</option>
            <option value="public">Public Only</option>
          </select>
        </div>

        {/* Sort by */}
        <div className="relative flex-1 sm:flex-initial">
          <select
            value={sortByValue}
            onChange={(e) => onSortByChange && onSortByChange(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="recent">Sort by... ▾</option>
            <option value="date_asc">Date (Ascending)</option>
            <option value="date_desc">Date (Descending)</option>
            <option value="budget_high">Budget (High to Low)</option>
            <option value="budget_low">Budget (Low to High)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
