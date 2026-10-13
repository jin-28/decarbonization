import { BookOpen, Leaf } from 'lucide-react';
import { plantTemplates } from '@/lib/decarbonizationEngine';

interface AppHeaderProps {
  selectedTemplate: number;
  onTemplateChange: (idx: number) => void;
  onGuideOpen: () => void;
}

export function AppHeader({
  selectedTemplate,
  onTemplateChange,
  onGuideOpen,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-mist-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: title + template selector */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
            <h1 className="whitespace-nowrap text-base font-bold text-mist-800 sm:text-lg">
              企業去碳化財務決策模擬器
            </h1>
            <select
              value={selectedTemplate}
              onChange={(e) => onTemplateChange(parseInt(e.target.value))}
              className="max-w-[220px] truncate rounded-lg border border-mist-200 bg-white px-3 py-1.5 text-sm text-mist-700 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
            >
              {plantTemplates.map((t, i) => (
                <option key={i} value={i}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: guide button */}
        <button
          onClick={onGuideOpen}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">使用說明</span>
        </button>
      </div>
    </header>
  );
}
