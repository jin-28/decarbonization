import { Table2 } from 'lucide-react';
import type { PlantBaselineInput } from '@/types/decarbonization';
import type { FrontierStep } from '@/lib/decarbonizationEngine';
import { calculateCostMetrics } from '@/lib/decarbonizationEngine';
import { fmtCurrency } from '@/lib/format';

interface AbsoluteCostRangeMatrixProps {
  frontierSteps: FrontierStep[];
  plant: PlantBaselineInput;
  baseLPC: number;
}

interface ScenarioRow {
  label: string;
  targetPct: number;
  step: FrontierStep | null;
}

function findClosestStep(steps: FrontierStep[], targetPct: number): FrontierStep | null {
  const feasible = steps.filter((s) => s.totalAbatement > 0);
  if (feasible.length === 0) return null;
  let best: FrontierStep | null = null;
  let minDist = Infinity;
  for (const s of feasible) {
    const dist = Math.abs(s.abatementPercentage - targetPct);
    if (dist < minDist) {
      minDist = dist;
      best = s;
    }
  }
  return best;
}

export function AbsoluteCostRangeMatrix({
  frontierSteps,
  plant,
  baseLPC,
}: AbsoluteCostRangeMatrixProps) {
  const scenarios: ScenarioRow[] = [
    { label: '輕度減碳 (~30%)', targetPct: 30, step: findClosestStep(frontierSteps, 30) },
    { label: '中度減碳 (~70%)', targetPct: 70, step: findClosestStep(frontierSteps, 70) },
    { label: '深層淨零 (~95%)', targetPct: 95, step: findClosestStep(frontierSteps, 95) },
  ];

  const accentColors = [
    'border-l-teal-400',
    'border-l-sky-400',
    'border-l-brand-600',
  ];
  const labelColors = [
    'text-teal-700 bg-teal-50',
    'text-sky-700 bg-sky-50',
    'text-brand-700 bg-brand-50',
  ];

  return (
    <div className="rounded-xl border border-mist-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mist-100 text-mist-600">
          <Table2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-mist-700">絕對成本範圍對照表</h3>
          <p className="text-xs text-mist-400">
            不同減碳目標情境下的邊際成本、平均成本、年化總開支與產品加價一覽
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-mist-50 text-left text-mist-500">
              <th className="px-3 py-2.5 font-semibold">減碳目標情境</th>
              <th className="px-3 py-2.5 text-right font-semibold">實際減碳比例</th>
              <th className="px-3 py-2.5 text-right font-semibold">最高邊際成本 (MAC)</th>
              <th className="px-3 py-2.5 text-right font-semibold">平均減排成本 (AAC)</th>
              <th className="px-3 py-2.5 text-right font-semibold">年化絕對總成本 (TAC)</th>
              <th className="px-3 py-2.5 text-right font-semibold">每台產品絕對加價 (ΔLPC)</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, i) => {
              if (!s.step) {
                return (
                  <tr key={s.label} className={`border-t border-mist-100 border-l-[3px] ${accentColors[i]}`}>
                    <td className="px-3 py-3">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${labelColors[i]}`}>
                        {s.label}
                      </span>
                    </td>
                    <td colSpan={5} className="px-3 py-3 text-center text-xs text-mist-400">
                      目前技術組合無法達到此減碳目標
                    </td>
                  </tr>
                );
              }

              const metrics = calculateCostMetrics(s.step, plant);
              const lpcPct = baseLPC > 0 ? (metrics.deltaLPC / baseLPC) * 100 : 0;
              const isAACLower = metrics.aac < s.step.marginalAbatementCost;

              return (
                <tr
                  key={s.label}
                  className={`border-t border-mist-100 border-l-[3px] ${accentColors[i]} transition hover:bg-mist-50/50`}
                >
                  <td className="px-3 py-3">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${labelColors[i]}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-mist-600">
                    {metrics.abatementPercentage.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-mist-600">
                    €{s.step.marginalAbatementCost.toFixed(0)}/tCO₂
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-mist-700">
                    <span className="font-semibold">€{metrics.aac.toFixed(0)}/tCO₂</span>
                    {isAACLower && (
                      <span className="ml-1 text-[10px] text-teal-600">
                        ↓低於 MAC
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-mist-600">
                    €{fmtCurrency(metrics.annualizedTAC)}/年
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-mist-600">
                    +€{metrics.deltaLPC.toFixed(2)}/台
                    <span className="ml-1 text-[10px] text-mist-400">
                      (+{lpcPct.toFixed(1)}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
        AAC（平均減排成本）= 年化總開支 ÷ 總減碳噸數。因低成本技術拉低平均值，AAC 通常低於 MAC（邊際成本）。
        所有數據隨碳價與運儲費滑桿即時連動更新。
      </p>
    </div>
  );
}
