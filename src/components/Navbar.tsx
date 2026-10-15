import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  Moon,
  Sun,
  Server,
  HelpCircle,
  LogOut,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  user: User | null;
  isAuthenticated: boolean;
  onGoogleSignIn: () => Promise<void>;
  onLogout: () => Promise<void>;
  onOpenConnectModal: () => void;
  onOpenDockerModal: () => void;
  onOpenTemplateModal: () => void;
  onRefreshData: () => void;
  isDemoMode: boolean;
  activeSheetName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({
  user,
  isAuthenticated,
  onGoogleSignIn,
  onLogout,
  onOpenConnectModal,
  onOpenDockerModal,
  onOpenTemplateModal,
  onRefreshData,
  isDemoMode,
  activeSheetName,
  isDarkMode,
  onToggleDarkMode,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
                FacturaSheet
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                Sheets v4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Panell d'Estadístiques i Despeses
            </p>
          </div>
        </div>

        {/* Center: Current active sheet or demo status */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenConnectModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs"
          >
            {isDemoMode ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Mode Demo (35 Factures)
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">
                  {activeSheetName || 'Full connectat'}
                </span>
              </>
            )}
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 underline font-semibold ml-1">
              Canviar
            </span>
          </button>

          {!isDemoMode && (
            <button
              onClick={onRefreshData}
              title="Recarregar dades del full"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Docker local modal button */}
          <button
            onClick={onOpenDockerModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/50 hover:bg-blue-100 transition-all"
            title="Veure instruccions d'execució en Docker"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Docker</span>
          </button>

          {/* Template helper */}
          <button
            onClick={onOpenTemplateModal}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Plantilla de columnes per a Google Sheets"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark / Light toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Canviar a mode clar' : 'Canviar a mode fosc'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Google Sign In / User Profile */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuari'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="font-semibold text-slate-800 dark:text-slate-200 hidden md:inline max-w-[120px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user.displayName || 'Usuari'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenConnectModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mt-1"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <span>Canviar full de càlcul</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Tancar sessió</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenConnectModal}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl font-semibold text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span>Connectar Sheets</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
