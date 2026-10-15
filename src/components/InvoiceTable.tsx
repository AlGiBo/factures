import { useState, useMemo } from 'react';
import { Invoice } from '../types/invoice';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  X,
  CreditCard,
  Building,
  Calendar,
  Hash,
  Tag,
} from 'lucide-react';

interface InvoiceTableProps {
  invoices: Invoice[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: string) => void;
}

export function InvoiceTable({
  invoices,
  sortBy,
  sortOrder,
  onSortChange,
}: InvoiceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const totalPages = Math.max(1, Math.ceil(invoices.length / pageSize));

  // Current page slice
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return invoices.slice(start, start + pageSize);
  }, [invoices, currentPage, pageSize]);

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    );
  };

  const renderStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle className="w-3 h-3" />
            Pagada
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
            <Clock className="w-3 h-3" />
            Pendent
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
            <AlertCircle className="w-3 h-3" />
            Vençuda
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <XCircle className="w-3 h-3" />
            Anul·lada
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table header title & count */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Llistat de Factures
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total de {invoices.length} {invoices.length === 1 ? 'registre' : 'registres'} segons els filtres aplicats
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Files per pàgina:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <th
                onClick={() => onSortChange('date')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-1.5">
                  <span>Data</span>
                  {renderSortIcon('date')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('number')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-1.5">
                  <span>Núm. Factura</span>
                  {renderSortIcon('number')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('vendor')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-1.5">
                  <span>Proveïdor & Concepte</span>
                  {renderSortIcon('vendor')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('category')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center gap-1.5">
                  <span>Categoria</span>
                  {renderSortIcon('category')}
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-right">Base / IVA</th>
              <th
                onClick={() => onSortChange('totalAmount')}
                className="py-3 px-4 font-semibold cursor-pointer text-right hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Import Total</span>
                  {renderSortIcon('totalAmount')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('status')}
                className="py-3 px-4 font-semibold cursor-pointer text-center hover:text-slate-800 dark:hover:text-slate-200"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Estat</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center">Detall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No s'ha trobat cap factura amb aquests criteris.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => {
                const categoryColor = getCategoryColor(inv.category);
                return (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">
                      {formatDate(inv.date)}
                    </td>

                    {/* Invoice Number */}
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {inv.number}
                    </td>

                    {/* Vendor and Concept */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {inv.vendor}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {inv.concept}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium"
                        style={{
                          backgroundColor: `${categoryColor}15`,
                          color: categoryColor,
                          border: `1px solid ${categoryColor}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                        {inv.category}
                      </span>
                    </td>

                    {/* Base and Tax */}
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div>{formatCurrency(inv.baseAmount)}</div>
                      <div className="text-[10px] text-slate-400">
                        +{formatCurrency(inv.taxAmount)} ({inv.taxRate || 21}%)
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {formatCurrency(inv.totalAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {renderStatusBadge(inv.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(inv);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                        title="Veure detall complet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Mostrant pàgina <span className="font-semibold">{currentPage}</span> de{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Detall de la Factura
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedInvoice.number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Proveïdor</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedInvoice.vendor}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Data d'emissió</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDate(selectedInvoice.date)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Concepte</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  {selectedInvoice.concept}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Categoria</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedInvoice.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Estat & Pagament</span>
                    <div className="mt-1">{renderStatusBadge(selectedInvoice.status)}</div>
                  </div>
                </div>
              </div>

              {/* Breakdown financial card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Base Imposable:</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(selectedInvoice.baseAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>IVA ({selectedInvoice.taxRate || 21}%):</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(selectedInvoice.taxAmount)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-base font-bold text-slate-900 dark:text-slate-100">
                  <span>Total Factura:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <span className="text-xs text-slate-400">Observacions</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-0.5">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                Tancar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
