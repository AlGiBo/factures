import { useState, useMemo } from 'react';
import { Invoice } from '../types/invoice';
import { formatCurrency, getCategoryColor, MONTH_SHORT_CA } from '../utils/formatters';
import { BarChart3, TrendingUp, Layers, Calendar } from 'lucide-react';

interface MonthlyExpenseChartProps {
  invoices: Invoice[];
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

export function MonthlyExpenseChart({
  invoices,
  selectedCategory,
  onSelectCategory,
}: MonthlyExpenseChartProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [chartType, setChartType] = useState<'stacked' | 'total'>('stacked');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.date) {
        const y = inv.date.substring(0, 4);
        if (y && !isNaN(Number(y))) years.add(y);
      }
    });
    return Array.from(years).sort().reverse();
  }, [invoices]);

  // Aggregate monthly data
  const { monthlyData, allCategories } = useMemo(() => {
    const monthsMap: Record<string, { total: number; byCategory: Record<string, number> }> = {};
    const categoriesSet = new Set<string>();

    invoices.forEach((inv) => {
      if (!inv.date) return;
      const year = inv.date.substring(0, 4);
      if (selectedYear !== 'all' && year !== selectedYear) return;

      const monthKey = inv.date.substring(0, 7); // YYYY-MM
      const cat = inv.category || 'Altres';
      categoriesSet.add(cat);

      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = { total: 0, byCategory: {} };
      }

      monthsMap[monthKey].total += inv.totalAmount;
      monthsMap[monthKey].byCategory[cat] = (monthsMap[monthKey].byCategory[cat] || 0) + inv.totalAmount;
    });

    // Sort chronologically
    const sortedKeys = Object.keys(monthsMap).sort();
    const result = sortedKeys.map((key) => {
      const [year, month] = key.split('-');
      const monthLabel = `${MONTH_SHORT_CA[month] || month} '${year.slice(2)}`;
      return {
        key,
        year,
        month,
        label: monthLabel,
        total: Math.round(monthsMap[key].total * 100) / 100,
        byCategory: monthsMap[key].byCategory,
      };
    });

    return {
      monthlyData: result,
      allCategories: Array.from(categoriesSet).sort(),
    };
  }, [invoices, selectedYear]);

  const maxMonthTotal = useMemo(() => {
    if (monthlyData.length === 0) return 1000;
    const max = Math.max(...monthlyData.map((m) => m.total));
    return max > 0 ? max : 1000;
  }, [monthlyData]);

  const activeMonthData = useMemo(() => {
    if (!hoveredMonth) return null;
    return monthlyData.find((m) => m.key === hoveredMonth) || null;
  }, [hoveredMonth, monthlyData]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Despesa Mensual per Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evolució del gasto mes a mes desglossat per tipologia
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Year selector */}
          {availableYears.length > 1 && (
            <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => setSelectedYear('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedYear === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tots
              </button>
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedYear === y
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Toggle view mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setChartType('stacked')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartType === 'stacked'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Barres apilades per categories"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Apilat</span>
            </button>
            <button
              onClick={() => setChartType('total')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartType === 'total'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
              title="Barres de despesa total"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Total</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories interactive pills */}
      <div className="flex items-center gap-1.5 flex-wrap mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <span className="text-xs font-medium text-slate-400 mr-1">Filtrar categoria:</span>
        <button
          onClick={() => onSelectCategory && onSelectCategory(null)}
          className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
            !selectedCategory
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Totes
        </button>
        {allCategories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const color = getCategoryColor(cat);
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory && onSelectCategory(isSelected ? null : cat)}
              className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'ring-2 ring-offset-1 text-white font-medium shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={{
                backgroundColor: isSelected ? color : undefined,
                borderColor: color,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Main Chart Area */}
      {monthlyData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <p className="text-sm">No hi ha dades de factures per al període seleccionat.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Chart Graphic */}
          <div className="h-64 w-full flex items-end gap-2 sm:gap-3 pt-6 pb-2">
            {monthlyData.map((month) => {
              const isHovered = hoveredMonth === month.key;
              const heightPercent = Math.min(100, Math.max(6, (month.total / maxMonthTotal) * 100));

              // Compute stacked segments
              let cumulativeBottom = 0;
              const segments = allCategories
                .map((cat) => {
                  const val = month.byCategory[cat] || 0;
                  if (val === 0) return null;
                  const segPercent = (val / month.total) * 100;
                  const bottom = cumulativeBottom;
                  cumulativeBottom += segPercent;
                  const isCatFiltered = selectedCategory && selectedCategory !== cat;
                  return {
                    cat,
                    val,
                    segPercent,
                    bottom,
                    color: getCategoryColor(cat),
                    isCatFiltered,
                  };
                })
                .filter(Boolean);

              return (
                <div
                  key={month.key}
                  onMouseEnter={() => setHoveredMonth(month.key)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Total on hover or peak */}
                  <span
                    className={`text-[10px] font-semibold mb-1 transition-all ${
                      isHovered
                        ? 'text-indigo-600 dark:text-indigo-400 scale-110 font-bold'
                        : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {formatCurrency(month.total).replace('€', '').trim()}€
                  </span>

                  {/* Bar container */}
                  <div
                    className="w-full max-w-[48px] rounded-t-lg overflow-hidden relative transition-all duration-200 group-hover:brightness-110"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: chartType === 'total' ? '#6366f1' : 'transparent',
                    }}
                  >
                    {chartType === 'stacked' &&
                      segments.map((seg) => {
                        if (!seg) return null;
                        const isDimmed = selectedCategory && selectedCategory !== seg.cat;
                        return (
                          <div
                            key={seg.cat}
                            className={`w-full transition-all duration-300 ${
                              isDimmed ? 'opacity-25' : 'opacity-100'
                            }`}
                            style={{
                              height: `${seg.segPercent}%`,
                              backgroundColor: seg.color,
                            }}
                          />
                        );
                      })}
                  </div>

                  {/* Month label */}
                  <span
                    className={`text-[11px] mt-2 whitespace-nowrap font-medium transition-colors ${
                      isHovered
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detailed floating / docked tooltip on hover */}
          {activeMonthData && (
            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Resum de {activeMonthData.label} ({activeMonthData.year})
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Total: {formatCurrency(activeMonthData.total)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {Object.entries(activeMonthData.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => {
                    const color = getCategoryColor(cat);
                    const percent = Math.round((amount / activeMonthData.total) * 100);
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-slate-700/60 shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate text-slate-600 dark:text-slate-300 font-medium">
                            {cat}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2 shrink-0">
                          {formatCurrency(amount)} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
