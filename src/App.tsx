import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ACRecord, RecordInput, ViewTab } from './types';
import { INITIAL_RECORDS } from './data/initialData';
import { recalculateAllRecords } from './utils/calculations';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StatCards } from './components/StatCards';
import { TrendChart } from './components/TrendChart';
import { LedgerTable } from './components/LedgerTable';
import { RecordModal } from './components/RecordModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { CostEstimator } from './components/CostEstimator';
import { AnalyticsView } from './components/AnalyticsView';
import { PWAInstallModal } from './components/PWAInstallModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { Plus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { safeGetItem, safeSetItem, safeRemoveItem } from './utils/storage';
import {
  isValidScriptUrl,
  fetchRecordsFromAppsScript,
  pushRecordsToAppsScript,
} from './utils/appsScriptSync';

const STORAGE_KEY = 'ac_power_tracker_records_v1';
const THEME_KEY = 'ac_power_tracker_theme';
const SHEETS_URL_KEY = 'ac_power_tracker_sheets_url';
const SHEETS_AUTOSYNC_KEY = 'ac_power_tracker_sheets_autosync';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = safeGetItem(THEME_KEY);
      if (saved) return saved === 'dark';
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {
      // Fallback
    }
    return true; // Default to sleek dark theme
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      safeSetItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      safeSetItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Records state
  const [records, setRecords] = useState<ACRecord[]>(() => {
    try {
      const saved = safeGetItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return recalculateAllRecords(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading saved records:', e);
    }
    return [];
  });

  // Save to safe storage whenever records change
  useEffect(() => {
    try {
      safeSetItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records:', e);
    }
  }, [records]);

  // Google Sheets Free Sync State
  const [sheetsScriptUrl, setSheetsScriptUrl] = useState<string>(() => {
    return safeGetItem(SHEETS_URL_KEY) || '';
  });
  const [autoSyncSheets, setAutoSyncSheets] = useState<boolean>(() => {
    const saved = safeGetItem(SHEETS_AUTOSYNC_KEY);
    return saved !== 'false';
  });
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSheetsConnected = useMemo(() => isValidScriptUrl(sheetsScriptUrl), [sheetsScriptUrl]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!syncToast) return;
    const timer = setTimeout(() => setSyncToast(null), 5000);
    return () => clearTimeout(timer);
  }, [syncToast]);

  // Push records to Google Sheet
  const handlePushToSheet = useCallback(
    async (recordsToPush = records) => {
      if (!isSheetsConnected) return;
      try {
        setIsSyncingSheets(true);
        await pushRecordsToAppsScript(sheetsScriptUrl, recordsToPush);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(timeStr);
        setSyncToast({
          type: 'success',
          message: `Successfully synced ${recordsToPush.length} records to your Google Sheet!`,
        });
      } catch (err) {
        console.error('Push to Google Sheet failed:', err);
        setSyncToast({
          type: 'error',
          message: `Google Sheet sync failed: ${(err as Error).message}`,
        });
      } finally {
        setIsSyncingSheets(false);
      }
    },
    [isSheetsConnected, sheetsScriptUrl, records]
  );

  // Pull records from Google Sheet
  const handlePullFromSheet = useCallback(async () => {
    if (!isSheetsConnected) return;
    try {
      setIsSyncingSheets(true);
      const sheetRecords = await fetchRecordsFromAppsScript(sheetsScriptUrl);
      if (sheetRecords && sheetRecords.length > 0) {
        setRecords(sheetRecords);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(timeStr);
        setSyncToast({
          type: 'success',
          message: `Loaded ${sheetRecords.length} records from your Google Sheet!`,
        });
      } else {
        setSyncToast({
          type: 'error',
          message: 'The connected Google Sheet has no billing records yet. Use "Push to Sheet" to populate it or log entries.',
        });
      }
    } catch (err) {
      console.error('Pull from Google Sheet failed:', err);
      setSyncToast({
        type: 'error',
        message: `Failed to load from Google Sheet: ${(err as Error).message}`,
      });
    } finally {
      setIsSyncingSheets(false);
    }
  }, [isSheetsConnected, sheetsScriptUrl]);

  // Save new script URL and auto-pull if valid
  const handleSaveScriptUrl = (url: string) => {
    setSheetsScriptUrl(url);
    safeSetItem(SHEETS_URL_KEY, url);
    if (isValidScriptUrl(url)) {
      setSyncToast({
        type: 'success',
        message: 'Google Sheet connected! Pulling records...',
      });
      // Auto-pull immediately after connecting
      fetchRecordsFromAppsScript(url)
        .then((sheetRecords) => {
          if (sheetRecords && sheetRecords.length > 0) {
            setRecords(sheetRecords);
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSyncedAt(timeStr);
            setSyncToast({
              type: 'success',
              message: `Connected & loaded ${sheetRecords.length} records from Google Sheet!`,
            });
          }
        })
        .catch((err) => {
          console.error('Auto pull failed:', err);
        });
    } else if (!url) {
      safeRemoveItem(SHEETS_URL_KEY);
      setSyncToast({
        type: 'success',
        message: 'Google Sheet disconnected.',
      });
    }
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncSheets(enabled);
    safeSetItem(SHEETS_AUTOSYNC_KEY, enabled ? 'true' : 'false');
  };

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ACRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<ACRecord | null>(null);
  const [isIOSGuideOpen, setIsIOSGuideOpen] = useState(false);

  // Latest and previous records (sorted chronologically)
  const sortedRecords = useMemo(() => {
    return [...records].sort(
      (a, b) => new Date(a.CutoffDate).getTime() - new Date(b.CutoffDate).getTime()
    );
  }, [records]);

  const latestRecord = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1] : undefined;
  const previousRecord = sortedRecords.length > 1 ? sortedRecords[sortedRecords.length - 2] : undefined;

  // Effective latest rate
  const latestRate = useMemo(() => {
    if (!sortedRecords.length) return 15.5;
    for (let i = sortedRecords.length - 1; i >= 0; i--) {
      const r = sortedRecords[i].RatePerKwh;
      if (r !== null && !isNaN(Number(r)) && Number(r) > 0) {
        return Number(r);
      }
    }
    return 15.5;
  }, [sortedRecords]);

  // Add / Edit Record handler
  const handleSaveRecord = (input: RecordInput, oldDate?: string) => {
    let updated = [...records];
    if (oldDate) {
      updated = updated.filter((r) => r.CutoffDate !== oldDate);
    }

    const rateVal =
      input.RatePerKwh !== undefined && input.RatePerKwh !== '' && !isNaN(Number(input.RatePerKwh)) && Number(input.RatePerKwh) > 0
        ? Number(input.RatePerKwh)
        : null;

    const newRecord: ACRecord = {
      CutoffDate: input.CutoffDate,
      KW_CutOff: Number(input.KW_CutOff) || 0,
      KW_Month: Number(input.KW_Month) || 0,
      KW_Statement: 0,
      RatePerKwh: rateVal,
      Bill: 0,
      CycleDays: 0,
      AveCost_Day: 0,
      OffsetDays: Number(input.OffsetDays) || 0,
      TotalDue: 0,
      Payment: Number(input.Payment) || 0,
      Balance: 0,
    };

    updated.push(newRecord);
    const recomputed = recalculateAllRecords(updated);
    setRecords(recomputed);

    // Auto-sync to Google Sheet if connected
    if (isSheetsConnected && autoSyncSheets) {
      handlePushToSheet(recomputed);
    }
  };

  // Delete Record handler
  const handleDeleteRecord = (cutoffDate: string) => {
    const updated = records.filter((r) => r.CutoffDate !== cutoffDate);
    const recomputed = recalculateAllRecords(updated);
    setRecords(recomputed);

    // Auto-sync deletion to Google Sheet if connected
    if (isSheetsConnected && autoSyncSheets) {
      handlePushToSheet(recomputed);
    }
  };

  // Import Records handler
  const handleImportRecords = (newRecords: ACRecord[]) => {
    const recomputed = recalculateAllRecords(newRecords);
    setRecords(recomputed);
    if (isSheetsConnected && autoSyncSheets) {
      handlePushToSheet(recomputed);
    }
  };

  // Clear all data
  const handleResetData = () => {
    setRecords([]);
    safeRemoveItem(STORAGE_KEY);
    if (isSheetsConnected && autoSyncSheets) {
      handlePushToSheet([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenNewEntry={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        onOpenIOSGuide={() => setIsIOSGuideOpen(true)}
        onOpenSheetsSync={() => setIsSheetsModalOpen(true)}
        isSheetsConnected={isSheetsConnected}
        isSyncing={isSyncingSheets}
      />

      {/* Floating Sync Feedback Toast */}
      {syncToast && (
        <div className="fixed top-16 sm:top-18 right-3 sm:right-4 z-50 max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs animate-in slide-in-from-top-2 duration-200">
          {syncToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          )}
          <span className="text-slate-700 dark:text-slate-200 font-medium">{syncToast.message}</span>
        </div>
      )}

      {/* Main Responsive Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 lg:pb-12">
        {activeTab === 'dashboard' && (
          <div>
            {/* 5 KPI Stat Cards */}
            <StatCards latestRecord={latestRecord} previousRecord={previousRecord} />

            {/* Monthly Trend Chart */}
            <TrendChart records={records} onSelectRecord={(r) => setViewingRecord(r)} />

            {/* Recent Billing Cycles Quick Table + Estimator Callout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              {/* Recent Records (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Billing Cycles
                  </h3>
                  <button
                    onClick={() => setActiveTab('ledger')}
                    className="min-h-[36px] text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 py-1"
                  >
                    <span>View all {records.length}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-xs text-left min-w-[320px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase">
                        <th className="py-2">Month</th>
                        <th className="py-2 text-right">Statement</th>
                        <th className="py-2 text-right">Bill</th>
                        <th className="py-2 text-right">Total Due</th>
                        <th className="py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {[...sortedRecords].reverse().slice(0, 5).map((r) => (
                        <tr key={r.CutoffDate} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200">
                            {r.CutoffDate}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                            {r.KW_Statement} kWh
                          </td>
                          <td className="py-2.5 text-right text-slate-700 dark:text-slate-300">
                            ₱{r.Bill.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                            ₱{r.TotalDue.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => setViewingRecord(r)}
                              className="min-h-[32px] text-[11px] font-sans font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Estimator Card (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-white dark:from-[#131b2e] dark:via-[#101726] dark:to-[#101726] border border-indigo-100/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Live Simulator
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Calculate AC Running Costs
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Test different temperature settings, compressor horsepowers, and operating hours to see how much you can save on your next electricity bill.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-indigo-100 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab('estimator')}
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors active:scale-98"
                  >
                    <span>Open Power &amp; Cost Estimator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <LedgerTable
            records={records}
            onViewRecord={(r) => setViewingRecord(r)}
            onEditRecord={(r) => {
              setEditingRecord(r);
              setIsRecordModalOpen(true);
            }}
            onDeleteRecord={handleDeleteRecord}
            onImportRecords={handleImportRecords}
            onResetData={handleResetData}
            onOpenNewEntry={() => {
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            onOpenSheetsSync={() => setIsSheetsModalOpen(true)}
            isSheetsConnected={isSheetsConnected}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView records={records} />}

        {activeTab === 'estimator' && <CostEstimator latestRate={latestRate} />}
      </main>

      {/* Floating Action Button on Mobile (Positioned above bottom nav) */}
      <button
        onClick={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        className="lg:hidden fixed bottom-20 right-4 w-13 h-13 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center z-30 active:scale-90 transition-transform"
        aria-label="Add new billing record"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewEntry={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
      />

      {/* Record Add / Edit Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialData={editingRecord}
        existingRecords={records}
      />

      {/* Record Detail Modal */}
      <RecordDetailModal
        record={viewingRecord}
        onClose={() => setViewingRecord(null)}
        onEdit={(r) => {
          setViewingRecord(null);
          setEditingRecord(r);
          setIsRecordModalOpen(true);
        }}
      />

      {/* PWA iOS Guide Modal */}
      <PWAInstallModal isOpen={isIOSGuideOpen} onClose={() => setIsIOSGuideOpen(false)} />

      {/* Google Sheets Free Sync Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        scriptUrl={sheetsScriptUrl}
        onSaveScriptUrl={handleSaveScriptUrl}
        onPushToSheet={() => handlePushToSheet()}
        onPullFromSheet={handlePullFromSheet}
        isSyncing={isSyncingSheets}
        lastSyncedAt={lastSyncedAt}
        autoSync={autoSyncSheets}
        onToggleAutoSync={handleToggleAutoSync}
      />
    </div>
  );
}
