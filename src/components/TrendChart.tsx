import React, { useState, useMemo } from 'react';
import { ACRecord, TimeRange } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel } from '../utils/calculations';
import { BarChart3, TrendingUp, Zap, HelpCircle } from 'lucide-react';

interface TrendChartProps {
  records: ACRecord[];
  onSelectRecord: (record: ACRecord) => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({ records, onSelectRecord }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('12m');
  const [metric, setMetric] = useState<'kwh' | 'bill'>('kwh');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter records based on selected timeframe
  const filteredRecords = useMemo(() => {
    if (!records.length) return [];
    const sorted = [...records].sort(
      (a, b) => new Date(a.CutoffDate).getTime() - new Date(b.CutoffDate).getTime()
    );

    if (timeRange === 'all') return sorted;

    const count = timeRange === '6m' ? 6 : 12;
    return sorted.slice(-count);
  }, [records, timeRange]);

  // Compute stats for current view
  const { maxVal, minVal, avgVal } = useMemo(() => {
    if (!filteredRecords.length) return { maxVal: 1, minVal: 0, avgVal: 0 };
    const values = filteredRecords.map((r) => (metric === 'kwh' ? r.KW_Statement : r.Bill));
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
    return { maxVal: max, minVal: min, avgVal: avg };
  }, [filteredRecords, metric]);

  if (!records.length) {
    return (
      <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500">
        No records available for trend analysis.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-6 transition-colors shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {metric === 'kwh' ? 'Electricity Consumption Trend' : 'Billing Amount Trend'}
            </h2>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg z-50">
                Click any bar to inspect full billing details and formulas for that cycle.
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Average: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{metric === 'kwh' ? `${formatKwh(avgVal)} kWh` : formatCurrency(avgVal)}</span> · Highest: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{metric === 'kwh' ? `${formatKwh(maxVal)} kWh` : formatCurrency(maxVal)}</span>
          </p>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMetric('kwh')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'kwh'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              kWh
            </button>
            <button
              onClick={() => setMetric('bill')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                metric === 'bill'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bill (₱)
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === '6m'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeRange('12m')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === '12m'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              12M
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart Canvas */}
      <div className="relative pt-2 pb-1">
        {/* Average Line Reference */}
        {maxVal > 0 && (
          <div
            className="absolute left-0 right-0 border-b border-dashed border-indigo-400/40 pointer-events-none z-10 flex items-center justify-end"
            style={{
              bottom: `${Math.max(6, Math.min(94, (avgVal / maxVal) * 100))}%`,
            }}
          >
            <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 bg-white dark:bg-[#111827] px-1 -translate-y-2 rounded">
              avg {metric === 'kwh' ? `${Math.round(avgVal)} kWh` : `₱${Math.round(avgVal)}`}
            </span>
          </div>
        )}

        {/* Bars Container */}
        <div className="flex items-end gap-1.5 sm:gap-3 h-52 sm:h-60 overflow-x-auto pb-6 scrollbar-thin">
          {filteredRecords.map((r, idx) => {
            const rawVal = metric === 'kwh' ? r.KW_Statement : r.Bill;
            const heightPct = Math.max(6, (rawVal / maxVal) * 92);
            const isHovered = hoveredIndex === idx;
            const isMax = rawVal === maxVal;
            const isMin = rawVal === minVal && filteredRecords.length > 2;

            return (
              <div
                key={r.CutoffDate}
                className="group relative flex-1 min-w-[42px] sm:min-w-[48px] h-full flex flex-col justify-end items-center cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectRecord(r)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 z-30 bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 p-2.5 rounded-lg shadow-xl text-xs whitespace-nowrap border border-slate-700 min-w-[140px] pointer-events-none">
                    <div className="font-bold text-indigo-400 mb-1 border-b border-slate-700 pb-1">
                      {formatMonthLabel(r.CutoffDate)} ({r.CutoffDate})
                    </div>
                    <div className="flex justify-between gap-3 text-slate-300">
                      <span>Statement:</span>
                      <strong className="text-white tabular-nums">{formatKwh(r.KW_Statement)} kWh</strong>
                    </div>
                    <div className="flex justify-between gap-3 text-slate-300">
                      <span>Rate:</span>
                      <strong className="text-white tabular-nums">
                        ₱{Number(r.RatePerKwh || (r.KW_Statement > 0 ? r.Bill / r.KW_Statement : 0)).toFixed(2)}
                      </strong>
                    </div>
                    <div className="flex justify-between gap-3 text-slate-300">
                      <span>Bill:</span>
                      <strong className="text-white tabular-nums">{formatCurrency(r.Bill)}</strong>
                    </div>
                    <div className="flex justify-between gap-3 text-slate-300">
                      <span>Cycle Days:</span>
                      <strong className="text-white tabular-nums">{r.CycleDays} days</strong>
                    </div>
                    <div className="flex justify-between gap-3 text-slate-300 mt-1 pt-1 border-t border-slate-700 text-[10px] text-indigo-300">
                      Click to view full statement ➔
                    </div>
                  </div>
                )}

                {/* Top Value Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-mono tabular-nums mb-1 transition-colors ${
                    isHovered
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {metric === 'kwh' ? Math.round(rawVal) : `₱${Math.round(rawVal)}`}
                </span>

                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 relative ${
                    isHovered
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 shadow-md scale-y-[1.02]'
                      : isMax
                      ? 'bg-gradient-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-400'
                      : 'bg-gradient-to-t from-indigo-500/80 to-indigo-400/90 dark:from-indigo-600/70 dark:to-indigo-500/80 hover:opacity-100'
                  }`}
                  style={{ height: `${heightPct}%` }}
                >
                  {isMax && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tighter">
                      Peak
                    </span>
                  )}
                </div>

                {/* Bottom Month Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-medium mt-2 whitespace-nowrap transition-colors ${
                    isHovered
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {formatMonthLabel(r.CutoffDate)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
