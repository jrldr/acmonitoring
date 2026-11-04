import React from 'react';
import { ViewTab } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Sun,
  Moon,
  Plus,
  Download,
  Smartphone,
  FileSpreadsheet,
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

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single Brand element */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 overflow-hidden p-1.5">
              <img
                src="/icon-192.png"
                alt="AC Dashboard"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              AC Power Tracker
            </a>
          </div>

          {/* Zone 2: Single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'dashboard'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'ledger'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Records Ledger
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'analytics'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Analytics & Rates
            </button>
            <button
              onClick={() => setActiveTab('estimator')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'estimator'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cost Estimator
            </button>
          </nav>

          {/* Zone 3: Primary action + Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Google Sheets Sync Modal Trigger */}
            <button
              onClick={onOpenSheetsSync}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 shadow-2xs ${
                isSheetsConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Connect free Google Sheets sync"
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${isSheetsConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : isSheetsConnected ? 'Sheets Sync: Active' : 'Sync Google Sheet'}
              </span>
              <span className="sm:hidden">
                {isSheetsConnected ? 'Sheets' : 'Sync'}
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeTab === 'ledger' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeTab === 'analytics' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('estimator')}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeTab === 'estimator' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
            }`}
          >
            Estimator
          </button>
        </div>
      </div>
    </header>
  );
};
