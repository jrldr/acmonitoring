import React, { useState, useMemo, useRef } from 'react';
import { ACRecord } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel, exportToCSV, parseCSV } from '../utils/calculations';
import {
  Search,
  Download,
  Upload,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  LayoutList,
  Table as TableIcon,
} from 'lucide-react';

interface LedgerTableProps {
  records: ACRecord[];
  onViewRecord: (record: ACRecord) => void;
  onEditRecord: (record: ACRecord) => void;
  onDeleteRecord: (cutoffDate: string) => void;
  onImportRecords: (records: ACRecord[]) => void;
  onResetData: () => void;
  onOpenNewEntry: () => void;
  onOpenSheetsSync: () => void;
  isSheetsConnected: boolean;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  records,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onImportRecords,
  onResetData,
  onOpenNewEntry,
  onOpenSheetsSync,
  isSheetsConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortField, setSortField] = useState<'CutoffDate' | 'KW_Statement' | 'Bill' | 'TotalDue' | 'Balance'>('CutoffDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract distinct years for year filter
  const years = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      const y = r.CutoffDate.split('-')[0];
      if (y) set.add(y);
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  // Aggregate summary
  const summary = useMemo(() => {
    const totalKwh = records.reduce((acc, r) => acc + r.KW_Statement, 0);
    const totalBilled = records.reduce((acc, r) => acc + r.Bill, 0);
    const totalPaid = records.reduce((acc, r) => acc + r.Payment, 0);
    const netBalance = records.length > 0 ? records[records.length - 1].Balance : 0;
    return { totalKwh, totalBilled, totalPaid, netBalance };
  }, [records]);

  // Filter and sort records
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    if (selectedYear !== 'all') {
      result = result.filter((r) => r.CutoffDate.startsWith(selectedYear));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.CutoffDate.toLowerCase().includes(q) ||
          formatMonthLabel(r.CutoffDate).toLowerCase().includes(q) ||
          r.Bill.toString().includes(q) ||
          r.KW_Statement.toString().includes(q)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'CutoffDate') {
        comparison = new Date(a.CutoffDate).getTime() - new Date(b.CutoffDate).getTime();
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [records, selectedYear, searchQuery, sortField, sortDirection]);

  const handleSort = (field: 'CutoffDate' | 'KW_Statement' | 'Bill' | 'TotalDue' | 'Balance') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ac-power-data-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          onImportRecords(parsed);
        } else {
          alert('Could not find valid records in the selected CSV file.');
        }
      } catch (err) {
        alert(`Failed to import CSV: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-6 mb-6 transition-colors shadow-xs">
      {/* Top Ledger Header & Summary Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Historical Consumption Ledger</span>
            </h2>

            {/* Mobile View Toggle Button (Cards vs Full Table) */}
            <div className="sm:hidden flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setMobileViewMode('cards')}
                className={`p-1.5 rounded-md ${
                  mobileViewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500'
                }`}
                title="Mobile Cards View"
                aria-label="Cards view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileViewMode('table')}
                className={`p-1.5 rounded-md ${
                  mobileViewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500'
                }`}
                title="Spreadsheet Table View"
                aria-label="Table view"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{filteredAndSortedRecords.length} of {records.length} Cycles</span>
            <span aria-hidden="true">·</span>
            <span>Cumulative: <strong className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">{formatKwh(summary.totalKwh)} kWh</strong></span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Total Invoiced: <strong className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">{formatCurrency(summary.totalBilled)}</strong></span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial min-w-[130px] sm:min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search month..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[40px]"
            />
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[40px]"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors whitespace-nowrap active:scale-95"
            title="Download records as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Import CSV */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors whitespace-nowrap active:scale-95"
            title="Import CSV backup file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Google Sheets Sync Button */}
          <button
            onClick={onOpenSheetsSync}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
              isSheetsConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs'
            }`}
            title="Open Google Sheets cloud sync"
          >
            {isSheetsConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isSheetsConnected ? 'Sheets: Synced' : 'Sync Sheet'}</span>
            <span className="sm:hidden">{isSheetsConnected ? 'Synced' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* MOBILE ADAPTIVE VIEW: Tactile Card List on Smartphones */}
      {mobileViewMode === 'cards' && (
        <div className="sm:hidden space-y-2.5">
          {filteredAndSortedRecords.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No billing records match your search.
            </div>
          ) : (
            filteredAndSortedRecords.map((r) => {
              const isCredit = r.Balance < -0.01;
              const isDue = r.Balance > 0.01;

              return (
                <div
                  key={r.CutoffDate}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 transition-all active:scale-[0.99]"
                >
                  <div
                    onClick={() => onViewRecord(r)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {formatMonthLabel(r.CutoffDate)}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {r.CutoffDate}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isDue
                            ? 'text-rose-600 dark:text-rose-400'
                            : isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {isDue ? 'Due ' : isCredit ? 'Credit ' : 'Settled '}
                        {formatCurrency(Math.abs(r.Balance))}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-slate-200/50 dark:border-slate-800/60 font-mono">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-sans">Statement</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{formatKwh(r.KW_Statement)} kWh</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-sans">Cycle Bill</span>
                        <strong className="text-slate-900 dark:text-white font-semibold">{formatCurrency(r.Bill)}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-sans">Total Due</span>
                        <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(r.TotalDue)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Touch Action Row */}
                  <div className="flex items-center justify-between pt-2.5 mt-1 text-xs">
                    <button
                      onClick={() => onViewRecord(r)}
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium py-1 px-1.5"
                    >
                      <span>Statement breakdown</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditRecord(r)}
                        className="min-h-[36px] min-w-[36px] p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                        title="Edit record"
                        aria-label="Edit record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRecordToDelete(r.CutoffDate)}
                        className="min-h-[36px] min-w-[36px] p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                        title="Delete record"
                        aria-label="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* FULL DESKTOP & TABLET SPREADSHEET TABLE */}
      <div className={`overflow-x-auto -mx-4 sm:-mx-6 scrollbar-thin ${mobileViewMode === 'cards' ? 'hidden sm:block' : 'block'}`}>
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th
                onClick={() => handleSort('CutoffDate')}
                className="py-3 px-4 sm:px-6 cursor-pointer hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Cycle Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Cutoff kWh</th>
              <th className="py-3 px-3 text-right">Month kWh</th>
              <th
                onClick={() => handleSort('KW_Statement')}
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Statement</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Rate/kWh</th>
              <th
                onClick={() => handleSort('Bill')}
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bill</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('TotalDue')}
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Due</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Payment</th>
              <th
                onClick={() => handleSort('Balance')}
                className="py-3 px-3 text-right cursor-pointer hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Balance</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 sm:px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
            {filteredAndSortedRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400 dark:text-slate-500 font-sans">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm">No billing records found matching your filter.</p>
                    <button
                      onClick={onOpenNewEntry}
                      className="mt-2 min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Log New Entry
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedRecords.map((r) => {
                const isCredit = r.Balance < -0.01;
                const isDue = r.Balance > 0.01;
                const isSettled = !isDue && !isCredit;

                return (
                  <tr
                    key={r.CutoffDate}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="font-sans font-bold text-slate-900 dark:text-slate-100">
                        {formatMonthLabel(r.CutoffDate)}
                      </div>
                      <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500 font-mono">
                        {r.CutoffDate} ({r.CycleDays}d)
                      </div>
                    </td>

                    {/* KW CutOff */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                      {formatKwh(r.KW_CutOff)}
                    </td>

                    {/* KW Month */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                      {r.KW_Month > 0 ? formatKwh(r.KW_Month) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>

                    {/* KW Statement */}
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900 dark:text-white">
                      {formatKwh(r.KW_Statement)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">kWh</span>
                    </td>

                    {/* Rate/kWh */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                      {r.RatePerKwh ? (
                        `₱${Number(r.RatePerKwh).toFixed(2)}`
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] font-sans" title="Inherited from previous cycle">
                          auto
                        </span>
                      )}
                    </td>

                    {/* Bill */}
                    <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(r.Bill)}
                    </td>

                    {/* Total Due */}
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-900 dark:text-white">
                      {formatCurrency(r.TotalDue)}
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      {r.Payment > 0 ? formatCurrency(r.Payment) : <span className="text-slate-300 dark:text-slate-600">₱0.00</span>}
                    </td>

                    {/* Balance */}
                    <td
                      className={`py-3 px-3 text-right tabular-nums font-bold ${
                        isDue
                          ? 'text-rose-600 dark:text-rose-400'
                          : isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {formatCurrency(r.Balance)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap font-sans text-xs">
                      {isDue && (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          Due
                        </span>
                      )}
                      {isCredit && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Credit
                        </span>
                      )}
                      {isSettled && (
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          Settled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onViewRecord(r)}
                          className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                          title="View statement details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditRecord(r)}
                          className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRecordToDelete(r.CutoffDate)}
                          className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111827] p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Billing Record</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete the record for <strong>{recordToDelete}</strong>? Subsequent periods and balances will recalculate automatically.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRecordToDelete(null)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteRecord(recordToDelete);
                  setRecordToDelete(null);
                }}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
