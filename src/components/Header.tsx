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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#090d16]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand element */}
          <div className="flex items-center gap-3 shrink-0">
            <AppLogo size="md" />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="group flex flex-col"
            >
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                AC Power Tracker
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium text-slate-600 dark:text-slate-300 tracking-wider">
                Electricity Monitor &amp; Ledger
              </span>
            </a>
          </div>

          {/* Zone 2: Navigation segmented control */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-xl">
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

          {/* Zone 3: Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Google Sheets Sync Pill */}
            <button
              onClick={onOpenSheetsSync}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                isSheetsConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100/80 shadow-2xs'
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80'
              }`}
              title="Connect free Google Sheets sync"
            >
              {isSheetsConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : isSheetsConnected ? 'Sheets: Synced' : 'Sync Sheet'}
              </span>
              <span className="sm:hidden">
                {isSheetsConnected ? 'Synced' : 'Sync'}
              </span>
            </button>

            {/* PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors whitespace-nowrap shrink-0"
                title="Install Progressive Web App"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {!isInstalled && isIOS && (
              <button
                onClick={onOpenIOSGuide}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
                title="Install on iOS"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              aria-label="Toggle Dark / Light Theme"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* New Entry Primary CTA */}
            <button
              onClick={onOpenNewEntry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-400">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
