import React from 'react';
import { SUBJECT_COLORS, SUBJECTS } from '../utils/constants';

export default function ProgressBar({ topics, copiedStatuses }) {
  // Compute totals dynamically
  const totalCharts = topics.reduce((sum, t) => sum + (t.charts_count || 0), 0);
  const totalWorksheets = topics.reduce((sum, t) => sum + (t.worksheets_count || 0), 0);
  const totalAssets = totalCharts + totalWorksheets;

  const copiedCharts = topics.reduce((sum, t) => {
    let subSum = 0;
    const count = t.charts_count || 0;
    for (let i = 0; i < count; i++) {
      if (copiedStatuses[`${t.id}_chart_${i}`]) {
        subSum++;
      }
    }
    return sum + subSum;
  }, 0);

  const copiedWorksheets = topics.reduce((sum, t) => {
    let subSum = 0;
    const count = t.worksheets_count || 0;
    for (let i = 0; i < count; i++) {
      if (copiedStatuses[`${t.id}_worksheet_${i}`]) {
        subSum++;
      }
    }
    return sum + subSum;
  }, 0);

  const copiedAssets = copiedCharts + copiedWorksheets;
  const overallPercentage = totalAssets > 0 ? Math.round((copiedAssets / totalAssets) * 100) : 0;

  // Compute subject-specific stats
  const subjectStats = SUBJECTS.map(subject => {
    const subTopics = topics.filter(t => t.subject === subject);
    const subTotalCharts = subTopics.reduce((sum, t) => sum + (t.charts_count || 0), 0);
    const subTotalWorksheets = subTopics.reduce((sum, t) => sum + (t.worksheets_count || 0), 0);
    const subTotal = subTotalCharts + subTotalWorksheets;

    const subCopiedCharts = subTopics.reduce((sum, t) => {
      let subSum = 0;
      const count = t.charts_count || 0;
      for (let i = 0; i < count; i++) {
        if (copiedStatuses[`${t.id}_chart_${i}`]) {
          subSum++;
        }
      }
      return sum + subSum;
    }, 0);
    
    const subCopiedWorksheets = subTopics.reduce((sum, t) => {
      let subSum = 0;
      const count = t.worksheets_count || 0;
      for (let i = 0; i < count; i++) {
        if (copiedStatuses[`${t.id}_worksheet_${i}`]) {
          subSum++;
        }
      }
      return sum + subSum;
    }, 0);

    const subCopied = subCopiedCharts + subCopiedWorksheets;
    const subPercentage = subTotal > 0 ? Math.round((subCopied / subTotal) * 100) : 0;

    return {
      name: subject,
      copied: subCopied,
      total: subTotal,
      percentage: subPercentage,
      color: SUBJECT_COLORS[subject]
    };
  });

  return (
    <div className="w-full p-6 mb-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
      {/* Overall Progress Gauge */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        
        {/* Left Metric Card */}
        <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Charts Generated</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{copiedCharts}</span>
            <span className="text-sm text-slate-400">/ {totalCharts}</span>
          </div>
          <div className="w-full h-1.5 mt-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalCharts > 0 ? (copiedCharts / totalCharts) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Middle Metric Card */}
        <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Worksheets Generated</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{copiedWorksheets}</span>
            <span className="text-sm text-slate-400">/ {totalWorksheets}</span>
          </div>
          <div className="w-full h-1.5 mt-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalWorksheets > 0 ? (copiedWorksheets / totalWorksheets) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Right Metric Card */}
        <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Progress</span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-500">{copiedAssets}</span>
              <span className="text-sm text-slate-400">/ {totalAssets}</span>
            </div>
            <span className="text-lg font-bold text-emerald-500">{overallPercentage}%</span>
          </div>
          <div className="w-full h-1.5 mt-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 transition-all duration-500 ease-out"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* Per-Subject Mini Stats Grid */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Progress By Subject</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {subjectStats.map(stat => (
            <div key={stat.name} className="flex flex-col p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/30 bg-slate-50/30 dark:bg-slate-950/10">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate pr-1">
                  {stat.name}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.color.bg} ${stat.color.text}`}>
                  {stat.percentage}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mb-2">
                {stat.copied} / {stat.total} assets
              </span>
              <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    backgroundColor: stat.color.hex, 
                    width: `${stat.percentage}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
