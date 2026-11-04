import React from 'react';
import { ViewTab } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppLogo } from './AppLogo';
import {
  Sun,
  Moon,
  Plus,
  Download,
  Smartphone,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenNewEntry: () => void;
  onOpenIOSGuide: () => void;
  onOpenSheetsSync: () => void;
  isSheetsConnected: boolean;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleTheme,
  onOpenNewEntry,
  onOpenIOSGuide,
  onOpenSheetsSync,
  isSheetsConnected,
  isSyncing,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const navItems: { id: ViewTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'ledger', label: 'Records Ledger' },
    { id: 'analytics', label: 'Analytics & Rates' },
    { id: 'estimator', label: 'Cost Estimator' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors pt-safe">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
          {/* Zone 1: Brand Wordmark & Icon */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <AppLogo size="md" />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="group flex flex-col justify-center"
            >
              <span className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                AC Power Tracker
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider">
                Electricity Monitor &amp; Ledger
              </span>
            </a>
          </div>

          {/* Zone 2: Desktop Navigation Segmented Control */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Mobile Quick Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Google Sheets Sync Pill */}
            <button
              onClick={onOpenSheetsSync}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
                isSheetsConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100/80'
                  : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80'
              }`}
              title="Connect free Google Sheets sync"
              aria-label="Google Sheets Sync"
            >
              {isSheetsConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : isSheetsConnected ? 'Sheets: Synced' : 'Sync Sheet'}
              </span>
              <span className="sm:hidden text-[11px]">
                {isSheetsConnected ? 'Synced' : 'Sync'}
              </span>
            </button>

            {/* PWA Install Button (if available) */}
            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors whitespace-nowrap active:scale-95"
                title="Install Progressive Web App"
                aria-label="Install App"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {!isInstalled && isIOS && (
              <button
                onClick={onOpenIOSGuide}
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap active:scale-95"
                title="Install on iOS"
                aria-label="Install on iOS"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="min-h-[40px] min-w-[40px] p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors flex items-center justify-center active:scale-95"
              aria-label="Toggle Dark / Light Theme"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* New Entry Primary CTA */}
            <button
              onClick={onOpenNewEntry}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all active:scale-95 whitespace-nowrap shrink-0"
              aria-label="Add new entry"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">New Entry</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
