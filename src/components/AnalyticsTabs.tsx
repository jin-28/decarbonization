import { useState } from 'react';
import { ChartBar as BarChart3, Table2, Layers } from 'lucide-react';
import type { ExtendedExecutiveKPIs, FrontierStep, OptimalSolution } from '@/lib/decarbonizationEngine';
import type { MacroEconomicContext, PlantBaselineInput } from '@/types/decarbonization';
import { MACCStepChart } from '@/components/MACCStepChart';
import { MACCChartGuide, type HighlightElement } from '@/components/MACCChartGuide';
import { AbsoluteCostRangeMatrix } from '@/components/AbsoluteCostRangeMatrix';
import { LeapfrogCCfDModule } from '@/components/LeapfrogCCfDModule';
import { fmtCurrency } from '@/lib/format';

type TabId = 'macc' | 'financial' | 'policy';

interface AnalyticsTabsProps {
  kpis: ExtendedExecutiveKPIs;
  optimal: OptimalSolution;
  frontierSteps: FrontierStep[];
  macro: MacroEconomicContext;
  plant: PlantBaselineInput;
  highlight: HighlightElement;
  onHighlightChange: (h: HighlightElement) => void;
}

const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'macc', label: '邊際成本 MACC 圖表', icon: BarChart3 },
  { id: 'financial', label: '財務開支與 Range 對照', icon: Table2 },
  { id: 'policy', label: '政策補貼 (CCfD) 與技術淘汰', icon: Layers },
];

export function AnalyticsTabs({
  kpis,
  optimal,
  frontierSteps,
  macro,
  plant,
  highlight,
  onHighlightChange,
}: AnalyticsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('macc');

  return (
    <section className="space-y-4">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-mist-200 bg-white p-1.5 shadow-sm">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === t.id
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-mist-500 hover:bg-mist-50 hover:text-mist-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: MACC Chart */}
      {activeTab === 'macc' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-mist-200 bg-white p-4 shadow-sm lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-mist-700">MACC 階梯圖表</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-mist-500">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-700" /> 最優組合
                </span>
                <span className="flex items-center gap-1.5 text-mist-500">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-300" /> 低於碳價
                </span>
                <span className="flex items-center gap-1.5 text-mist-500">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-mist-300" /> 高於碳價
                </span>
              </div>
            </div>
            <MACCStepChart
              frontierSteps={frontierSteps}
              carbonPrice={macro.carbonPrice}
              optimalAbatement={optimal.optimalAbatement}
              highlight={highlight}
            />
          </div>
          <div className="lg:col-span-2">
            <MACCChartGuide
              frontierSteps={frontierSteps}
              carbonPrice={macro.carbonPrice}
              optimalAbatement={optimal.optimalAbatement}
              kpis={kpis}
              highlight={highlight}
              onHighlightChange={onHighlightChange}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Financial */}
      {activeTab === 'financial' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-mist-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-mist-700">當前最優技術組合</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {kpis.optimalLeverIds.length === 0 ? (
                    <span className="text-sm text-mist-400">未啟用任何減碳技術（維持現狀）</span>
                  ) : (
                    kpis.optimalLeverIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-lg bg-brand-100 px-3 py-1 font-mono text-sm font-semibold text-brand-700"
                      >
                        {id}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-right">
                  <p className="text-xs text-mist-400">邊際成本 MAC</p>
                  <p className="font-mono text-lg font-bold text-mist-800">
                    €{kpis.optimalMAC.toFixed(0)}
                    <span className="text-xs font-normal text-mist-400">/tCO₂</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-mist-400">平均成本 AAC</p>
                  <p className="font-mono text-lg font-bold text-teal-700">
                    €{kpis.aac.toFixed(0)}
                    <span className="text-xs font-normal text-mist-400">/tCO₂</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-mist-400">生命週期現值</p>
                  <p className="font-mono text-lg font-bold text-mist-800">
                    €{fmtCurrency(kpis.lifecycleCost)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3 border-t border-mist-100 pt-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-mist-500">資本支出 CAPEX（折現）</span>
                  <span className="font-mono font-bold text-mist-700">
                    €{fmtCurrency(kpis.totalCapex)} ({kpis.capexShare.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-mist-100">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${kpis.capexShare}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-mist-500">營運支出 OPEX（折現現值）</span>
                  <span className="font-mono font-bold text-mist-700">
                    €{fmtCurrency(kpis.totalPvOpex)} ({kpis.opexShare.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-mist-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${kpis.opexShare}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <AbsoluteCostRangeMatrix
            frontierSteps={frontierSteps}
            plant={plant}
            baseLPC={macro.baseLPC}
          />

          <div className="rounded-xl border border-mist-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-mist-700">成本有效前緣明細</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-mist-50 text-left text-mist-500">
                    <th className="px-3 py-2 font-semibold">技術組合</th>
                    <th className="px-3 py-2 text-right font-semibold">減碳量</th>
                    <th className="px-3 py-2 text-right font-semibold">減碳比例</th>
                    <th className="px-3 py-2 text-right font-semibold">折現支出 DE</th>
                    <th className="px-3 py-2 text-right font-semibold">總減碳成本 TAC</th>
                    <th className="px-3 py-2 text-right font-semibold">邊際成本 MAC</th>
                    <th className="px-3 py-2 text-center font-semibold">狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {frontierSteps.map((step, i) => {
                    const isOptimal =
                      Math.abs(step.totalAbatement - optimal.optimalAbatement) < 0.5;
                    const below = step.marginalAbatementCost <= macro.carbonPrice;
                    return (
                      <tr
                        key={i}
                        className={`border-t border-mist-100 ${
                          isOptimal ? 'bg-brand-50/60' : below ? 'bg-mist-50/60' : ''
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-mist-700">
                          {step.activeLeverIds.join(' + ') || '— 維持現狀 —'}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-mist-600">
                          {step.totalAbatement.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-mist-600">
                          {step.abatementPercentage.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-mist-600">
                          €{(step.totalDiscountedExpenditure / 1e6).toFixed(1)}M
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-mist-600">
                          €{(step.totalAbatementCost / 1e6).toFixed(1)}M
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-mist-700">
                          €{step.marginalAbatementCost.toFixed(0)}/tCO₂
                        </td>
                        <td className="px-3 py-2 text-center">
                          {isOptimal ? (
                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                              最優
                            </span>
                          ) : below ? (
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                              具經濟效益
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              高於碳價
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Policy */}
      {activeTab === 'policy' && (
        <LeapfrogCCfDModule
          kpis={kpis}
          frontierSteps={frontierSteps}
          carbonPrice={macro.carbonPrice}
        />
      )}
    </section>
  );
}
