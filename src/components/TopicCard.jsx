import React from 'react';
import { SUBJECT_COLORS } from '../utils/constants';
import { Check, ClipboardList, FileSpreadsheet, Layers } from 'lucide-react';

export default function TopicCard({
  topic,
  copiedStatuses,
  onPromptSelect
}) {
  const chartsCount = topic.charts_count || 0;
  const worksheetsCount = topic.worksheets_count || 0;

  // Calculate chart progress
  let copiedChartsCount = 0;
  for (let i = 0; i < chartsCount; i++) {
    if (copiedStatuses[`${topic.id}_chart_${i}`]) {
      copiedChartsCount++;
    }
  }
  const isAllChartsCopied = chartsCount > 0 && copiedChartsCount === chartsCount;
  const hasSomeChartsCopied = copiedChartsCount > 0;

  // Calculate worksheet progress
  let copiedWorksheetsCount = 0;
  for (let i = 0; i < worksheetsCount; i++) {
    if (copiedStatuses[`${topic.id}_worksheet_${i}`]) {
      copiedWorksheetsCount++;
    }
  }
  const isAllWorksheetsCopied = worksheetsCount > 0 && copiedWorksheetsCount === worksheetsCount;
  const hasSomeWorksheetsCopied = copiedWorksheetsCount > 0;

  const isBothFullyCopied = isAllChartsCopied && isAllWorksheetsCopied;

  const colorConfig = SUBJECT_COLORS[topic.subject] || {
    hex: '#64748B',
    bg: 'bg-slate-500/10',
    text: 'text-slate-500',
    border: 'border-slate-500/20',
    glow: 'border-l-4 border-l-slate-400'
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:scale-[1.01] ${colorConfig.glow} ${
        isBothFullyCopied
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-500/5'
          : 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/50 hover:shadow-md'
      }`}
    >
      {/* Subject Badge & Priority Month */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}>
          {topic.subject}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {topic.priority}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug mb-2 group-hover:text-indigo-600">
        {topic.topic_name}
      </h3>

      {/* Target Classes & Description */}
      <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">
          Classes: {topic.classes}
        </span>
      </p>

      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
        {topic.description || 'No description provided.'}
      </p>

      {/* Assets Statistics & Status Dot */}
      <div className="flex items-center justify-between py-2 px-3.5 mb-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/30">
        <div className="flex items-center gap-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
            <span>{chartsCount} Charts</span>
          </div>
          <div className="flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
            <span>{worksheetsCount} Sheets</span>
          </div>
        </div>

        {/* Status indicator dot */}
        <div className="flex items-center gap-1.5">
          <span 
            className={`w-2 h-2 rounded-full ${
              topic.status === 'EXISTS' 
                ? 'bg-emerald-500 ring-4 ring-emerald-500/10' 
                : 'bg-amber-500 ring-4 ring-amber-500/10'
            }`} 
          />
          <span className="text-[10px] font-bold text-slate-400 tracking-wider">
            {topic.status}
          </span>
        </div>
      </div>

      {/* Prompt Buttons */}
      <div className="grid grid-cols-2 gap-2">
        
        {/* Chart Prompt Button */}
        <button
          onClick={() => onPromptSelect(topic, 'chart')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 ${
            isAllChartsCopied
              ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : hasSomeChartsCopied
              ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/80 text-slate-700 dark:text-slate-300'
          }`}
        >
          {isAllChartsCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chart ✅ ({chartsCount})</span>
            </>
          ) : hasSomeChartsCopied ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Chart ({copiedChartsCount}/{chartsCount})</span>
            </>
          ) : (
            <>
              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
              <span>Chart ({chartsCount})</span>
            </>
          )}
        </button>

        {/* Worksheet Prompt Button */}
        <button
          onClick={() => onPromptSelect(topic, 'worksheet')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 ${
            isAllWorksheetsCopied
              ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : hasSomeWorksheetsCopied
              ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/80 text-slate-700 dark:text-slate-300'
          }`}
        >
          {isAllWorksheetsCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sheet ✅ ({worksheetsCount})</span>
            </>
          ) : hasSomeWorksheetsCopied ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Sheet ({copiedWorksheetsCount}/{worksheetsCount})</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              <span>Sheet ({worksheetsCount})</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
