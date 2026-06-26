import React, { useState, useEffect } from 'react';
import topicsData from './data/topics.json';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Sidebar from './components/Sidebar';
import TopicCard from './components/TopicCard';
import PromptPanel from './components/PromptPanel';
import Modal from './components/Modal';
import Toast from './components/Toast';

import {
  getAllCopiedStatuses,
  setCopiedStatus,
  clearAllCopiedStatuses,
  getPersistedFilters,
  setPersistedFilters,
  getPersistedTheme,
  setPersistedTheme
} from './utils/localStorage';

export default function App() {
  // --- States ---
  const [topics] = useState(topicsData);
  const [copiedStatuses, setCopiedStatuses] = useState({});
  const [theme, setTheme] = useState('dark');
  
  // Active Filter state
  const [filters, setFilters] = useState({
    subject: 'All',
    month: 'All',
    status: 'All',
    search: ''
  });

  // Prompt Panel Drawer states
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activePromptType, setActivePromptType] = useState('chart'); // 'chart' or 'worksheet'

  // Modal & Notification states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // --- Initial Mount Load ---
  useEffect(() => {
    // 1. Load copy progress from localStorage
    const savedStatuses = getAllCopiedStatuses(topicsData);
    setCopiedStatuses(savedStatuses);

    // 2. Load persisted filters
    const savedFilters = getPersistedFilters();
    if (savedFilters) {
      setFilters(savedFilters);
    }

    // 3. Load theme setting
    const savedTheme = getPersistedTheme();
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // --- Filter change listener to persist in local storage ---
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPersistedFilters(newFilters);
  };

  // --- Theme Toggle ---
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setPersistedTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // --- Reset All Handlers ---
  const handleResetProgress = () => {
    const success = clearAllCopiedStatuses();
    if (success) {
      setCopiedStatuses({});
      setIsResetModalOpen(false);
      setToastMessage('Progress has been fully reset! 🔄');
    }
  };

  // --- Copy Trigger handler ---
  const handlePromptCopy = (id, type, index) => {
    // Save to local storage
    setCopiedStatus(id, type, index, true);
    
    // Update local state
    setCopiedStatuses(prev => ({
      ...prev,
      [`${id}_${type}_${index}`]: true
    }));

    // Trigger Toast feedback
    setToastMessage(`Copied ${type.toUpperCase()} #${index + 1} prompt to clipboard! 📋✅`);
  };

  // --- Manual Reset/Untick for single topic asset ---
  const handleResetSingleTick = (id, type, index) => {
    setCopiedStatus(id, type, index, false);
    setCopiedStatuses(prev => ({
      ...prev,
      [`${id}_${type}_${index}`]: false
    }));
    setToastMessage(`Reset status for ${type.toUpperCase()} #${index + 1} prompt! 🔄`);
  };

  // --- Trigger panel view ---
  const handleSelectTopic = (topic, type) => {
    setSelectedTopic(topic);
    setActivePromptType(type);
  };

  // --- Filter logic ---
  const filteredTopics = topics.filter(topic => {
    // Subject filter
    if (filters.subject !== 'All' && topic.subject !== filters.subject) return false;
    // Priority Month filter
    if (filters.month !== 'All' && topic.priority !== filters.month) return false;
    // Status filter
    if (filters.status !== 'All' && topic.status !== filters.status) return false;
    // Search text filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const nameMatch = topic.topic_name.toLowerCase().includes(q);
      const descMatch = (topic.description || '').toLowerCase().includes(q);
      const classMatch = (topic.classes || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !classMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-indigo-500/20">
      
      {/* 1. Header Area */}
      <Header
        onResetClick={() => setIsResetModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-6">
        
        {/* Progress dashboard bar */}
        <ProgressBar
          topics={topics}
          copiedStatuses={copiedStatuses}
        />

        {/* Filters and Grid layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start mt-4">
          
          {/* Left Sidebar Filters */}
          <Sidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            topics={topics}
          />

          {/* Right Topic Cards list */}
          <div className="flex-grow w-full">
            
            {/* Header info bar */}
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Showing {filteredTopics.length} of {topics.length} Topics
              </p>
            </div>

            {filteredTopics.length > 0 ? (
              /* Grid layouts: 1 col mobile, 2 col tablet, 3 col desktop */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTopics.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    copiedStatuses={copiedStatuses}
                    onPromptSelect={handleSelectTopic}
                  />
                ))}
              </div>
            ) : (
              /* Fallback empty view */
              <div className="w-full text-center py-16 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No topics matches your active filter options.
                </p>
                <button
                  onClick={() => handleFilterChange({ subject: 'All', month: 'All', status: 'All', search: '' })}
                  className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* 3. Prompt Preview slide panel */}
      {selectedTopic && (
        <PromptPanel
          topic={selectedTopic}
          activeTab={activePromptType}
          setActiveTab={setActivePromptType}
          onClose={() => setSelectedTopic(null)}
          onCopy={handlePromptCopy}
          onResetTick={handleResetSingleTick}
          copiedStatuses={copiedStatuses}
        />
      )}

      {/* 4. Confirmation Dialog Modal (for resetting progress) */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset All Progress"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed">
            Are you sure you want to clear all copied indicators? This will wipe out all ticks (<span className="text-emerald-500 font-bold">✅</span>) on your cards, and reset the dashboard counters to 0.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResetProgress}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/10 transition-all"
            >
              Yes, Reset Progress
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Feedback Toast notification popup */}
      <Toast
        message={toastMessage || ''}
        isVisible={toastMessage !== null}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}
