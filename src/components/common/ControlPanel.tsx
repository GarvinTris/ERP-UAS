import React from 'react';
import { Search, Filter, LayoutGrid, List, FileSpreadsheet, Plus } from 'lucide-react';

interface ControlPanelProps {
  title: string;
  subtitle?: string;
  screenCode?: string;
  flowHint?: string;
  currentView?: 'list' | 'kanban' | 'form';
  onViewChange?: (view: 'list' | 'kanban' | 'form') => void;
  availableViews?: ('list' | 'kanban' | 'form')[];
  onCreateNew?: () => void;
  createButtonLabel?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterOptions?: { label: string; value: string }[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  extraActions?: React.ReactNode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  title,
  subtitle,
  screenCode,
  flowHint,
  currentView = 'list',
  onViewChange,
  availableViews = ['list'],
  onCreateNew,
  createButtonLabel = 'Create New',
  searchQuery = '',
  onSearchChange,
  filterOptions = [],
  activeFilter = 'all',
  onFilterChange,
  extraActions,
}) => {
  return (
    <div className="bg-[#FFFEFC] border-b border-[#E7E3DD] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xs">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {screenCode && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#171717] text-[#C18B42] border border-[#333333]">
              {screenCode}
            </span>
          )}
          <h1 className="text-xl font-bold tracking-tight text-[#171717]">{title}</h1>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-3 py-1.5 bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{createButtonLabel}</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {subtitle && <p className="text-xs text-[#8C8983]">{subtitle}</p>}
          {flowHint && (
            <span className="text-[10px] font-mono text-[#54745B] bg-[#54745B]/10 px-2 py-0.2 rounded border border-[#54745B]/20">
              Alur: {flowHint}
            </span>
          )}
        </div>
      </div>

      {/* Search, Filter, Views & Extra Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {onSearchChange && (
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8983]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#F5F0E8] text-xs text-[#171717] pl-8 pr-3 py-1.5 rounded-lg border border-[#E7E3DD] focus:outline-none focus:border-[#171717] transition-colors"
            />
          </div>
        )}

        {filterOptions.length > 0 && onFilterChange && (
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#8C8983]" />
            <select
              value={activeFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="bg-[#F5F0E8] text-xs text-[#171717] px-2.5 py-1.5 rounded-lg border border-[#E7E3DD] focus:outline-none focus:border-[#171717] transition-colors"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {extraActions}

        {/* View Switcher buttons */}
        {availableViews.length > 1 && onViewChange && (
          <div className="flex items-center p-0.5 bg-[#F5F0E8] rounded-lg border border-[#E7E3DD]">
            {availableViews.includes('list') && (
              <button
                onClick={() => onViewChange('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  currentView === 'list' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#8C8983] hover:text-[#171717]'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            )}
            {availableViews.includes('kanban') && (
              <button
                onClick={() => onViewChange('kanban')}
                className={`p-1.5 rounded-md transition-colors ${
                  currentView === 'kanban' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#8C8983] hover:text-[#171717]'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
