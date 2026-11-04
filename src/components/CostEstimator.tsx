import React, { useState } from 'react';
import { formatCurrency, formatKwh } from '../utils/calculations';
import { Sliders, Zap, Thermometer, Clock, Sparkles } from 'lucide-react';

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

  // Comparison: What if user uses 2 fewer hours
  const monthlyKwhSaved2Hours = effectivePowerKw * 2 * 30;
  const monthlySavings2Hours = monthlyKwhSaved2Hours * customRate;

  // Comparison: What if user increases temp by 1°C
  const monthlySavings1Degree = monthlyCost * 0.06;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-7 mb-6 transition-colors shadow-xs">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Power &amp; Billing Cost Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust operating parameters to project your AC electrical consumption and monthly statement impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders and Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Daily Usage Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Daily Operating Hours</span>
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
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
              <span>1 hr</span>
              <span>8 hrs (Night Sleep)</span>
              <span>16 hrs</span>
              <span>24 hrs (Full Continuous)</span>
            </div>
          </div>

          {/* AC Capacity Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Compressor Capacity Rating
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  className={`px-3 py-2 text-xs rounded-xl border text-center transition-all ${
                    ratedWatts === p.watts
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inverter Toggle & Temperature Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Inverter Option */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Compressor Technology
              </label>
              <div className="flex rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 p-1">
                <button
                  type="button"
                  onClick={() => setIsInverter(true)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isInverter
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Inverter (Variable)
                </button>
                <button
                  type="button"
                  onClick={() => setIsInverter(false)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    !isInverter
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Non-Inverter (Fixed)
                </button>
              </div>
            </div>

            {/* Target Temperature */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>Thermostat Setting</span>
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
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>18°C (High draw)</span>
                <span>24°C (Eco balance)</span>
                <span>28°C</span>
              </div>
            </div>
          </div>

          {/* Electricity Tariff Rate */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Electricity Tariff Rate (₱ per kWh)</span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Current cycle baseline: ₱{customRate.toFixed(2)}/kWh
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              value={customRate}
              onChange={(e) => setCustomRate(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Results Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-900/60 dark:to-[#101726] border border-indigo-100/90 dark:border-slate-800 p-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Projected Statement Impact</span>
            </span>

            {/* Monthly Estimated Bill */}
            <div className="mt-4 pb-5 border-b border-indigo-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Monthly Projected Cost (30-day cycle)</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono mt-1">
                {formatCurrency(monthlyCost)}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Estimated consumption: <strong className="font-mono text-slate-700 dark:text-slate-200">{formatKwh(monthlyKwh)} kWh</strong>
              </span>
            </div>

            {/* Detailed Cost Breakdown */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Daily Power Usage:</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatKwh(dailyKwh)} kWh / day
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Daily Running Cost:</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatCurrency(dailyCost)} / day
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Annualized Total (12 cycles):</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatCurrency(yearlyCost)} / year
                </span>
              </div>
            </div>
          </div>

          {/* Efficiency Insight Callout */}
          <div className="mt-6 p-4 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Energy Saving Optimization</span>
            </div>
            <p className="leading-relaxed">
              Shutting off the AC <strong>2 hours earlier</strong> each day reduces your statement by approx{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {formatCurrency(monthlySavings2Hours)}
              </strong>{' '}
              per month ({formatKwh(monthlyKwhSaved2Hours)} kWh saved).
            </p>
            <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
              Increasing thermostat from 22°C to 24°C saves an additional ~{formatCurrency(monthlySavings1Degree * 2)} monthly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
