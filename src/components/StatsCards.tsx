import { useMemo } from 'react';
import { Invoice } from '../types/invoice';
import { formatCurrency } from '../utils/formatters';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Receipt,
  Percent,
} from 'lucide-react';

interface StatsCardsProps {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
}

export function StatsCards({ invoices, filteredInvoices }: StatsCardsProps) {
  const stats = useMemo(() => {
    let totalSpend = 0;
    let totalBase = 0;
    let totalTax = 0;
    let paidSpend = 0;
    let pendingSpend = 0;
    let overdueSpend = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    filteredInvoices.forEach((inv) => {
      totalSpend += inv.totalAmount;
      totalBase += inv.baseAmount;
      totalTax += inv.taxAmount;

      if (inv.status === 'paid') {
        paidSpend += inv.totalAmount;
        paidCount++;
      } else if (inv.status === 'pending') {
        pendingSpend += inv.totalAmount;
        pendingCount++;
      } else if (inv.status === 'overdue') {
        overdueSpend += inv.totalAmount;
        overdueCount++;
      }
    });

    const totalCount = filteredInvoices.length;
    const avgSpend = totalCount > 0 ? totalSpend / totalCount : 0;
    const paidPercentage = totalSpend > 0 ? Math.round((paidSpend / totalSpend) * 100) : 0;

    return {
      totalSpend,
      totalBase,
      totalTax,
      paidSpend,
      pendingSpend,
      overdueSpend,
      paidCount,
      pendingCount,
      overdueCount,
      totalCount,
      avgSpend,
      paidPercentage,
    };
  }, [filteredInvoices]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Despesa Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Facturat
          </span>
          <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(stats.totalSpend)}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Base: {formatCurrency(stats.totalBase)}</span>
            <span>•</span>
            <span>{stats.totalCount} factures</span>
          </div>
        </div>
      </div>

      {/* Factures Pagades Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Pagades ({stats.paidPercentage}%)
          </span>
          <span className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(stats.paidSpend)}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.paidPercentage}%` }}
              />
            </div>
            <span className="shrink-0">{stats.paidCount} pagades</span>
          </div>
        </div>
      </div>

      {/* Factures Pendents Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Pendents / Vençudes
          </span>
          <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(stats.pendingSpend + stats.overdueSpend)}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {stats.pendingCount} per liquidar
            </span>
            {stats.overdueCount > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-500 font-semibold">
                  {stats.overdueCount} vençudes
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mitjana & IVA Suportat Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Mitjana & Impostos
          </span>
          <span className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Receipt className="w-5 h-5" />
          </span>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(stats.avgSpend)}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <Percent className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>IVA suportat: {formatCurrency(stats.totalTax)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
