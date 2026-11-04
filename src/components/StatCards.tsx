import React from 'react';
import { ACRecord } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel } from '../utils/calculations';
import { Zap, AlertCircle, Calendar, TrendingUp, TrendingDown, DollarSign, CheckCircle2 } from 'lucide-react';

interface StatCardsProps {
  latestRecord?: ACRecord;
  previousRecord?: ACRecord;
}

export const StatCards: React.FC<StatCardsProps> = ({ latestRecord, previousRecord }) => {
  if (!latestRecord) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 animate-pulse h-32"
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

  const isDue = balance > 0;
  const isCredit = balance < 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
      {/* 1. Current Total Due */}
      <div
        className={`col-span-2 sm:col-span-1 rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-200 border shadow-xs hover:shadow-md ${
          isDue
            ? 'bg-gradient-to-br from-rose-50/70 to-white dark:from-[#1e131d] dark:to-[#111827] border-rose-200 dark:border-rose-900/60'
            : isCredit
            ? 'bg-gradient-to-br from-emerald-50/70 to-white dark:from-[#0d1e18] dark:to-[#111827] border-emerald-200 dark:border-emerald-900/60'
            : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Current Total Due</span>
          {isDue ? (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
        </div>
        <div
          className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight font-mono ${
            isDue
              ? 'text-rose-600 dark:text-rose-400'
              : isCredit
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {formatCurrency(currentDue)}
        </div>
        <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span>Cutoff: <strong className="text-slate-700 dark:text-slate-300 font-mono font-medium">{latestRecord.CutoffDate}</strong></span>
          <span className="text-[10px] text-slate-400 font-mono">{latestRecord.CycleDays}d</span>
        </div>
      </div>

      {/* 2. Latest Bill */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Latest Bill</span>
          <DollarSign className="w-4 h-4 text-indigo-500 shrink-0" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight font-mono">
          {formatCurrency(latestBill)}
        </div>
        <div className="mt-2.5 text-xs flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          {previousRecord && billDiff !== 0 ? (
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums font-mono ${
                billDiff > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {billDiff > 0 ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
              {billDiff > 0 ? '+' : ''}
              {formatCurrency(billDiff)}
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {formatMonthLabel(latestRecord.CutoffDate)}
            </span>
          )}
          <span className="text-slate-400 text-[11px]">Bill calc</span>
        </div>
      </div>

      {/* 3. KW / Statement */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>KW / Statement</span>
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight font-mono flex items-baseline gap-1">
          <span>{formatKwh(kwStatement)}</span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-sans">kWh</span>
        </div>
        <div className="mt-2.5 text-xs flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          {previousRecord && kwDiff !== 0 ? (
            <span
              className={`inline-flex items-center gap-0.5 font-medium tabular-nums font-mono ${
                kwDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {kwDiff > 0 ? '+' : ''}
              {formatKwh(kwDiff)} kWh
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">Net reading</span>
          )}
          <span className="text-slate-400 text-[11px]">Usage</span>
        </div>
      </div>

      {/* 4. Ave Cost / Day */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Ave Cost / Day</span>
          <Calendar className="w-4 h-4 text-cyan-500 shrink-0" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight font-mono">
          {formatCurrency(aveCost)}
        </div>
        <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono">
          <span>~{formatKwh(latestRecord.CycleDays > 0 ? kwStatement / latestRecord.CycleDays : 0)} kWh/d</span>
          <span className="text-slate-400 text-[11px]">Daily</span>
        </div>
      </div>

      {/* 5. Remaining Balance */}
      <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 relative overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Remaining Balance</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isDue
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                : isCredit
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {isDue ? 'Due' : isCredit ? 'Credit' : 'Settled'}
          </span>
        </div>
        <div
          className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight font-mono ${
            isDue
              ? 'text-rose-600 dark:text-rose-400'
              : isCredit
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {formatCurrency(balance)}
        </div>
        <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span>Paid: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(latestRecord.Payment)}</strong></span>
          <span className="text-slate-400 text-[11px]">Net</span>
        </div>
      </div>
    </div>
  );
};
