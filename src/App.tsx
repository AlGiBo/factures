import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedAccessToken,
} from './services/firebaseAuth';
import {
  fetchSpreadsheetTabs,
  fetchSheetValues,
  parseSheetDataToInvoices,
} from './services/sheetsService';
import { MOCK_INVOICES } from './data/mockInvoices';
import { Invoice, FilterState, SheetTabInfo } from './types/invoice';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { MonthlyExpenseChart } from './components/MonthlyExpenseChart';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';
import { TopVendorsChart } from './components/TopVendorsChart';
import { FilterBar } from './components/FilterBar';
import { InvoiceTable } from './components/InvoiceTable';
import { SheetConnectModal } from './components/SheetConnectModal';
import { DockerInstructionsModal } from './components/DockerInstructionsModal';
import { TemplateModal } from './components/TemplateModal';
import {
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Server,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Invoices & sheet state
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [currentSpreadsheetId, setCurrentSpreadsheetId] = useState<string>('');
  const [currentTabTitle, setCurrentTabTitle] = useState<string>('');
  const [availableTabs, setAvailableTabs] = useState<SheetTabInfo[]>([]);
  const [isLoadingSheet, setIsLoadingSheet] = useState<boolean>(false);
  const [sheetErrorMessage, setSheetErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isDockerModalOpen, setIsDockerModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    selectedStatus: 'all',
    dateRange: 'all',
    selectedVendor: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsAuthenticated(true);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setIsAuthenticated(true);
        setSuccessToast(`Sessió iniciada com a ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      setSheetErrorMessage(
        err.message || 'No s\'ha pogut completar l\'autenticació amb Google.'
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setSuccessToast('Sessió tancada');
  };

  // Load spreadsheet data
  const handleLoadSheet = async (spreadsheetId: string, sheetTitle?: string) => {
    setIsLoadingSheet(true);
    setSheetErrorMessage(null);

    try {
      const activeToken = token || (await getAccessToken());

      if (!activeToken) {
        throw new Error(
          'Heu d\'iniciar sessió amb Google abans de carregar un full de càlcul privat.'
        );
      }

      // Step 1: fetch tabs metadata
      const tabs = await fetchSpreadsheetTabs(spreadsheetId, activeToken);
      setAvailableTabs(tabs);

      const targetTab = sheetTitle || (tabs.length > 0 ? tabs[0].title : 'Full 1');

      // Step 2: fetch rows for target tab
      const rows = await fetchSheetValues(spreadsheetId, targetTab, activeToken);

      if (!rows || rows.length <= 1) {
        throw new Error('El full seleccionat sembla buit o no conté files de dades.');
      }

      // Step 3: parse into structured invoices
      const { invoices: parsedInvoices } = parseSheetDataToInvoices(rows);

      if (parsedInvoices.length === 0) {
        throw new Error('No s\'ha pogut reconèixer cap fila de factura amb import vàlid.');
      }

      setInvoices(parsedInvoices);
      setCurrentSpreadsheetId(spreadsheetId);
      setCurrentTabTitle(targetTab);
      setIsDemoMode(false);
      setIsConnectModalOpen(false);
      setSuccessToast(
        `Full "${targetTab}" carregat amb èxit! S'han processat ${parsedInvoices.length} factures.`
      );
    } catch (err: any) {
      console.error('Error loading Google Sheet:', err);
      setSheetErrorMessage(
        err.message || 'Error en connectar amb Google Sheets. Verifiqueu els permisos i l\'enllaç.'
      );
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleLoadDemoData = () => {
    setInvoices(MOCK_INVOICES);
    setIsDemoMode(true);
    setCurrentSpreadsheetId('');
    setCurrentTabTitle('Dades de Mostra');
    setSuccessToast('Mode Demo activat amb 35 factures reals d\'exemple');
  };

  const handleRefreshData = () => {
    if (currentSpreadsheetId && currentTabTitle) {
      handleLoadSheet(currentSpreadsheetId, currentTabTitle);
    }
  };

  // Auto-hide toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Extract all unique categories from current invoices
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.category) set.add(inv.category);
    });
    return Array.from(set).sort();
  }, [invoices]);

  // Filtering & Sorting
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchNum = inv.number.toLowerCase().includes(q);
          const matchVendor = inv.vendor.toLowerCase().includes(q);
          const matchConcept = inv.concept.toLowerCase().includes(q);
          const matchCategory = inv.category.toLowerCase().includes(q);
          const matchNotes = inv.notes?.toLowerCase().includes(q);
          if (!matchNum && !matchVendor && !matchConcept && !matchCategory && !matchNotes) {
            return false;
          }
        }

        // Status
        if (filters.selectedStatus !== 'all' && inv.status !== filters.selectedStatus) {
          return false;
        }

        // Selected categories
        if (
          filters.selectedCategories.length > 0 &&
          !filters.selectedCategories.includes(inv.category)
        ) {
          return false;
        }

        // Vendor filter
        if (
          filters.selectedVendor &&
          inv.vendor.toLowerCase() !== filters.selectedVendor.toLowerCase()
        ) {
          return false;
        }

        // Amount range
        if (filters.minAmount !== undefined && inv.totalAmount < filters.minAmount) {
          return false;
        }
        if (filters.maxAmount !== undefined && inv.totalAmount > filters.maxAmount) {
          return false;
        }

        // Date range
        if (inv.date) {
          const now = new Date();
          const currentYear = now.getFullYear().toString();
          const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
          const currentYearMonth = `${currentYear}-${currentMonth}`;

          if (filters.dateRange === 'this_month') {
            if (!inv.date.startsWith(currentYearMonth)) return false;
          } else if (filters.dateRange === 'this_year') {
            if (!inv.date.startsWith(currentYear)) return false;
          } else if (filters.dateRange === 'last_year') {
            const prevYear = (now.getFullYear() - 1).toString();
            if (!inv.date.startsWith(prevYear)) return false;
          } else if (filters.dateRange === 'last_3_months') {
            const invTime = new Date(inv.date).getTime();
            const threeMonthsAgo = now.getTime() - 90 * 24 * 60 * 60 * 1000;
            if (invTime < threeMonthsAgo) return false;
          } else if (filters.dateRange === 'custom') {
            if (filters.startDate && inv.date < filters.startDate) return false;
            if (filters.endDate && inv.date > filters.endDate) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[filters.sortBy as keyof Invoice] ?? '';
        let valB: any = b[filters.sortBy as keyof Invoice] ?? '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [invoices, filters]);

  // Export to CSV
  const handleExportCsv = useCallback(() => {
    const headers = [
      'Data',
      'Núm. Factura',
      'Proveïdor',
      'Concepte',
      'Categoria',
      'Base Imposable (€)',
      'IVA (€)',
      'Import Total (€)',
      'Estat',
      'Mètode Pagament',
    ];

    const rows = filteredInvoices.map((inv) => [
      `"${inv.date}"`,
      `"${inv.number.replace(/"/g, '""')}"`,
      `"${inv.vendor.replace(/"/g, '""')}"`,
      `"${inv.concept.replace(/"/g, '""')}"`,
      `"${inv.category.replace(/"/g, '""')}"`,
      inv.baseAmount.toFixed(2),
      inv.taxAmount.toFixed(2),
      inv.totalAmount.toFixed(2),
      `"${inv.status}"`,
      `"${inv.paymentMethod || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `factures_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredInvoices]);

  const handlePrint = () => {
    window.print();
  };

  const handleSortChange = (column: string) => {
    if (filters.sortBy === column) {
      setFilters((f) => ({
        ...f,
        sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc',
      }));
    } else {
      setFilters((f) => ({
        ...f,
        sortBy: column as any,
        sortOrder: 'desc',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={user}
        isAuthenticated={isAuthenticated}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenDockerModal={() => setIsDockerModalOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onRefreshData={handleRefreshData}
        isDemoMode={isDemoMode}
        activeSheetName={currentTabTitle || 'Full actiu'}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner if in Demo mode */}
        {isDemoMode && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-200/50 dark:border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Esteu visualitzant les dades d'exemple</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    Mode Demostració
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Podeu connectar el vostre propi Google Sheet en qualsevol moment per visualitzar les vostres factures reals.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Connectar el meu Google Sheet</span>
              </button>
            </div>
          </div>
        )}

        {/* Top KPI Statistics */}
        <section aria-label="Mètriques principals">
          <StatsCards invoices={invoices} filteredInvoices={filteredInvoices} />
        </section>

        {/* Charts Section: Monthly expenses by category + Donut distribution */}
        <section className="space-y-6" aria-label="Gràfiques de despesa mensual">
          {/* Monthly Expense Bar Chart */}
          <MonthlyExpenseChart
            invoices={filteredInvoices}
            selectedCategory={
              filters.selectedCategories.length === 1 ? filters.selectedCategories[0] : null
            }
            onSelectCategory={(cat) => {
              setFilters((f) => ({
                ...f,
                selectedCategories: cat ? [cat] : [],
              }));
            }}
          />

          {/* Secondary Charts Grid: Category breakdown & Top Vendors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBreakdownChart
              invoices={filteredInvoices}
              selectedCategory={
                filters.selectedCategories.length === 1 ? filters.selectedCategories[0] : null
              }
              onSelectCategory={(cat) => {
                setFilters((f) => ({
                  ...f,
                  selectedCategories: cat ? [cat] : [],
                }));
              }}
            />

            <TopVendorsChart
              invoices={filteredInvoices}
              selectedVendor={filters.selectedVendor}
              onSelectVendor={(vendor) => {
                setFilters((f) => ({
                  ...f,
                  selectedVendor: vendor || '',
                }));
              }}
            />
          </div>
        </section>

        {/* Search & Fast Filters */}
        <section aria-label="Filtres i cerca de factures">
          <FilterBar
            filters={filters}
            onChangeFilters={setFilters}
            categories={allCategories}
            totalResults={filteredInvoices.length}
            onExportCsv={handleExportCsv}
            onPrint={handlePrint}
          />
        </section>

        {/* Invoice Data Table */}
        <section aria-label="Taula de factures">
          <InvoiceTable
            invoices={filteredInvoices}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">FacturaSheet</span>
            <span>•</span>
            <span>Connexió amb Google Sheets API v4</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDockerModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Execució en Docker</span>
            </button>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Estructura de columnes</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xl flex items-center gap-3 border border-slate-800 dark:border-slate-200 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Modals */}
      <SheetConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        isAuthenticated={isAuthenticated}
        onGoogleSignIn={handleGoogleSignIn}
        onLoadSheet={handleLoadSheet}
        onLoadDemoData={handleLoadDemoData}
        availableTabs={availableTabs}
        currentSpreadsheetId={currentSpreadsheetId}
        currentTabTitle={currentTabTitle}
        isDemoMode={isDemoMode}
        isLoading={isLoadingSheet}
        errorMessage={sheetErrorMessage}
        onOpenTemplate={() => {
          setIsConnectModalOpen(false);
          setIsTemplateModalOpen(true);
        }}
      />

      <DockerInstructionsModal
        isOpen={isDockerModalOpen}
        onClose={() => setIsDockerModalOpen(false)}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  );
}
