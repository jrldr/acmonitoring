import React, { useState } from 'react';
import { formatCurrency, formatKwh } from '../utils/calculations';
import { Sliders, Zap, DollarSign, Thermometer, Clock, Sparkles } from 'lucide-react';

interface CostEstimatorProps {
  latestRate: number;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ latestRate }) => {
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [ratedWatts, setRatedWatts] = useState<number>(750); // 1.0 HP standard
  const [isInverter, setIsInverter] = useState<boolean>(true);
  const [tempSetting, setTempSetting] = useState<number>(24);
  const [customRate, setCustomRate] = useState<number>(latestRate > 0 ? latestRate : 15.5);

  // Inverter runs at variable load (average ~55% of rated power in typical insulated room)
  // Non-inverter cycles on/off (average ~80% duty cycle)
  const loadFactor = isInverter ? 0.55 : 0.8;

  // Temperature efficiency: Baseline is 22°C. Each degree higher saves ~6% energy.
  const tempDelta = tempSetting - 22;
  const tempEfficiency = 1 - tempDelta * 0.06;
  const clampedTempEfficiency = Math.max(0.65, Math.min(1.4, tempEfficiency));

  // Power in kW
  const effectivePowerKw = (ratedWatts / 1000) * loadFactor * clampedTempEfficiency;

  // Consumption
  const dailyKwh = effectivePowerKw * hoursPerDay;
  const monthlyKwh = dailyKwh * 30;

  // Costs
  const dailyCost = dailyKwh * customRate;
  const monthlyCost = monthlyKwh * customRate;
  const yearlyCost = monthlyCost * 12;

  // Comparison: What if user uses 2 fewer hours or raises temp by 1°C
  const monthlyKwhSaved2Hours = effectivePowerKw * 2 * 30;
  const monthlySavings2Hours = monthlyKwhSaved2Hours * customRate;

  return (
    <div className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-6 transition-colors shadow-sm">
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            AC Power & Cost Estimator
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Simulate how daily hours, room temperature, and AC capacity impact your monthly electricity bill.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders and Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Daily Usage Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Daily Usage Hours
              </span>
              <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                {hoursPerDay} {hoursPerDay === 1 ? 'Hour' : 'Hours'} / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>1 hr</span>
              <span>8 hrs (Night)</span>
              <span>16 hrs</span>
              <span>24 hrs (Continuous)</span>
            </div>
          </div>

          {/* AC Capacity Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              AC Horsepower / Wattage Rating
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '0.75 HP (560W)', watts: 560 },
                { label: '1.0 HP (750W)', watts: 750 },
                { label: '1.5 HP (1,120W)', watts: 1120 },
                { label: '2.0 HP (1,500W)', watts: 1500 },
              ].map((p) => (
                <button
                  key={p.watts}
                  type="button"
                  onClick={() => setRatedWatts(p.watts)}
                  className={`px-2.5 py-2 text-xs rounded-lg border text-center transition-all ${
                    ratedWatts === p.watts
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inverter Toggle & Temperature Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Inverter Option */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Compressor Type
              </label>
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setIsInverter(true)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    isInverter
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Inverter (Variable)
                </button>
                <button
                  type="button"
                  onClick={() => setIsInverter(false)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    !isInverter
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Non-Inverter (Fixed)
                </button>
              </div>
            </div>

            {/* Target Temperature */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  Thermostat Temp
                </span>
                <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                  {tempSetting}°C
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="28"
                step="1"
                value={tempSetting}
                onChange={(e) => setTempSetting(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>18°C (Max power)</span>
                <span>24°C (Eco balance)</span>
                <span>28°C</span>
              </div>
            </div>
          </div>

          {/* Electricity Rate */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Electricity Tariff Rate (₱ per kWh)
              </span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Current: ₱{customRate.toFixed(2)}/kWh
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              value={customRate}
              onChange={(e) => setCustomRate(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Results Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/30 dark:to-slate-900/60 border border-indigo-100 dark:border-indigo-900/40 p-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Projected AC Bill Impact
            </span>

            {/* Monthly Estimated Bill */}
            <div className="mt-4 pb-4 border-b border-indigo-200/50 dark:border-indigo-900/60">
              <span className="text-xs text-slate-500 dark:text-slate-400">Monthly Cost Estimate (30 days)</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums font-mono mt-1">
                {formatCurrency(monthlyCost)}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Approx. <strong className="font-mono text-slate-700 dark:text-slate-200">{formatKwh(monthlyKwh)} kWh</strong> / month
              </span>
            </div>

            {/* Breakdown */}
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Daily Power Usage:</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatKwh(dailyKwh)} kWh / day
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Daily Cost:</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatCurrency(dailyCost)} / day
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Annualized Cost:</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatCurrency(yearlyCost)} / year
                </span>
              </div>
            </div>
          </div>

          {/* Quick Efficiency Tip */}
          <div className="mt-5 p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimization Insight</span>
            </div>
            <p>
              Turning off AC <strong>2 hours earlier</strong> each day saves approx{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {formatCurrency(monthlySavings2Hours)}
              </strong>{' '}
              every month ({formatKwh(monthlyKwhSaved2Hours)} kWh).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
