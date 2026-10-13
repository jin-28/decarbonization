import { TrendingDown, CalendarRange, Coins, Sparkles, TriangleAlert as AlertTriangle } from 'lucide-react';
import type { ExtendedExecutiveKPIs, OptimalSolution } from '@/lib/decarbonizationEngine';
import type { MacroEconomicContext, PlantBaselineInput } from '@/types/decarbonization';
import { fmtCurrency, fmtNumber, fmtPct } from '@/lib/format';

interface ExecutiveHeroProps {
  kpis: ExtendedExecutiveKPIs;
  optimal: OptimalSolution;
  macro: MacroEconomicContext;
  plant: PlantBaselineInput;
  onCarbonPriceChange: (v: number) => void;
}

export function ExecutiveHero({
  kpis,
  optimal,
  macro,
  onCarbonPriceChange,
}: ExecutiveHeroProps) {
  const carbonPrice = macro.carbonPrice;
  const optimalLabel = kpis.optimalLeverIds.length > 0
    ? kpis.optimalLeverIds.join(' + ')
    : '維持現狀';

  const heroCards = [
    {
      label: '最優減碳幅度',
      value: fmtPct(kpis.optimalAbatementPercentage, 1),
      sub: `減 ${fmtNumber(kpis.optimalAbatement)} 噸 CO₂/年`,
      icon: TrendingDown,
      accent: 'border-l-brand-500',
      iconBg: 'bg-brand-50 text-brand-600',
    },
    {
      label: '年度絕對開支',
      value: `€${fmtCurrency(kpis.annualizedTAC)}`,
      sub: '/年（含設備折現與營運）',
      icon: CalendarRange,
      accent: 'border-l-cyan-500',
      iconBg: 'bg-cyan-50 text-cyan-600',
    },
    {
      label: '每台產品加價',
      value: `+€${kpis.greenPremium.toFixed(2)}`,
      sub: `佔基準 LPC ${fmtPct(kpis.greenPremiumPercentage)}`,
      icon: Coins,
      accent: 'border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-600',
    },
  ];

  const isLeapfrog = kpis.isLeapfrogTriggered && carbonPrice >= 141;
  const annualizedTAC = kpis.annualizedTAC;
  const netSavings = kpis.avoidedCarbonTax - annualizedTAC;

  return (
    <section className="space-y-6">
      {/* 3 KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {heroCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={`rounded-xl border border-mist-200 border-l-[4px] ${c.accent} bg-white p-5 shadow-sm transition hover:shadow-md`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-mist-500">{c.label}</span>
              </div>
              <p className="mt-3 font-mono text-3xl font-bold text-mist-800">{c.value}</p>
              <p className="mt-1 text-xs text-mist-400">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Carbon price slider */}
      <div className="rounded-xl border border-mist-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-mist-700">外部碳價模擬 (p)</h3>
            <p className="text-xs text-mist-400">拖曳滑桿即可即時調整碳價，所有數據同步連動</p>
          </div>
          <span className="font-mono text-2xl font-bold text-brand-700">
            €{carbonPrice.toFixed(0)}
            <span className="ml-1 text-sm font-normal text-mist-400">/tCO₂</span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={300}
          step={1}
          value={carbonPrice}
          onChange={(e) => onCarbonPriceChange(parseFloat(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-mist-200 accent-brand-600"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: '€0', value: 0 },
            { label: '€85', value: 85 },
            { label: '€126', value: 126 },
            { label: '€141', value: 141 },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => onCarbonPriceChange(preset.value)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition ${
                Math.abs(carbonPrice - preset.value) < 0.5
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-mist-100 text-mist-600 hover:bg-mist-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy banner */}
      <div
        className={`rounded-xl border p-5 shadow-sm transition-colors duration-300 ${
          isLeapfrog
            ? 'border-rust-200 bg-rust-50'
            : netSavings > 0
              ? 'border-brand-200 bg-brand-50'
              : 'border-mist-200 bg-mist-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isLeapfrog
                ? 'bg-rust-100 text-rust-600'
                : netSavings > 0
                  ? 'bg-brand-100 text-brand-600'
                  : 'bg-mist-200 text-mist-500'
            }`}
          >
            {isLeapfrog ? <AlertTriangle className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-mist-400">
              決策建議 Executive Insight
            </p>
            {isLeapfrog ? (
              <p className="mt-1 text-base leading-relaxed text-rust-700">
                <span className="font-bold">警訊：碳價已達 €{carbonPrice.toFixed(0)}/tCO₂ 臨界值！</span>
                建議避開過渡期技術，直接越級投資「鈣循環 (Calcium Looping)」以獲取長期最大經濟效益。
              </p>
            ) : netSavings > 0 ? (
              <p className="mt-1 text-base leading-relaxed text-mist-700">
                當前碳價 <span className="font-mono font-bold text-brand-700">€{carbonPrice.toFixed(0)}</span> 下，建議採用
                <span className="font-bold text-brand-700">「{optimalLabel}」</span>組合，自發減碳
                <span className="font-mono font-bold text-brand-700"> {fmtPct(kpis.optimalAbatementPercentage, 0)}</span>，
                每年可避開 <span className="font-mono font-bold text-brand-700">€{fmtCurrency(kpis.avoidedCarbonTax)}</span> 碳稅支出，
                相較直接繳稅每年淨省 <span className="font-mono font-bold text-sky-700">€{fmtCurrency(Math.abs(netSavings))}</span>。
              </p>
            ) : (
              <p className="mt-1 text-base leading-relaxed text-mist-600">
                當前碳價 <span className="font-mono font-bold">€{carbonPrice.toFixed(0)}</span> 下，
                自主減碳成本仍高於直接繳稅。建議提高碳價滑桿觀察損益平衡點，或維持現狀等待政策明朗。
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
