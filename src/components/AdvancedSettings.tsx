import { ChevronDown, ChevronUp, FileSliders as Sliders } from 'lucide-react';
import type { MacroEconomicContext, PlantBaselineInput } from '@/types/decarbonization';

interface AdvancedSettingsProps {
  plant: PlantBaselineInput;
  macro: MacroEconomicContext;
  onPlantChange: (p: PlantBaselineInput) => void;
  onMacroChange: (m: MacroEconomicContext) => void;
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
}

export function AdvancedSettings({
  plant,
  macro,
  onPlantChange,
  onMacroChange,
  expanded,
  onToggle,
}: AdvancedSettingsProps) {
  return (
    <div className="rounded-xl border border-mist-200 bg-white shadow-sm">
      <button
        onClick={() => onToggle(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-mist-700 transition hover:bg-mist-50"
      >
        <span className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-mist-500" />
          微調廠房與財務背景參數 (WACC / 評估年限 / T&S 運儲費 / 免費碳配額)
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-5 border-t border-mist-100 px-5 py-5 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-mist-500">加權平均資金成本折現率 (WACC, r)</label>
              <span className="font-mono text-sm font-bold text-mist-700">{(plant.r * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.15}
              step={0.005}
              value={plant.r}
              onChange={(e) => onPlantChange({ ...plant, r: parseFloat(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-mist-500">設備評估營運年限 (T)</label>
              <span className="font-mono text-sm font-bold text-mist-700">{plant.T} 年</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={plant.T}
              onChange={(e) => onPlantChange({ ...plant, T: parseInt(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-mist-500">二氧化碳運輸與封存費用 (c_TS)</label>
              <span className="font-mono text-sm font-bold text-mist-700">
                €{macro.c_TS.toFixed(0)}
                <span className="ml-0.5 text-xs font-normal text-mist-400">/tCO₂</span>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={macro.c_TS}
              onChange={(e) => onMacroChange({ ...macro, c_TS: parseFloat(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-mist-500">政府核發之免費碳配額 (A_free)</label>
              <span className="font-mono text-sm font-bold text-mist-700">
                {macro.A_free.toLocaleString()} tCO₂/年
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={plant.E0}
              step={1000}
              value={macro.A_free}
              onChange={(e) => onMacroChange({ ...macro, A_free: parseFloat(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>

          <div className="sm:col-span-2 rounded-lg bg-mist-50 p-3 text-xs text-mist-500">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <span className="text-mist-400">廠房年排放量 E₀</span>
                <p className="mt-0.5 font-mono font-semibold text-mist-700">
                  {plant.E0.toLocaleString()} tCO₂/年
                </p>
              </div>
              <div>
                <span className="text-mist-400">年產量 q</span>
                <p className="mt-0.5 font-mono font-semibold text-mist-700">
                  {plant.q.toLocaleString()} 台/年
                </p>
              </div>
              <div>
                <span className="text-mist-400">基準單位成本 w_base</span>
                <p className="mt-0.5 font-mono font-semibold text-mist-700">
                  €{plant.w_base.toFixed(0)}/台
                </p>
              </div>
              <div>
                <span className="text-mist-400">基準 LPC</span>
                <p className="mt-0.5 font-mono font-semibold text-mist-700">
                  €{macro.baseLPC.toFixed(1)}/台
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
