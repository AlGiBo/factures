export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  number: string;
  date: string; // YYYY-MM-DD
  vendor: string;
  concept: string;
  category: string;
  baseAmount: number;
  taxAmount: number;
  taxRate?: number; // e.g. 21
  totalAmount: number;
  status: InvoiceStatus;
  dueDate?: string;
  paymentDate?: string;
  paymentMethod?: string;
  notes?: string;
  rawRow?: Record<string, string>;
}

export interface ColumnMapping {
  number: string;
  date: string;
  vendor: string;
  concept: string;
  category: string;
  baseAmount: string;
  taxAmount: string;
  totalAmount: string;
  status: string;
  dueDate: string;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
}

export interface SheetTabInfo {
  sheetId: number;
  title: string;
  rowCount?: number;
  columnCount?: number;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedStatus: InvoiceStatus | 'all';
  dateRange: 'all' | 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'last_year' | 'custom';
  startDate?: string;
  endDate?: string;
  selectedVendor: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: 'date' | 'totalAmount' | 'vendor' | 'category' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface MonthlyCategoryExpense {
  monthKey: string; // YYYY-MM
  monthName: string; // "Gen 2024", "Feb 2024", etc.
  total: number;
  byCategory: Record<string, number>;
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  invoiceCount: number;
  percentage: number;
  color: string;
}
