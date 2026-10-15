import { useMemo } from 'react';
import { Invoice } from '../types/invoice';
import { formatCurrency } from '../utils/formatters';
import { Building2 } from 'lucide-react';

interface TopVendorsChartProps {
  invoices: Invoice[];
  onSelectVendor?: (vendor: string | null) => void;
  selectedVendor?: string | null;
}

export function TopVendorsChart({
  invoices,
  onSelectVendor,
  selectedVendor,
}: TopVendorsChartProps) {
  const { topVendors, totalSpend } = useMemo(() => {
    let total = 0;
    const map: Record<string, { amount: number; count: number; category: string }> = {};

    invoices.forEach((inv) => {
      total += inv.totalAmount;
      const v = inv.vendor || 'Desconegut';
      if (!map[v]) {
        map[v] = { amount: 0, count: 0, category: inv.category };
      }
      map[v].amount += inv.totalAmount;
      map[v].count += 1;
    });

    const list = Object.entries(map).map(([name, data]) => {
      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
      return {
        name,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
        category: data.category,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    list.sort((a, b) => b.amount - a.amount);

    return {
      topVendors: list.slice(0, 6),
      totalSpend: total,
    };
  }, [invoices]);

  const maxVendorAmount = topVendors.length > 0 ? topVendors[0].amount : 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Principals Proveïdors
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proveïdors amb major volum de facturació
            </p>
          </div>
        </div>

        {selectedVendor && (
          <button
            onClick={() => onSelectVendor && onSelectVendor(null)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Netejar
          </button>
        )}
      </div>

      {topVendors.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
          Sense dades de proveïdors.
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          {topVendors.map((vendor) => {
            const isSelected = selectedVendor === vendor.name;
            const barWidthPercent = (vendor.amount / maxVendorAmount) * 100;

            return (
              <div
                key={vendor.name}
                onClick={() =>
                  onSelectVendor &&
                  onSelectVendor(isSelected ? null : vendor.name)
                }
                className={`p-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {vendor.name}
                    </span>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0">
                      {vendor.count} {vendor.count === 1 ? 'fac.' : 'facs.'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(vendor.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({vendor.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
