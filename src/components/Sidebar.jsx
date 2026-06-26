import React, { useState } from 'react';
import { SUBJECTS, SUBJECT_COLORS, PRIORITIES, STATUSES } from '../utils/constants';
import { Search, Filter, X, ChevronDown, RotateCcw } from 'lucide-react';

export default function Sidebar({
  filters,
  onFilterChange,
  topics
}) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Helper to compute counts
  const getSubjectCount = (subject) => {
    if (subject === 'All') return topics.length;
    return topics.filter(t => t.subject === subject).length;
  };


  const handleClearFilters = () => {
    onFilterChange({
      subject: 'All',
      month: 'All',
      status: 'All',
      search: ''
    });
  };

  const hasActiveFilters = filters.subject !== 'All' || filters.month !== 'All' || filters.status !== 'All' || filters.search !== '';

  const renderFilterControls = () => (
    <div className="space-y-6">
      
      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Search Topics
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Type topic name..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-sm transition-colors text-slate-800 dark:text-slate-100"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Subjects
        </label>
        <div className="flex flex-col gap-1.5">
          {/* ALL Tab */}
          <button
            onClick={() => onFilterChange({ ...filters, subject: 'All' })}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
              filters.subject === 'All'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-md'
                : 'border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>All Subjects</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              filters.subject === 'All'
                ? 'bg-white/20 text-white dark:bg-slate-950/10 dark:text-slate-950 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {getSubjectCount('All')}
            </span>
          </button>

          {/* Subject-specific tabs */}
          {SUBJECTS.map(subject => {
            const isSelected = filters.subject === subject;
            const subColor = SUBJECT_COLORS[subject];
            return (
              <button
                key={subject}
                onClick={() => onFilterChange({ ...filters, subject })}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? `${subColor.active} border-transparent shadow-md`
                    : `border-slate-200/50 dark:border-slate-800/50 ${subColor.hover} text-slate-600 dark:text-slate-400`
                }`}
              >
                <span>{subject}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {getSubjectCount(subject)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Month Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Priority Month
        </label>
        <div className="relative">
          <select
            value={filters.month}
            onChange={(e) => onFilterChange({ ...filters, month: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-sm transition-colors text-slate-800 dark:text-slate-100 appearance-none cursor-pointer"
          >
            <option value="All">All Months</option>
            {PRIORITIES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Production Status
        </label>
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-sm transition-colors text-slate-800 dark:text-slate-100 appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white text-slate-500 dark:text-slate-400 font-medium text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      )}

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Left side) */}
      <aside className="hidden md:block w-72 flex-shrink-0 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md self-start">
        {renderFilterControls()}
      </aside>

      {/* Mobile Sidebar (Top Collapse accordion) */}
      <div className="md:hidden w-full mb-4">
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="flex items-center justify-between w-full p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm"
        >
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filters & Search</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMobileExpanded ? 'rotate-185' : ''}`} />
        </button>

        {isMobileExpanded && (
          <div className="mt-2 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-lg animate-in slide-in-from-top-2 duration-150">
            {renderFilterControls()}
          </div>
        )}
      </div>
    </>
  );
}
