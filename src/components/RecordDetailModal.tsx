import React from 'react';
import { ACRecord } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel } from '../utils/calculations';
import { X, Edit2 } from 'lucide-react';

interface RecordDetailModalProps {
  record: ACRecord | null;
  onClose: () => void;
  onEdit: (record: ACRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose, onEdit }) => {
  if (!record) return null;

  const isDue = record.Balance > 0.01;
  const isCredit = record.Balance < -0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#111827] shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 relative transition-all max-h-[92vh] overflow-y-auto scrollbar-thin pb-safe">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-4" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800 pr-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Statement Breakdown
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatMonthLabel(record.CutoffDate)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Billing cutoff date: <span className="font-mono text-slate-700 dark:text-slate-300">{record.CutoffDate}</span>
          </p>
        </div>

        {/* Detailed Statement Rows */}
        <div className="space-y-2 text-xs sm:text-sm">
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

          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 px-2.5 rounded-xl">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Computed Statement:</span>
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
            <span className="text-slate-500 dark:text-slate-400">Computed Cycle Bill:</span>
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
          <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex justify-between items-center text-rose-900 dark:text-rose-200">
            <span className="font-semibold text-rose-700 dark:text-rose-400">Total Due (with rollover):</span>
            <strong className="font-mono text-base font-extrabold text-rose-700 dark:text-rose-300">
              {formatCurrency(record.TotalDue)}
            </strong>
          </div>

          {/* Highlight Payment */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex justify-between items-center text-emerald-900 dark:text-emerald-200">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Payment Credited:</span>
            <strong className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(record.Payment)}
            </strong>
          </div>

          {/* Remaining Balance */}
          <div className="flex justify-between py-2.5 border-t border-slate-200 dark:border-slate-800 px-1 font-bold">
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
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              onEdit(record);
            }}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors active:scale-98"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit This Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
