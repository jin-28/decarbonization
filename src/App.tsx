import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type {
  MacroEconomicContext,
  PlantBaselineInput,
} from '@/types/decarbonization';
import {
  defaultMacroContext,
  plantTemplates,
  runFullCalculation,
} from '@/lib/decarbonizationEngine';
import { AppHeader } from '@/components/AppHeader';
import { ExecutiveHero } from '@/components/ExecutiveHero';
import { AnalyticsTabs } from '@/components/AnalyticsTabs';
import { AdvancedSettings } from '@/components/AdvancedSettings';
import { UserGuideModal } from '@/components/UserGuideModal';
import type { HighlightElement } from '@/components/MACCChartGuide';

function App() {
  const [templateIdx, setTemplateIdx] = useState(0);
  const [plant, setPlant] = useState<PlantBaselineInput>(plantTemplates[0].plant);
  const [macro, setMacro] = useState<MacroEconomicContext>(defaultMacroContext);
  const [guideOpen, setGuideOpen] = useState(false);
  const [highlight, setHighlight] = useState<HighlightElement>(null);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const template = plantTemplates[templateIdx];

  const result = useMemo(() => {
    return runFullCalculation({
      plant,
      macro,
      levers: template.levers,
      interactions: template.interactions,
    });
  }, [plant, macro, template]);

  const handleTemplateChange = (idx: number) => {
    setTemplateIdx(idx);
    setPlant(plantTemplates[idx].plant);
  };

  const feasibleCount = result.frontier.allCombinations.filter((c) => c.isFeasible).length;
  const totalCombos = result.frontier.allCombinations.length;

  return (
    <div className="min-h-screen bg-mist-50">
      <AppHeader
        selectedTemplate={templateIdx}
        onTemplateChange={handleTemplateChange}
        onGuideOpen={() => setGuideOpen(true)}
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        {/* Layer 1: Executive Hero */}
        <ExecutiveHero
          kpis={result.extendedKPIs}
          optimal={result.optimal}
          macro={macro}
          plant={plant}
          onCarbonPriceChange={(v) => setMacro({ ...macro, carbonPrice: v })}
        />

        {/* Combo stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-mist-400">
          <span className="rounded-full bg-mist-100 px-3 py-1 font-mono font-medium">
            {feasibleCount}/{totalCombos} 可行組合
          </span>
          <span className="rounded-full bg-mist-100 px-3 py-1 font-mono font-medium">
            {result.frontier.efficientFrontier.length} 個前緣點
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
            {plant.plantName}
          </span>
        </div>

        {/* Layer 2: Tabbed analytics */}
        <AnalyticsTabs
          kpis={result.extendedKPIs}
          optimal={result.optimal}
          frontierSteps={result.frontierSteps}
          macro={macro}
          plant={plant}
          highlight={highlight}
          onHighlightChange={setHighlight}
        />

        {/* Layer 3: Advanced settings */}
        <AdvancedSettings
          plant={plant}
          macro={macro}
          onPlantChange={setPlant}
          onMacroChange={setMacro}
          expanded={advancedExpanded}
          onToggle={setAdvancedExpanded}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-mist-200 bg-white py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 text-xs text-mist-400 sm:px-6">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>
            本計算器基於組合優化模型 (Combinatorial MACC Model)，所有成本均以歐元 (EUR) 計價。
            參數變更時結果即時更新。
          </span>
        </div>
      </footer>

      {/* User Guide Modal */}
      <UserGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}

export default App;
