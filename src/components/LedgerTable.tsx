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
  const [sortField, setSortField] = useState<'CutoffDate' | 'KW_Statement' | 'Bill' | 'TotalDue'>('CutoffDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

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

  const handleSort = (field: 'CutoffDate' | 'KW_Statement' | 'Bill' | 'TotalDue') => {
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
          alert(`Successfully imported ${parsed.length} records!`);
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
    <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-6 transition-colors shadow-sm">
      {/* Top Controls & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            <span>Historical Consumption & Billing Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {filteredAndSortedRecords.length} of {records.length} records · Completely free & offline-ready
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[160px] sm:min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search month or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Download records as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Import CSV backup file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* Google Sheets Sync Button */}
          <button
            onClick={onOpenSheetsSync}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isSheetsConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs'
            }`}
            title="Open Google Sheets cloud sync"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isSheetsConnected ? 'Sheets: Synced' : 'Sync Google Sheet'}</span>
          </button>

          {/* Reset data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all records back to the original 28 historical records?')) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Reset to default seed dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto -mx-5 sm:-mx-6 scrollbar-thin">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
              <th className="py-3 px-3 text-right">Balance</th>
              <th className="py-3 px-4 sm:px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredAndSortedRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm">No billing records found matching your filter.</p>
                    <button
                      onClick={onOpenNewEntry}
                      className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Log New Entry
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedRecords.map((r) => {
                const isCredit = r.Balance < 0;
                const isDue = r.Balance > 0;

                return (
                  <tr
                    key={r.CutoffDate}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      <div>{formatMonthLabel(r.CutoffDate)}</div>
                      <div className="text-[11px] font-normal text-slate-400 dark:text-slate-500 font-mono">
                        {r.CutoffDate} ({r.CycleDays}d)
                      </div>
                    </td>

                    {/* KW CutOff */}
                    <td className="py-3 px-3 text-right tabular-nums font-mono text-slate-600 dark:text-slate-300">
                      {formatKwh(r.KW_CutOff)}
                    </td>

                    {/* KW Month */}
                    <td className="py-3 px-3 text-right tabular-nums font-mono text-slate-600 dark:text-slate-300">
                      {r.KW_Month > 0 ? formatKwh(r.KW_Month) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>

                    {/* KW Statement */}
                    <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-slate-900 dark:text-white">
                      {formatKwh(r.KW_Statement)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">kWh</span>
                    </td>

                    {/* Rate/kWh */}
                    <td className="py-3 px-3 text-right tabular-nums font-mono text-slate-600 dark:text-slate-400">
                      {r.RatePerKwh ? (
                        `₱${Number(r.RatePerKwh).toFixed(2)}`
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]" title="Auto-inherited from previous period">
                          auto
                        </span>
                      )}
                    </td>

                    {/* Bill */}
                    <td className="py-3 px-3 text-right tabular-nums font-mono font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(r.Bill)}
                    </td>

                    {/* Total Due */}
                    <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(r.TotalDue)}
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-3 text-right tabular-nums font-mono text-emerald-600 dark:text-emerald-400">
                      {r.Payment > 0 ? formatCurrency(r.Payment) : <span className="text-slate-300 dark:text-slate-600">₱0.00</span>}
                    </td>

                    {/* Balance */}
                    <td
                      className={`py-3 px-3 text-right tabular-nums font-mono font-semibold ${
                        isDue
                          ? 'text-rose-600 dark:text-rose-400'
                          : isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {formatCurrency(r.Balance)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onViewRecord(r)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          title="View statement details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditRecord(r)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRecordToDelete(r.CutoffDate)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#111827] p-5 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Record</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete the record for{' '}
              <strong>{recordToDelete}</strong>? All subsequent periods will be automatically recalculated.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setRecordToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteRecord(recordToDelete);
                  setRecordToDelete(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
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
