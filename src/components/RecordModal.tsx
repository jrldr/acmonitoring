import React, { useState, useEffect, useMemo } from 'react';
import { ACRecord, RecordInput } from '../types';
import { computePreview, formatCurrency, formatKwh } from '../utils/calculations';
import { X, Calculator, Info } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: RecordInput, oldDate?: string) => void;
  initialData?: ACRecord | null;
  existingRecords: ACRecord[];
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingRecords,
}) => {
  const isEditing = !!initialData;

  const [cutoffDate, setCutoffDate] = useState('');
  const [kwCutOff, setKwCutOff] = useState('');
  const [kwMonth, setKwMonth] = useState('');
  const [ratePerKwh, setRatePerKwh] = useState('');
  const [offsetDays, setOffsetDays] = useState('');
  const [payment, setPayment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setCutoffDate(initialData.CutoffDate);
      setKwCutOff(initialData.KW_CutOff.toString());
      setKwMonth(initialData.KW_Month ? initialData.KW_Month.toString() : '');
      setRatePerKwh(initialData.RatePerKwh ? initialData.RatePerKwh.toString() : '');
      setOffsetDays(initialData.OffsetDays ? initialData.OffsetDays.toString() : '');
      setPayment(initialData.Payment ? initialData.Payment.toString() : '');
    } else {
      // Default cutoff date: next 21st or today's date
      const today = new Date();
      const yr = today.getFullYear();
      const mo = String(today.getMonth() + 1).padStart(2, '0');
      setCutoffDate(`${yr}-${mo}-21`);
      setKwCutOff('');
      setKwMonth('');
      setRatePerKwh('');
      setOffsetDays('');
      setPayment('');
    }
    setError(null);
  }, [initialData, isOpen]);

  // Live calculation preview
  const preview = useMemo(() => {
    return computePreview(
      {
        CutoffDate: cutoffDate,
        KW_CutOff: kwCutOff,
        KW_Month: kwMonth,
        RatePerKwh: ratePerKwh,
        OffsetDays: offsetDays,
        Payment: payment,
      },
      existingRecords,
      isEditing ? initialData?.CutoffDate : undefined
    );
  }, [cutoffDate, kwCutOff, kwMonth, ratePerKwh, offsetDays, payment, existingRecords, isEditing, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cutoffDate) {
      setError('Cutoff Date is required.');
      return;
    }
    if (kwCutOff === '' || isNaN(Number(kwCutOff))) {
      setError('KW CutOff reading is required.');
      return;
    }

    // Check if new cutoffDate already exists (unless editing the same record)
    if (!isEditing || initialData?.CutoffDate !== cutoffDate) {
      const exists = existingRecords.some((r) => r.CutoffDate === cutoffDate);
      if (exists) {
        setError(`A record for ${cutoffDate} already exists. Edit the existing record or change the date.`);
        return;
      }
    }

    onSave(
      {
        CutoffDate: cutoffDate,
        KW_CutOff: Number(kwCutOff),
        KW_Month: kwMonth ? Number(kwMonth) : 0,
        RatePerKwh: ratePerKwh ? Number(ratePerKwh) : '',
        OffsetDays: offsetDays ? Number(offsetDays) : 0,
        Payment: payment ? Number(payment) : 0,
      },
      initialData?.CutoffDate
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 relative transition-all my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEditing ? `Edit Entry: ${initialData?.CutoffDate}` : 'Add New Billing Cycle Entry'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record meter readings to calculate statement kWh, monthly bill, and running balance.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cutoff Date */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cutoff Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* KW CutOff */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>KW CutOff <span className="text-rose-500">*</span></span>
                <span className="text-[10px] lowercase font-normal text-slate-400">meter reading</span>
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 26.27"
                value={kwCutOff}
                onChange={(e) => setKwCutOff(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* KW Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>KW Month</span>
                <span className="text-[10px] lowercase font-normal text-slate-400">end of month</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={kwMonth}
                onChange={(e) => setKwMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Rate Per Kwh */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Rate / kWh (₱)</span>
                <span className="text-[10px] lowercase font-normal text-slate-400">leave empty for auto</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="(auto: inherits previous)"
                value={ratePerKwh}
                onChange={(e) => setRatePerKwh(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Offset Days */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Offset Days</span>
                <span className="text-[10px] lowercase font-normal text-slate-400">proration</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={offsetDays}
                onChange={(e) => setOffsetDays(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Payment Made */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Payment Made (₱)</span>
                <span className="text-[10px] lowercase font-normal text-slate-400">amount credited</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="₱0.00"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-2">
              <Calculator className="w-4 h-4 text-indigo-500" />
              <span>Real-Time Calculation Preview</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans">
                  Statement
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatKwh(preview.kwStatement)} kWh
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans">
                  Effective Rate
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  ₱{preview.usedRate.toFixed(2)}/kWh
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans">
                  Computed Bill
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {formatCurrency(preview.bill)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans">
                  Cycle Days
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {preview.cycleDays} days
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans">
                  Total Due
                </span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(preview.totalDue)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-sans">
                  Ending Balance
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    preview.balance > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : preview.balance < 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {formatCurrency(preview.balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
            >
              {isEditing ? 'Save Changes' : 'Record Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
