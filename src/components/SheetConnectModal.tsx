import { useState } from 'react';
import { SheetTabInfo } from '../types/invoice';
import {
  FileSpreadsheet,
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  X,
  FileQuestion,
} from 'lucide-react';
import { extractSpreadsheetId } from '../services/sheetsService';

interface SheetConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onGoogleSignIn: () => Promise<void>;
  onLoadSheet: (spreadsheetId: string, sheetTitle?: string) => Promise<void>;
  onLoadDemoData: () => void;
  availableTabs: SheetTabInfo[];
  currentSpreadsheetId: string;
  currentTabTitle: string;
  isDemoMode: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onOpenTemplate: () => void;
}

export function SheetConnectModal({
  isOpen,
  onClose,
  isAuthenticated,
  onGoogleSignIn,
  onLoadSheet,
  onLoadDemoData,
  availableTabs,
  currentSpreadsheetId,
  currentTabTitle,
  isDemoMode,
  isLoading,
  errorMessage,
  onOpenTemplate,
}: SheetConnectModalProps) {
  const [sheetInput, setSheetInput] = useState(currentSpreadsheetId || '');
  const [selectedTab, setSelectedTab] = useState(currentTabTitle || '');
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await onGoogleSignIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractSpreadsheetId(sheetInput);
    if (!id) return;
    onLoadSheet(id, selectedTab);
  };

  const detectedId = extractSpreadsheetId(sheetInput);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Connectar Google Sheets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Carregueu les factures des del vostre full de càlcul de Google
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Authentication */}
        {!isAuthenticated ? (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-semibold">Inicieu sessió amb el vostre compte de Google</p>
                <p className="mt-0.5 opacity-90">
                  Per llegir fulls de càlcul privats de forma segura mitjançant l'API oficial de Google Sheets, heu d'iniciar sessió.
                </p>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all disabled:opacity-50"
            >
              {isSigningIn ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Inicia sessió amb Google</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Sessió iniciada amb Google. Ja podeu accedir als vostres fulls de càlcul.</span>
          </div>
        )}

        {/* Form: Sheet URL or ID */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                Enllaç o ID del Google Sheet
              </span>
              <button
                type="button"
                onClick={onOpenTemplate}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <FileQuestion className="w-3.5 h-3.5" />
                Com ha de ser el full?
              </button>
            </label>

            <div className="relative">
              <input
                type="text"
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5n.../edit"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {detectedId && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                  ID vàlid
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Copieu l'adreça URL sencera del navegador mentre teniu obert el full a Google Drive.
            </p>
          </div>

          {/* Tab selector if multiple sheets detected */}
          {availableTabs.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pestanya / Full de càlcul
              </label>
              <select
                value={selectedTab}
                onChange={(e) => setSelectedTab(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                {availableTabs.map((tab) => (
                  <option key={tab.title} value={tab.title}>
                    {tab.title} ({tab.rowCount || 0} files)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !sheetInput.trim()}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Carregant dades...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Carregar Factures</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onLoadDemoData();
                onClose();
              }}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Utilitzar Mode Demo</span>
            </button>
          </div>
        </form>

        {/* Quick link to template */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600 dark:text-slate-400">
              No teniu encara un full creat?
            </span>
          </div>
          <button
            onClick={onOpenTemplate}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Veure plantilla recomanada</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
