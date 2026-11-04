import React from 'react';
import { ViewTab } from '../types';
import { LayoutDashboard, FileSpreadsheet, BarChart3, Sliders, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onOpenNewEntry: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewEntry,
}) => {
  const tabs: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ledger', label: 'Ledger', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'estimator', label: 'Estimator', icon: Sliders },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b101c]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 pb-safe shadow-2xl transition-colors select-none"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 items-center h-15 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all rounded-xl active:scale-95 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`relative p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
