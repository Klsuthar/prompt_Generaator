import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500">
        <CheckCircle className="w-4 h-4" />
      </div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {message}
      </p>
    </div>
  );
}
