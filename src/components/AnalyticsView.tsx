import React, { useMemo } from 'react';
import { ACRecord } from '../types';
import { formatCurrency, formatKwh, formatMonthLabel } from '../utils/calculations';
import { TrendingUp, Sun, Snowflake, Zap, DollarSign, Activity, Calendar } from 'lucide-react';

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
      {/* 4 High-level All-Time Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Cumulative Power</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
            {formatKwh(stats.totalKwh)}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">kWh</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Over {sorted.length} recorded cycles
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Total Invoiced</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono">
            {formatCurrency(stats.totalBilled)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Avg {formatCurrency(stats.avgBill)} / cycle
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Total Payments</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
            {formatCurrency(stats.totalPaid)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Net balance: {formatCurrency(stats.totalBilled - stats.totalPaid)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Tariff Rate Change</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums font-mono">
            +{stats.rateInflationPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            From ₱{stats.initialRate.toFixed(2)} to ₱{stats.latestRate.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Seasonal Analysis & Rate Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak vs Lowest Cycles */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Seasonal Extremes</span>
          </h3>
          <div className="space-y-4">
            {/* Peak Summer Record */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                  <Sun className="w-4 h-4" />
                  <span>Peak Summer Consumption</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200">
                  {formatMonthLabel(stats.highestRecord.CutoffDate)}
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-amber-950 dark:text-amber-100 font-mono tabular-nums">
                    {formatKwh(stats.highestRecord.KW_Statement)}
                  </span>{' '}
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">kWh</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-amber-950 dark:text-amber-200 font-mono tabular-nums">
                    {formatCurrency(stats.highestRecord.Bill)}
                  </span>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                    {formatCurrency(stats.highestRecord.AveCost_Day)}/day
                  </div>
                </div>
              </div>
            </div>

            {/* Lowest Winter/Cool Season Record */}
            <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase">
                  <Snowflake className="w-4 h-4" />
                  <span>Lowest Cool Season Consumption</span>
                </span>
                <span className="text-xs font-mono font-bold text-cyan-900 dark:text-cyan-200">
                  {formatMonthLabel(stats.lowestRecord.CutoffDate)}
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-cyan-950 dark:text-cyan-100 font-mono tabular-nums">
                    {formatKwh(stats.lowestRecord.KW_Statement)}
                  </span>{' '}
                  <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">kWh</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-cyan-950 dark:text-cyan-200 font-mono tabular-nums">
                    {formatCurrency(stats.lowestRecord.Bill)}
                  </span>
                  <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono">
                    {formatCurrency(stats.lowestRecord.AveCost_Day)}/day
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tariff Rate Progression Table */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Tariff Rate Progression</span>
          </h3>
          <div className="overflow-x-auto max-h-60 scrollbar-thin">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-400 uppercase">
                  <th className="py-2.5">Effective Cycle</th>
                  <th className="py-2.5 text-right">Rate / kWh</th>
                  <th className="py-2.5 text-right">Cycle Statement</th>
                  <th className="py-2.5 text-right">Bill Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {sorted
                  .filter((r) => r.RatePerKwh !== null && Number(r.RatePerKwh) > 0)
                  .map((r) => (
                    <tr key={r.CutoffDate} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 text-slate-700 dark:text-slate-300 font-sans font-medium">
                        {formatMonthLabel(r.CutoffDate)}
                      </td>
                      <td className="py-2.5 text-right text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                        ₱{Number(r.RatePerKwh).toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatKwh(r.KW_Statement)} kWh
                      </td>
                      <td className="py-2.5 text-right text-slate-900 dark:text-white font-semibold tabular-nums">
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
