import React, { useState, useEffect } from 'react';
import { X, Copy, Check, RefreshCw, Info, CheckCircle2 } from 'lucide-react';
import { generatePrompt, getIndividualClasses } from '../utils/promptGenerator';
import { SUBJECT_COLORS } from '../utils/constants';

// Clean JSON syntax highlighting function
function syntaxHighlightJson(jsonObj) {
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  let escaped = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  return escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
    let cls = 'text-amber-600 dark:text-amber-500'; // number
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-indigo-600 dark:text-indigo-400 font-semibold'; // key
      } else {
        cls = 'text-emerald-600 dark:text-emerald-400'; // string
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-violet-600 dark:text-violet-500'; // boolean
    } else if (/null/.test(match)) {
      cls = 'text-rose-600 dark:text-rose-500'; // null
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

export default function PromptPanel({
  topic,
  activeTab,
  setActiveTab,
  onClose,
  onCopy,
  onResetTick,
  copiedStatuses
}) {
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const [isFilenameCopied, setIsFilenameCopied] = useState(false);

  // Reset asset index when topic or type changes
  useEffect(() => {
    setSelectedAssetIndex(0);
  }, [topic, activeTab]);

  // Set keyboard shortcuts (must run unconditionally at the top of the component)
  useEffect(() => {
    if (!topic) return;

    const handleKeyDown = (e) => {
      // Esc key closes panel
      if (e.key === 'Escape') {
        onClose();
      }
      // C key copies current prompt (if not inside an input field)
      if (
        (e.key === 'c' || e.key === 'C') &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'SELECT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        const currentPromptObj = generatePrompt(topic, activeTab, selectedAssetIndex);
        const jsonStr = JSON.stringify(currentPromptObj, null, 2);
        navigator.clipboard.writeText(jsonStr)
          .then(() => {
            onCopy(topic.id, activeTab, selectedAssetIndex);
          })
          .catch((err) => console.error('Failed to copy text', err));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topic, activeTab, selectedAssetIndex, onClose, onCopy]);

  if (!topic) return null;

  const classesList = getIndividualClasses(topic.classes);
  const assetsCount = activeTab === 'chart' ? (topic.charts_count || 0) : (topic.worksheets_count || 0);

  const currentPromptObj = generatePrompt(topic, activeTab, selectedAssetIndex);
  const highlightedHtml = syntaxHighlightJson(currentPromptObj);
  const isCopied = copiedStatuses[`${topic.id}_${activeTab}_${selectedAssetIndex}`];

  const handleCopyPrompt = () => {
    const jsonStr = JSON.stringify(currentPromptObj, null, 2);
    navigator.clipboard.writeText(jsonStr)
      .then(() => {
        onCopy(topic.id, activeTab, selectedAssetIndex);
      })
      .catch((err) => console.error('Failed to copy text', err));
  };

  const handleCopyFilename = () => {
    navigator.clipboard.writeText(currentPromptObj.filename)
      .then(() => {
        setIsFilenameCopied(true);
        setTimeout(() => setIsFilenameCopied(false), 1500);
      })
      .catch((err) => console.error('Failed to copy filename', err));
  };

  const colorConfig = SUBJECT_COLORS[topic.subject] || { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' };

  return (
    <>
      {/* Background Dimmer Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity no-print"
        onClick={onClose}
      />

      {/* Slide-out Panel container */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:max-w-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300 animate-in slide-in-from-right duration-200">
        
        {/* Printable Only Content (Hides on screen, shows on print) */}
        <div className="hidden print-only p-8 text-black bg-white">
          <h1 className="text-xl font-bold border-b pb-2 mb-4">VidyaFrame Prompt: {currentPromptObj.topic} (Asset #{selectedAssetIndex + 1})</h1>
          <div className="mb-4 text-sm grid grid-cols-2 gap-2 bg-slate-100 p-3 rounded">
            <div><strong>Subject:</strong> {topic.subject}</div>
            <div><strong>Target Class:</strong> {currentPromptObj.assigned_class}</div>
            <div><strong>Filename:</strong> {currentPromptObj.filename}</div>
            <div><strong>Asset Type:</strong> {activeTab}</div>
            <div className="col-span-2"><strong>Focus Concept:</strong> {currentPromptObj.focus_item}</div>
          </div>
          <pre className="text-xs whitespace-pre-wrap font-mono bg-white p-4 border rounded">
            {JSON.stringify(currentPromptObj, null, 2)}
          </pre>
        </div>

        {/* Panel Header */}
        <div className="p-6 border-b border-slate-200/60 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/20 no-print flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}>
                  {topic.subject}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {topic.priority}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white leading-tight">
                {topic.topic_name}
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metadata Strip */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
            <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate pr-1">
              Range: <strong className="text-slate-700 dark:text-slate-200">{topic.classes}</strong> (Parsed to {classesList.length} classes)
            </span>
          </div>

          {/* Prompt Tabs (Chart vs Worksheet) */}
          <div className="flex gap-1.5 mt-5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-855">
            <button
              onClick={() => setActiveTab('chart')}
              className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all ${
                activeTab === 'chart'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Chart Prompts ({topic.charts_count})
            </button>
            <button
              onClick={() => setActiveTab('worksheet')}
              className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all ${
                activeTab === 'worksheet'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Worksheet Prompts ({topic.worksheets_count})
            </button>
          </div>

          {/* Horizontal Scrollable Sub-Tabs for individual assets */}
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {Array.from({ length: assetsCount }).map((_, i) => {
              const assignedClass = classesList[i % classesList.length];
              const isAssetCopied = copiedStatuses[`${topic.id}_${activeTab}_${i}`];
              const isSelected = selectedAssetIndex === i;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedAssetIndex(i)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-550 dark:text-indigo-300 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{activeTab === 'chart' ? 'Chart' : 'Sheet'} {i + 1} ({assignedClass})</span>
                  {isAssetCopied && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />}
                </button>
              );
            })}
          </div>

        </div>

        {/* Prompt Code Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/40 no-print flex flex-col gap-4">
          
          {/* Filename display bar */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Filename Format: class-subject-topic-type-number</span>
              <code className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">
                {currentPromptObj.filename}
              </code>
            </div>
            
            <button
              onClick={handleCopyFilename}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex-shrink-0 ${
                isFilenameCopied
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {isFilenameCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Name</span>
                </>
              )}
            </button>
          </div>

          {/* JSON Display Area */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/80 p-5 shadow-inner flex-1 flex flex-col overflow-hidden">
            <div className="absolute right-4 top-4 flex gap-1.5 z-10">
              {/* Copy Prompt Button */}
              <button
                onClick={handleCopyPrompt}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isCopied
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400'
                }`}
                title="Copy JSON Prompt"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <pre className="font-mono text-xs overflow-y-auto whitespace-pre leading-relaxed select-text pr-10 flex-1 scrollbar-thin">
              <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            </pre>
          </div>
          
          <p className="text-[10px] text-slate-400 italic flex items-center gap-1.5 px-1.5 flex-shrink-0">
            <span>💡 Keyboard Shortcuts: Press <strong className="font-semibold text-indigo-500">C</strong> to Copy, <strong className="font-semibold text-indigo-500">Esc</strong> to Close.</span>
          </p>
        </div>

        {/* Panel Footer / Actions */}
        {isCopied && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-850 flex items-center justify-end bg-white dark:bg-slate-950 no-print flex-shrink-0">
            <button
              onClick={() => onResetTick(topic.id, activeTab, selectedAssetIndex)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Checkmark</span>
            </button>
          </div>
        )}

      </div>
    </>
  );
}
