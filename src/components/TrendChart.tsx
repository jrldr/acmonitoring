import React, { useState, useMemo } from 'react';
import { ACRecord, TimeRange } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel } from '../utils/calculations';
import { BarChart3, HelpCircle, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

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
  const { maxVal, minVal, avgVal, peakRecord, lowestRecord } = useMemo(() => {
    if (!filteredRecords.length) {
      return { maxVal: 1, minVal: 0, avgVal: 0, peakRecord: null, lowestRecord: null };
    }
    const values = filteredRecords.map((r) => (metric === 'kwh' ? r.KW_Statement : r.Bill));
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
    
    let peak = filteredRecords[0];
    let low = filteredRecords[0];
    filteredRecords.forEach((r) => {
      const v = metric === 'kwh' ? r.KW_Statement : r.Bill;
      const peakV = metric === 'kwh' ? peak.KW_Statement : peak.Bill;
      const lowV = metric === 'kwh' ? low.KW_Statement : low.Bill;
      if (v > peakV) peak = r;
      if (v < lowV) low = r;
    });

    return { maxVal: max, minVal: min, avgVal: avg, peakRecord: peak, lowestRecord: low };
  }, [filteredRecords, metric]);

  // Y-axis grid scale increments
  const yTicks = useMemo(() => {
    const step = maxVal / 4;
    return [maxVal, step * 3, step * 2, step, 0];
  }, [maxVal]);

  if (!records.length) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800/80 p-8 text-center text-slate-500">
        No records available for trend analysis.
      </div>
    );
  }

  const activeRecord = hoveredIndex !== null ? filteredRecords[hoveredIndex] : null;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-6 mb-6 shadow-xs transition-colors">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {metric === 'kwh' ? 'Electricity Consumption History' : 'Billing Amount History'}
            </h2>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-50 leading-relaxed border border-slate-800">
                Click any bar to inspect formula inputs, cycle length, and inherited rate for that period.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Cycle Average: <strong className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">{metric === 'kwh' ? `${formatKwh(avgVal)} kWh` : formatCurrency(avgVal)}</strong></span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Peak: <strong className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">{metric === 'kwh' ? `${formatKwh(maxVal)} kWh` : formatCurrency(maxVal)}</strong></span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="tabular-nums font-mono">{filteredRecords.length} Cycles</span>
          </div>
        </div>

        {/* Metric and Range Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-xl">
            <button
              onClick={() => setMetric('kwh')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                metric === 'kwh'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              kWh
            </button>
            <button
              onClick={() => setMetric('bill')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                metric === 'bill'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bill (₱)
            </button>
          </div>

          {/* Timeframe Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-xl">
            {(['6m', '12m', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all uppercase whitespace-nowrap ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart Visualization with Y-Axis Gridlines */}
      <div className="relative pt-4 pb-2">
        {/* Subtle Horizontal Background Gridlines */}
        <div className="absolute inset-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
          {yTicks.slice(0, 4).map((tick, i) => (
            <div key={i} className="w-full border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 tabular-nums select-none -translate-y-2">
                {metric === 'kwh' ? `${Math.round(tick)} kWh` : `₱${Math.round(tick)}`}
              </span>
            </div>
          ))}
        </div>

        {/* Average Dashed Reference Line */}
        {maxVal > 0 && (
          <div
            className="absolute left-0 right-0 border-b border-dashed border-indigo-400/60 dark:border-indigo-500/60 pointer-events-none z-10 flex items-center justify-end"
            style={{
              bottom: `${Math.max(12, Math.min(92, ((avgVal / maxVal) * 82) + 8))}%`,
            }}
          >
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-white/90 dark:bg-[#101726]/90 px-1.5 py-0.5 rounded -translate-y-2.5 font-semibold">
              avg {metric === 'kwh' ? `${Math.round(avgVal)} kWh` : `₱${Math.round(avgVal)}`}
            </span>
          </div>
        )}

        {/* Bars Container */}
        <div className="relative z-20 flex items-end gap-2 sm:gap-3.5 h-60 sm:h-68 overflow-x-auto pb-8 pt-4 scrollbar-thin px-2">
          {filteredRecords.map((r, idx) => {
            const rawVal = metric === 'kwh' ? r.KW_Statement : r.Bill;
            const heightPct = Math.max(6, (rawVal / maxVal) * 88);
            const isHovered = hoveredIndex === idx;
            const isPeak = rawVal === maxVal;
            const isLowest = rawVal === minVal && filteredRecords.length > 3;

            // Month-over-month delta
            const prevRecord = idx > 0 ? filteredRecords[idx - 1] : null;
            let momDeltaPct: number | null = null;
            if (prevRecord) {
              const prevVal = metric === 'kwh' ? prevRecord.KW_Statement : prevRecord.Bill;
              if (prevVal > 0) {
                momDeltaPct = ((rawVal - prevVal) / prevVal) * 100;
              }
            }

            return (
              <div
                key={r.CutoffDate}
                className="group relative flex-1 min-w-[46px] sm:min-w-[54px] h-full flex flex-col justify-end items-center cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectRecord(r)}
              >
                {/* Floating Tooltip with Full Telemetry Breakdown */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 z-30 bg-slate-900 text-white dark:bg-slate-800/95 dark:text-slate-100 p-3 rounded-xl shadow-2xl text-xs whitespace-nowrap border border-slate-700/80 min-w-[170px] pointer-events-none backdrop-blur-md animate-in fade-in-0 duration-150">
                    <div className="font-bold text-indigo-400 mb-1.5 pb-1 border-b border-slate-700 flex items-center justify-between gap-2">
                      <span>{formatMonthLabel(r.CutoffDate)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{r.CutoffDate}</span>
                    </div>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between gap-3 text-slate-300">
                        <span className="font-sans text-slate-400">Statement:</span>
                        <strong className="text-white tabular-nums">{formatKwh(r.KW_Statement)} kWh</strong>
                      </div>
                      <div className="flex justify-between gap-3 text-slate-300">
                        <span className="font-sans text-slate-400">Rate:</span>
                        <strong className="text-white tabular-nums">
                          ₱{Number(r.RatePerKwh || (r.KW_Statement > 0 ? r.Bill / r.KW_Statement : 0)).toFixed(2)}
                        </strong>
                      </div>
                      <div className="flex justify-between gap-3 text-slate-300">
                        <span className="font-sans text-slate-400">Cycle Bill:</span>
                        <strong className="text-white tabular-nums">{formatCurrency(r.Bill)}</strong>
                      </div>
                      <div className="flex justify-between gap-3 text-slate-300">
                        <span className="font-sans text-slate-400">Cycle Days:</span>
                        <strong className="text-white tabular-nums">{r.CycleDays} days</strong>
                      </div>
                      <div className="flex justify-between gap-3 text-slate-300">
                        <span className="font-sans text-slate-400">Cost/Day:</span>
                        <strong className="text-white tabular-nums">{formatCurrency(r.AveCost_Day)}</strong>
                      </div>
                      {momDeltaPct !== null && (
                        <div className="flex justify-between gap-3 pt-1 border-t border-slate-700/80">
                          <span className="font-sans text-slate-400">MoM Delta:</span>
                          <span
                            className={`font-bold tabular-nums flex items-center gap-0.5 ${
                              momDeltaPct > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {momDeltaPct > 0 ? '+' : ''}
                            {momDeltaPct.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-700 text-[10px] text-indigo-300 font-sans flex items-center justify-between">
                      <span>Click to view breakdown</span>
                      <span>➔</span>
                    </div>
                  </div>
                )}

                {/* Numerical Value Label Above Bar */}
                <span
                  className={`text-[10px] sm:text-[11px] font-mono tabular-nums mb-1.5 transition-all duration-150 ${
                    isHovered
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-110'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {metric === 'kwh' ? Math.round(rawVal) : `₱${Math.round(rawVal)}`}
                </span>

                {/* Elegant Rounded Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all duration-200 relative ${
                    isHovered
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 shadow-md shadow-indigo-500/20 scale-y-[1.02]'
                      : isPeak
                      ? 'bg-gradient-to-t from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-400 shadow-xs'
                      : isLowest
                      ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 dark:from-cyan-700 dark:to-cyan-500 shadow-xs'
                      : 'bg-gradient-to-t from-indigo-500/75 to-indigo-400/90 dark:from-indigo-600/70 dark:to-indigo-500/80 group-hover:from-indigo-600 group-hover:to-indigo-400'
                  }`}
                  style={{ height: `${heightPct}%` }}
                >
                  {isPeak && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                      MAX
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

      {/* Bottom Key Insights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
            Average Consumption
          </span>
          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 tabular-nums">
            {formatKwh(avgVal)} kWh <span className="text-xs text-slate-400 font-normal">/ cycle</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
            Peak Summer Cycle
          </span>
          <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm mt-0.5 tabular-nums">
            {peakRecord ? `${formatMonthLabel(peakRecord.CutoffDate)} · ${formatKwh(peakRecord.KW_Statement)} kWh` : '—'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
            Lowest Cool Season Cycle
          </span>
          <div className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-sm mt-0.5 tabular-nums">
            {lowestRecord ? `${formatMonthLabel(lowestRecord.CutoffDate)} · ${formatKwh(lowestRecord.KW_Statement)} kWh` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
