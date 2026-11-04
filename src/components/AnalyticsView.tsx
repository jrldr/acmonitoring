import React, { useMemo } from 'react';
import { ACRecord } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel } from '../utils/calculations';
import { TrendingUp, Sun, Snowflake, Zap, DollarSign, Activity } from 'lucide-react';

interface AnalyticsViewProps {
  records: ACRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records }) => {
  const sorted = useMemo(() => {
    return [...records].sort(
      (a, b) => new Date(a.CutoffDate).getTime() - new Date(b.CutoffDate).getTime()
    );
  }, [records]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!sorted.length) return null;

    const totalKwh = sorted.reduce((sum, r) => sum + r.KW_Statement, 0);
    const totalBilled = sorted.reduce((sum, r) => sum + r.Bill, 0);
    const totalPaid = sorted.reduce((sum, r) => sum + r.Payment, 0);
    const avgBill = totalBilled / sorted.length;
    const avgKwh = totalKwh / sorted.length;

    // Highest and lowest
    let highestRecord = sorted[0];
    let lowestRecord = sorted[0];

    // Filter out zero-bill initial records for lowest calculation
    const nonZeroRecords = sorted.filter((r) => r.Bill > 0);
    if (nonZeroRecords.length > 0) {
      lowestRecord = nonZeroRecords[0];
      nonZeroRecords.forEach((r) => {
        if (r.Bill < lowestRecord.Bill) lowestRecord = r;
      });
    }

    sorted.forEach((r) => {
      if (r.Bill > highestRecord.Bill) highestRecord = r;
    });

    // Rate progression
    const validRateRecords = sorted.filter(
      (r) => r.RatePerKwh !== null && Number(r.RatePerKwh) > 0
    );
    const initialRate = validRateRecords.length > 0 ? Number(validRateRecords[0].RatePerKwh) : 0;
    const latestRate =
      validRateRecords.length > 0
        ? Number(validRateRecords[validRateRecords.length - 1].RatePerKwh)
        : 0;
    const rateInflationPct = initialRate > 0 ? ((latestRate - initialRate) / initialRate) * 100 : 0;

    return {
      totalKwh,
      totalBilled,
      totalPaid,
      avgBill,
      avgKwh,
      highestRecord,
      lowestRecord,
      initialRate,
      latestRate,
      rateInflationPct,
    };
  }, [sorted]);

  if (!stats) return null;

  return (
    <div className="space-y-6 mb-6">
      {/* High-level All-Time Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Power Consumed</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatKwh(stats.totalKwh)} <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Over {sorted.length} recorded billing cycles
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Amount Billed</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(stats.totalBilled)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Avg {formatCurrency(stats.avgBill)} per cycle
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Payments Made</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(stats.totalPaid)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Difference: {formatCurrency(stats.totalBilled - stats.totalPaid)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Rate Inflation</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
            +{stats.rateInflationPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            From ₱{stats.initialRate.toFixed(2)} to ₱{stats.latestRate.toFixed(2)}/kWh
          </div>
        </div>
      </div>

      {/* Seasonal Analysis & Rate Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak vs Lowest Cycles */}
        <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Seasonal Extremes
          </h3>
          <div className="space-y-4">
            {/* Peak Summer Record */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                  <Sun className="w-4 h-4" />
                  Highest Consumption Peak
                </span>
                <span className="text-xs font-mono font-semibold text-amber-900 dark:text-amber-200">
                  {formatMonthLabel(stats.highestRecord.CutoffDate)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-amber-900 dark:text-amber-100 font-mono tabular-nums">
                    {formatKwh(stats.highestRecord.KW_Statement)}
                  </span>{' '}
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">kWh</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-amber-900 dark:text-amber-200 font-mono tabular-nums">
                    {formatCurrency(stats.highestRecord.Bill)}
                  </span>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400">
                    {formatCurrency(stats.highestRecord.AveCost_Day)}/day
                  </div>
                </div>
              </div>
            </div>

            {/* Lowest Winter/Cool Season Record */}
            <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase">
                  <Snowflake className="w-4 h-4" />
                  Lowest Consumption Cycle
                </span>
                <span className="text-xs font-mono font-semibold text-cyan-900 dark:text-cyan-200">
                  {formatMonthLabel(stats.lowestRecord.CutoffDate)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-cyan-900 dark:text-cyan-100 font-mono tabular-nums">
                    {formatKwh(stats.lowestRecord.KW_Statement)}
                  </span>{' '}
                  <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">kWh</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-cyan-900 dark:text-cyan-200 font-mono tabular-nums">
                    {formatCurrency(stats.lowestRecord.Bill)}
                  </span>
                  <div className="text-[10px] text-cyan-700 dark:text-cyan-400">
                    {formatCurrency(stats.lowestRecord.AveCost_Day)}/day
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tariff Rate Progression Table */}
        <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Tariff Rate Progression
          </h3>
          <div className="overflow-x-auto max-h-56 scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase">
                  <th className="py-2">Effective Period</th>
                  <th className="py-2 text-right">Rate / kWh</th>
                  <th className="py-2 text-right">Bill Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {sorted
                  .filter((r) => r.RatePerKwh !== null && Number(r.RatePerKwh) > 0)
                  .map((r) => (
                    <tr key={r.CutoffDate} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 text-slate-700 dark:text-slate-300 font-sans">
                        {formatMonthLabel(r.CutoffDate)}
                      </td>
                      <td className="py-2 text-right text-slate-900 dark:text-white font-bold">
                        ₱{Number(r.RatePerKwh).toFixed(2)}
                      </td>
                      <td className="py-2 text-right text-slate-500 dark:text-slate-400">
                        {formatCurrency(r.Bill)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
