import React from 'react';
import { ACRecord } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel } from '../utils/calculations';
import { X, Edit2, Calendar, Zap, DollarSign, Clock, HelpCircle } from 'lucide-react';

interface RecordDetailModalProps {
  record: ACRecord | null;
  onClose: () => void;
  onEdit: (record: ACRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose, onEdit }) => {
  if (!record) return null;

  const isDue = record.Balance > 0;
  const isCredit = record.Balance < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative transition-all my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Statement Breakdown
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {formatMonthLabel(record.CutoffDate)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Billing cutoff date: <span className="font-mono">{record.CutoffDate}</span>
          </p>
        </div>

        {/* Detailed Rows */}
        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">Cycle Duration:</span>
            <strong className="font-mono text-slate-900 dark:text-white">{record.CycleDays} Days</strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">KW CutOff Reading:</span>
            <strong className="font-mono text-slate-900 dark:text-white">{formatKwh(record.KW_CutOff)}</strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">KW Month Reading:</span>
            <strong className="font-mono text-slate-900 dark:text-white">
              {record.KW_Month > 0 ? formatKwh(record.KW_Month) : '0.00'}
            </strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">Offset Days:</span>
            <strong className="font-mono text-slate-900 dark:text-white">{record.OffsetDays} Days</strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 px-2 rounded">
            <span className="font-medium text-slate-700 dark:text-slate-300">Computed Statement:</span>
            <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {formatKwh(record.KW_Statement)} kWh
            </strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">Rate Per kWh:</span>
            <strong className="font-mono text-slate-900 dark:text-white">
              ₱{Number(record.RatePerKwh || (record.KW_Statement > 0 ? record.Bill / record.KW_Statement : 0)).toFixed(4)}
            </strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">Computed Bill:</span>
            <strong className="font-mono text-slate-900 dark:text-white font-bold">
              {formatCurrency(record.Bill)}
            </strong>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400">Average Cost / Day:</span>
            <strong className="font-mono text-slate-900 dark:text-white">
              {formatCurrency(record.AveCost_Day)}
            </strong>
          </div>

          {/* Highlight Due */}
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex justify-between items-center text-red-900 dark:text-red-200">
            <span className="font-semibold text-red-700 dark:text-red-400">Total Due (with rollover):</span>
            <strong className="font-mono text-base font-extrabold text-red-700 dark:text-red-300">
              {formatCurrency(record.TotalDue)}
            </strong>
          </div>

          {/* Highlight Payment */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex justify-between items-center text-emerald-900 dark:text-emerald-200">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Payment Credited:</span>
            <strong className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(record.Payment)}
            </strong>
          </div>

          {/* Remaining Balance */}
          <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-800 px-1 font-bold">
            <span className="text-slate-700 dark:text-slate-300">Net Ending Balance:</span>
            <strong
              className={`font-mono text-base tabular-nums ${
                isDue
                  ? 'text-rose-600 dark:text-rose-400'
                  : isCredit
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {formatCurrency(record.Balance)}
            </strong>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              onEdit(record);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit This Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
