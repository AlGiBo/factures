import { useMemo, useState } from 'react';
import { Invoice } from '../types/invoice';
import { formatCurrency, getCategoryColor } from '../utils/formatters';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryBreakdownChartProps {
  invoices: Invoice[];
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

export function CategoryBreakdownChart({
  invoices,
  selectedCategory,
  onSelectCategory,
}: CategoryBreakdownChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const { totalSum, categories } = useMemo(() => {
    let total = 0;
    const map: Record<string, { amount: number; count: number }> = {};

    invoices.forEach((inv) => {
      total += inv.totalAmount;
      const cat = inv.category || 'Altres';
      if (!map[cat]) {
        map[cat] = { amount: 0, count: 0 };
      }
      map[cat].amount += inv.totalAmount;
      map[cat].count += 1;
    });

    const list = Object.entries(map).map(([name, data]) => {
      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
      return {
        name,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
        percentage: Math.round(percentage * 10) / 10,
        color: getCategoryColor(name),
      };
    });

    list.sort((a, b) => b.amount - a.amount);

    return { totalSum: total, categories: list };
  }, [invoices]);

  // Compute SVG Donut segments
  const donutSegments = useMemo(() => {
    let cumulativeAngle = 0;
    const radius = 64;
    const center = 80;
    const strokeWidth = 24;

    return categories.map((cat) => {
      const angle = (cat.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      // Convert angles to radian
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData =
        categories.length === 1 || angle >= 359.9
          ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius}`
          : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        ...cat,
        pathData,
        strokeWidth,
      };
    });
  }, [categories]);

  const activeCategory = hoveredCategory
    ? categories.find((c) => c.name === hoveredCategory)
    : selectedCategory
    ? categories.find((c) => c.name === selectedCategory)
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <PieChartIcon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Distribució per Categories
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Percentatge i despesa total acumulada
            </p>
          </div>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Veure totes
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No hi ha dades per mostrar.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative shrink-0 w-44 h-44 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
              {donutSegments.map((seg) => {
                const isHovered = hoveredCategory === seg.name;
                const isSelected = selectedCategory === seg.name;
                const isDimmed =
                  (hoveredCategory && !isHovered) || (selectedCategory && !isSelected && !hoveredCategory);

                return (
                  <path
                    key={seg.name}
                    d={seg.pathData}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHovered || isSelected ? 28 : 22}
                    className={`transition-all duration-200 cursor-pointer ${
                      isDimmed ? 'opacity-30' : 'opacity-100'
                    }`}
                    onMouseEnter={() => setHoveredCategory(seg.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() =>
                      onSelectCategory &&
                      onSelectCategory(selectedCategory === seg.name ? null : seg.name)
                    }
                  />
                );
              })}
            </svg>

            {/* Inner Info Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
              <span className="text-[11px] text-slate-400 font-medium">
                {activeCategory ? activeCategory.name : 'Total Facturat'}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {activeCategory
                  ? formatCurrency(activeCategory.amount)
                  : formatCurrency(totalSum)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {activeCategory
                  ? `${activeCategory.percentage}% (${activeCategory.count} fact.)`
                  : `${categories.length} categories`}
              </span>
            </div>
          </div>

          {/* Category List */}
          <div className="flex-1 w-full max-h-56 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const isHovered = hoveredCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() =>
                    onSelectCategory &&
                    onSelectCategory(isSelected ? null : cat.name)
                  }
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-indigo-500'
                      : isHovered
                      ? 'bg-slate-50 dark:bg-slate-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {cat.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {cat.count} {cat.count === 1 ? 'factura' : 'factures'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(cat.amount)}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {cat.percentage}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
