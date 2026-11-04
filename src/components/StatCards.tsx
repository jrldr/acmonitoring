import React from 'react';
import { ACRecord } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel } from '../utils/calculations';
import { Zap, AlertCircle, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface StatCardsProps {
  latestRecord?: ACRecord;
  previousRecord?: ACRecord;
}

export const StatCards: React.FC<StatCardsProps> = ({ latestRecord, previousRecord }) => {
  if (!latestRecord) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  const currentDue = latestRecord.TotalDue;
  const latestBill = latestRecord.Bill;
  const kwStatement = latestRecord.KW_Statement;
  const aveCost = latestRecord.AveCost_Day;
  const balance = latestRecord.Balance;

  // Comparison metrics vs previous record
  const kwDiff = previousRecord ? kwStatement - previousRecord.KW_Statement : 0;
  const billDiff = previousRecord ? latestBill - previousRecord.Bill : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* 1. Current Total Due */}
      <div className="col-span-2 sm:col-span-1 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 border-l-red-500 dark:border-l-red-500">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Current Total Due</span>
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
          {formatCurrency(currentDue)}
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span>Cutoff:</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{latestRecord.CutoffDate}</span>
        </div>
      </div>

      {/* 2. Latest Bill */}
      <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Latest Bill</span>
          <DollarSign className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
          {formatCurrency(latestBill)}
        </div>
        <div className="mt-2 text-xs flex items-center gap-1">
          {previousRecord && billDiff !== 0 ? (
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${
                billDiff > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {billDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {billDiff > 0 ? '+' : ''}
              {formatCurrency(billDiff)}
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              {formatMonthLabel(latestRecord.CutoffDate)}
            </span>
          )}
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 dark:text-slate-400">{latestRecord.CycleDays}d cycle</span>
        </div>
      </div>

      {/* 3. KW / Statement */}
      <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>KW / Statement</span>
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight flex items-baseline gap-1">
          <span>{formatKwh(kwStatement)}</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">kWh</span>
        </div>
        <div className="mt-2 text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {previousRecord && kwDiff !== 0 ? (
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${
                kwDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {kwDiff > 0 ? '+' : ''}
              {formatKwh(kwDiff)} kWh
            </span>
          ) : (
            <span>Base meter</span>
          )}
        </div>
      </div>

      {/* 4. Ave Cost / Day */}
      <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Ave Cost / Day</span>
          <Calendar className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
          {formatCurrency(aveCost)}
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>~{formatKwh(latestRecord.CycleDays > 0 ? kwStatement / latestRecord.CycleDays : 0)} kWh / day</span>
        </div>
      </div>

      {/* 5. Remaining Balance */}
      <div className="col-span-2 sm:col-span-1 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Remaining Balance</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              balance > 0
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                : balance < 0
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {balance > 0 ? 'Pending' : balance < 0 ? 'Credit Advance' : 'Settled'}
          </span>
        </div>
        <div
          className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight ${
            balance > 0
              ? 'text-rose-600 dark:text-rose-400'
              : balance < 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {formatCurrency(balance)}
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Paid: {formatCurrency(latestRecord.Payment)}</span>
        </div>
      </div>
    </div>
  );
};
