import { FilterState, InvoiceStatus } from '../types/invoice';
import {
  Search,
  X,
  SlidersHorizontal,
  Calendar,
  Download,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  categories: string[];
  totalResults: number;
  onExportCsv: () => void;
  onPrint: () => void;
}

export function FilterBar({
  filters,
  onChangeFilters,
  categories,
  totalResults,
  onExportCsv,
  onPrint,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (val: string) => {
    onChangeFilters({ ...filters, searchQuery: val });
  };

  const handleStatusChange = (status: InvoiceStatus | 'all') => {
    onChangeFilters({ ...filters, selectedStatus: status });
  };

  const handleDatePresetChange = (preset: FilterState['dateRange']) => {
    onChangeFilters({ ...filters, dateRange: preset });
  };

  const resetFilters = () => {
    onChangeFilters({
      searchQuery: '',
      selectedCategories: [],
      selectedStatus: 'all',
      dateRange: 'all',
      startDate: undefined,
      endDate: undefined,
      selectedVendor: '',
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const activeFiltersCount = [
    Boolean(filters.searchQuery),
    filters.selectedStatus !== 'all',
    filters.dateRange !== 'all',
    filters.selectedCategories.length > 0,
    Boolean(filters.selectedVendor),
    filters.minAmount !== undefined,
    filters.maxAmount !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      {/* Search and primary controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cercar per proveïdor, núm factura, concepte o categoria..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">Estat:</span>
          {[
            { id: 'all', label: 'Totes' },
            { id: 'paid', label: 'Pagades' },
            { id: 'pending', label: 'Pendents' },
            { id: 'overdue', label: 'Vençudes' },
          ].map((item) => {
            const isActive = filters.selectedStatus === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleStatusChange(item.id as any)}
                className={`text-xs px-3 py-2 rounded-xl font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium border transition-all ${
              showAdvanced || activeFiltersCount > 0
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Més filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={onExportCsv}
            title="Exportar dades filtrades a fitxer CSV"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={onPrint}
            title="Imprimir informe"
            className="p-2 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer / Section */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date range presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Període de facturació
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Tots els anys' },
                  { id: 'this_month', label: 'Aquest mes' },
                  { id: 'last_3_months', label: 'Últims 3 mesos' },
                  { id: 'this_year', label: 'Aquest any' },
                  { id: 'last_year', label: 'Any anterior' },
                  { id: 'custom', label: 'Personalitzat' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleDatePresetChange(preset.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-left transition-all ${
                      filters.dateRange === preset.id
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {filters.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Des de</label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) =>
                        onChangeFilters({ ...filters, startDate: e.target.value })
                      }
                      className="w-full text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Fins a</label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) =>
                        onChangeFilters({ ...filters, endDate: e.target.value })
                      }
                      className="w-full text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Amount range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Rang d'import (€)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Mínim €"
                  value={filters.minAmount ?? ''}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      minAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Màxim €"
                  value={filters.maxAmount ?? ''}
                  onChange={(e) =>
                    onChangeFilters({
                      ...filters,
                      maxAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Reset button inside drawer */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {totalResults} {totalResults === 1 ? 'factura trobada' : 'factures trobades'}
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restablir filtres
                  </button>
                )}
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {categories.map((cat) => {
                  const isChecked = filters.selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        const newCats = isChecked
                          ? filters.selectedCategories.filter((c) => c !== cat)
                          : [...filters.selectedCategories, cat];
                        onChangeFilters({ ...filters, selectedCategories: newCats });
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                        isChecked
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
