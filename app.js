import { generatePrompt, getIndividualClasses } from './promptGenerator.js';

// --- Constants & Color Configs ---
const SUBJECTS = ['Mathematics', 'English', 'EVS', 'Science', 'Hindi', 'Drawing'];

const SUBJECT_COLORS = {
  'Mathematics': {
    hex: '#3B82F6',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20 dark:border-blue-500/30',
    hover: 'hover:bg-blue-500/20 dark:hover:bg-blue-500/30',
    active: 'bg-blue-500 text-white dark:bg-blue-500 dark:text-white',
    glow: 'shadow-blue-500/10 dark:shadow-blue-500/20 border-l-4 border-l-blue-500'
  },
  'English': {
    hex: '#8B5CF6',
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20 dark:border-violet-500/30',
    hover: 'hover:bg-violet-500/20 dark:hover:bg-violet-500/30',
    active: 'bg-violet-500 text-white dark:bg-violet-500 dark:text-white',
    glow: 'shadow-violet-500/10 dark:shadow-violet-500/20 border-l-4 border-l-violet-500'
  },
  'EVS': {
    hex: '#10B981',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
    hover: 'hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30',
    active: 'bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white',
    glow: 'shadow-emerald-500/10 dark:shadow-emerald-500/20 border-l-4 border-l-emerald-500'
  },
  'Science': {
    hex: '#14B8A6',
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/20 dark:border-teal-500/30',
    hover: 'hover:bg-teal-500/20 dark:hover:bg-teal-500/30',
    active: 'bg-teal-500 text-white dark:bg-teal-500 dark:text-white',
    glow: 'shadow-teal-500/10 dark:shadow-teal-500/20 border-l-4 border-l-teal-500'
  },
  'Hindi': {
    hex: '#F59E0B',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20 dark:border-amber-500/30',
    hover: 'hover:bg-amber-500/20 dark:hover:bg-amber-500/30',
    active: 'bg-amber-500 text-white dark:bg-amber-500 dark:text-white',
    glow: 'shadow-amber-500/10 dark:shadow-amber-500/20 border-l-4 border-l-amber-500'
  },
  'Drawing': {
    hex: '#EC4899',
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/20 dark:border-pink-500/30',
    hover: 'hover:bg-pink-500/20 dark:hover:bg-pink-500/30',
    active: 'bg-pink-500 text-white dark:bg-pink-500 dark:text-white',
    glow: 'shadow-pink-500/10 dark:shadow-pink-500/20 border-l-4 border-l-pink-500'
  }
};

const COPIED_PREFIX = 'vidyaframe_copied_';
const FILTERS_KEY = 'vidyaframe_persisted_filters';
const THEME_KEY = 'vidyaframe_theme';

// --- Local Storage Helpers ---
function getCopiedStatus(id, type, index) {
  return localStorage.getItem(`${COPIED_PREFIX}${id}_${type}_${index}`) === 'true';
}

function setCopiedStatus(id, type, index, value) {
  if (value) {
    localStorage.setItem(`${COPIED_PREFIX}${id}_${type}_${index}`, 'true');
  } else {
    localStorage.removeItem(`${COPIED_PREFIX}${id}_${type}_${index}`);
  }
}

function clearAllCopiedStatuses() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(COPIED_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// --- Syntax Highlighting helper ---
function syntaxHighlightJson(jsonObj) {
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  let escaped = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
    let cls = 'text-amber-650 dark:text-amber-500';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-indigo-650 dark:text-indigo-400 font-semibold';
      } else {
        cls = 'text-emerald-650 dark:text-emerald-400';
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-violet-650 dark:text-violet-500';
    } else if (/null/.test(match)) {
      cls = 'text-rose-650 dark:text-rose-500';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

// --- Application State ---
let topics = [];
let theme = 'dark';
let filters = {
  subject: 'All',
  month: 'All',
  status: 'All',
  search: ''
};
let selectedTopic = null;
let activePromptType = 'chart'; // 'chart' or 'worksheet'
let selectedAssetIndex = 0;

// --- Initialize DOM Nodes ---
const headerNode = document.getElementById('app-header');
const dashboardNode = document.getElementById('app-dashboard');
const sidebarNode = document.getElementById('app-sidebar');
const gridInfoNode = document.getElementById('grid-info-bar');
const gridNode = document.getElementById('app-grid');
const panelNode = document.getElementById('app-panel');
const toastNode = document.getElementById('app-toast');
const resetModalNode = document.getElementById('reset-modal');

// --- Load Initial Configs ---
async function initApp() {
  try {
    // 1. Fetch Topics JSON
    const res = await fetch('src/data/topics.json');
    topics = await res.json();

    // 2. Load Persisted Filters
    const savedFilters = localStorage.getItem(FILTERS_KEY);
    if (savedFilters) {
      filters = JSON.parse(savedFilters);
    }

    // 3. Load Theme
    theme = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme();

    // 4. Register Global Keyboard Listener
    window.addEventListener('keydown', handleGlobalKeydown);

    // 5. Initial Render
    renderAll();
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

// --- Apply Dark/Light theme ---
function applyTheme() {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem(THEME_KEY, theme);
}

// --- Global keyboard shortcut listener ---
function handleGlobalKeydown(e) {
  if (!selectedTopic) return;

  if (e.key === 'Escape') {
    closePromptPanel();
  }
  
  if (
    (e.key === 'c' || e.key === 'C') &&
    document.activeElement.tagName !== 'INPUT' &&
    document.activeElement.tagName !== 'SELECT' &&
    document.activeElement.tagName !== 'TEXTAREA'
  ) {
    e.preventDefault();
    copyCurrentPrompt();
  }
}

// --- Render Coordinator ---
function renderAll() {
  renderHeader();
  renderDashboard();
  renderSidebar();
  renderTopicGrid();
  renderPromptPanel();
}

// --- Render Header ---
function renderHeader() {
  headerNode.innerHTML = `
    <div class="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-indigo-500/20 text-white animate-pulse">
          <i data-lucide="sparkles" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            VidyaFrame Prompt Studio
          </h1>
          <p class="text-xs font-semibold text-slate-400">
            Curriculum Chart & Worksheet AI Generator
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 self-end sm:self-center">
        <button id="theme-toggle-btn" class="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all duration-200">
          <i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>
        </button>
        <button id="reset-all-btn" class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium text-sm transition-all duration-200">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
          <span>Reset All Progress</span>
        </button>
      </div>
    </div>
  `;

  // Bind Header Events
  document.getElementById('theme-toggle-btn').onclick = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    renderHeader();
  };
  
  document.getElementById('reset-all-btn').onclick = () => {
    resetModalNode.classList.remove('hidden');
    resetModalNode.classList.add('flex');
  };

  lucide.createIcons();
}

// --- Render Dashboard ---
function renderDashboard() {
  const totalCharts = topics.reduce((sum, t) => sum + (t.charts_count || 0), 0);
  const totalWorksheets = topics.reduce((sum, t) => sum + (t.worksheets_count || 0), 0);
  const totalAssets = totalCharts + totalWorksheets;

  let copiedCharts = 0;
  let copiedWorksheets = 0;

  topics.forEach(t => {
    for (let i = 0; i < t.charts_count; i++) {
      if (getCopiedStatus(t.id, 'chart', i)) copiedCharts++;
    }
    for (let i = 0; i < t.worksheets_count; i++) {
      if (getCopiedStatus(t.id, 'worksheet', i)) copiedWorksheets++;
    }
  });

  const copiedAssets = copiedCharts + copiedWorksheets;
  const overallPercentage = totalAssets > 0 ? Math.round((copiedAssets / totalAssets) * 100) : 0;

  // Build subject-specific progress HTML
  const subjectStatsHtml = SUBJECTS.map(subject => {
    const subTopics = topics.filter(t => t.subject === subject);
    const subTotalCharts = subTopics.reduce((sum, t) => sum + (t.charts_count || 0), 0);
    const subTotalWorksheets = subTopics.reduce((sum, t) => sum + (t.worksheets_count || 0), 0);
    const subTotal = subTotalCharts + subTotalWorksheets;

    let subCopied = 0;
    subTopics.forEach(t => {
      for (let i = 0; i < t.charts_count; i++) {
        if (getCopiedStatus(t.id, 'chart', i)) subCopied++;
      }
      for (let i = 0; i < t.worksheets_count; i++) {
        if (getCopiedStatus(t.id, 'worksheet', i)) subCopied++;
      }
    });

    const subPercentage = subTotal > 0 ? Math.round((subCopied / subTotal) * 100) : 0;
    const color = SUBJECT_COLORS[subject];

    return `
      <div class="flex flex-col p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/30 bg-slate-50/30 dark:bg-slate-955/10">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate pr-1">${subject}</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color.bg} ${color.text}">${subPercentage}%</span>
        </div>
        <span class="text-[10px] text-slate-400 mb-2">${subCopied} / ${subTotal} assets</span>
        <div class="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500 ease-out" style="background-color: ${color.hex}; width: ${subPercentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  dashboardNode.innerHTML = `
    <div class="w-full p-6 mb-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <div class="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Charts Generated</span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">${copiedCharts}</span>
            <span class="text-sm text-slate-400">/ {totalCharts}</span>
          </div>
          <div class="w-full h-1.5 mt-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full transition-all duration-500" style="width: ${totalCharts > 0 ? (copiedCharts / totalCharts) * 100 : 0}%"></div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Worksheets Generated</span>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">${copiedWorksheets}</span>
            <span class="text-sm text-slate-400">/ ${totalWorksheets}</span>
          </div>
          <div class="w-full h-1.5 mt-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div class="h-full bg-purple-500 rounded-full transition-all duration-500" style="width: ${totalWorksheets > 0 ? (copiedWorksheets / totalWorksheets) * 100 : 0}%"></div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/40">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Progress</span>
          <div class="flex items-baseline justify-between mt-1">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-emerald-500">${copiedAssets}</span>
              <span class="text-sm text-slate-400">/ ${totalAssets}</span>
            </div>
            <span class="text-lg font-bold text-emerald-500">${overallPercentage}%</span>
          </div>
          <div class="w-full h-1.5 mt-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
            <div class="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 transition-all duration-500" style="width: ${overallPercentage}%"></div>
          </div>
        </div>
      </div>
      <div>
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Progress By Subject</h4>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          ${subjectStatsHtml}
        </div>
      </div>
    </div>
  `;
}

// --- Render Sidebar ---
function renderSidebar() {
  const getSubjectCount = (sub) => {
    if (sub === 'All') return topics.length;
    return topics.filter(t => t.subject === sub).length;
  };

  const hasFilters = filters.subject !== 'All' || filters.month !== 'All' || filters.status !== 'All' || filters.search !== '';

  const subjectTabsHtml = ['All', ...SUBJECTS].map(sub => {
    const isSelected = filters.subject === sub;
    const color = SUBJECT_COLORS[sub] || { active: 'bg-indigo-600 text-white dark:bg-indigo-500', hover: 'hover:bg-slate-100 dark:hover:bg-slate-800' };
    return `
      <button 
        data-subject="${sub}"
        class="subject-tab-btn flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
          isSelected
            ? `${color.active} border-transparent shadow-md`
            : `border-slate-200/50 dark:border-slate-800/50 ${color.hover} text-slate-600 dark:text-slate-400`
        }"
      >
        <span>${sub === 'All' ? 'All Subjects' : sub}</span>
        <span class="text-xs px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}">${getSubjectCount(sub)}</span>
      </button>
    `;
  }).join('');

  const sidebarHtml = `
    <div class="space-y-6">
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Search Topics</label>
        <div class="relative">
          <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
          <input
            id="search-input"
            type="text"
            placeholder="Type topic name..."
            value="${filters.search}"
            class="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-sm transition-colors text-slate-800 dark:text-slate-100"
          />
          ${filters.search ? `
            <button id="search-clear-btn" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Subjects</label>
        <div class="flex flex-col gap-1.5">
          ${subjectTabsHtml}
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Priority Month</label>
        <div class="relative">
          <select id="month-select" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-sm transition-colors text-slate-800 dark:text-slate-100 appearance-none cursor-pointer">
            <option value="All" ${filters.month === 'All' ? 'selected' : ''}>All Months</option>
            <option value="Month 1" ${filters.month === 'Month 1' ? 'selected' : ''}>Month 1</option>
            <option value="Month 2" ${filters.month === 'Month 2' ? 'selected' : ''}>Month 2</option>
            <option value="Month 3" ${filters.month === 'Month 3' ? 'selected' : ''}>Month 3</option>
            <option value="Month 4" ${filters.month === 'Month 4' ? 'selected' : ''}>Month 4</option>
          </select>
          <i data-lucide="chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"></i>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Production Status</label>
        <div class="relative">
          <select id="status-select" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-sm transition-colors text-slate-800 dark:text-slate-100 appearance-none cursor-pointer">
            <option value="All" ${filters.status === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="EXISTS" ${filters.status === 'EXISTS' ? 'selected' : ''}>EXISTS</option>
            <option value="TO CREATE" ${filters.status === 'TO CREATE' ? 'selected' : ''}>TO CREATE</option>
          </select>
          <i data-lucide="chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"></i>
        </div>
      </div>

      ${hasFilters ? `
        <button id="clear-filters-btn" class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white text-slate-500 dark:text-slate-400 font-medium text-xs transition-colors">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
          <span>Clear Filters</span>
        </button>
      ` : ''}
    </div>
  `;

  // Write sidebar to desktop container
  const desktopSidebar = document.getElementById('desktop-sidebar');
  desktopSidebar.innerHTML = sidebarHtml;

  // Render mobile accordion wrapper
  sidebarNode.innerHTML = `
    <button id="mobile-filter-toggle" class="flex items-center justify-between w-full p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
      <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <i data-lucide="filter" class="w-4 h-4"></i>
        <span class="text-sm font-semibold">Filters & Search</span>
        ${hasFilters ? '<span class="w-2 h-2 rounded-full bg-indigo-650 dark:bg-indigo-400 animate-ping"></span>' : ''}
      </div>
      <i id="mobile-accordion-chevron" data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-200"></i>
    </button>
    <div id="mobile-filter-drawer" class="hidden mt-2 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-lg animate-in slide-in-from-top-2 duration-150">
      ${sidebarHtml}
    </div>
  `;

  // Bind Search events
  const bindSearchEvents = (prefix) => {
    const searchInput = document.querySelector(`${prefix} #search-input`);
    if (searchInput) {
      searchInput.value = filters.search;
      searchInput.oninput = (e) => {
        filters.search = e.target.value;
        saveFilters();
        renderSidebar();
        renderTopicGrid();
      };
    }

    const clearBtn = document.querySelector(`${prefix} #search-clear-btn`);
    if (clearBtn) {
      clearBtn.onclick = () => {
        filters.search = '';
        saveFilters();
        renderSidebar();
        renderTopicGrid();
      };
    }

    const subjectBtns = document.querySelectorAll(`${prefix} .subject-tab-btn`);
    subjectBtns.forEach(btn => {
      btn.onclick = () => {
        filters.subject = btn.getAttribute('data-subject');
        saveFilters();
        renderAll();
      };
    });

    const monthSelect = document.querySelector(`${prefix} #month-select`);
    if (monthSelect) {
      monthSelect.onchange = (e) => {
        filters.month = e.target.value;
        saveFilters();
        renderAll();
      };
    }

    const statusSelect = document.querySelector(`${prefix} #status-select`);
    if (statusSelect) {
      statusSelect.onchange = (e) => {
        filters.status = e.target.value;
        saveFilters();
        renderAll();
      };
    }

    const clearFiltersBtn = document.querySelector(`${prefix} #clear-filters-btn`);
    if (clearFiltersBtn) {
      clearFiltersBtn.onclick = () => {
        filters = { subject: 'All', month: 'All', status: 'All', search: '' };
        saveFilters();
        renderAll();
      };
    }
  };

  bindSearchEvents('#desktop-sidebar');
  bindSearchEvents('#mobile-filter-drawer');

  // Mobile Accordion Toggle
  const mobileToggle = document.getElementById('mobile-filter-toggle');
  const mobileDrawer = document.getElementById('mobile-filter-drawer');
  const mobileChevron = document.getElementById('mobile-accordion-chevron');

  mobileToggle.onclick = () => {
    const isExpanded = !mobileDrawer.classList.contains('hidden');
    if (isExpanded) {
      mobileDrawer.classList.add('hidden');
      mobileChevron.classList.remove('rotate-180');
    } else {
      mobileDrawer.classList.remove('hidden');
      mobileChevron.classList.add('rotate-180');
    }
  };

  lucide.createIcons();
}

function saveFilters() {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}

// --- Filtered Topics List ---
function getFilteredTopics() {
  return topics.filter(topic => {
    if (filters.subject !== 'All' && topic.subject !== filters.subject) return false;
    if (filters.month !== 'All' && topic.priority !== filters.month) return false;
    if (filters.status !== 'All' && topic.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const nameMatch = topic.topic_name.toLowerCase().includes(q);
      const descMatch = (topic.description || '').toLowerCase().includes(q);
      const classMatch = (topic.classes || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !classMatch) return false;
    }
    return true;
  });
}

// --- Render Topic Grid ---
function renderTopicGrid() {
  const filtered = getFilteredTopics();
  gridInfoNode.innerHTML = `Showing ${filtered.length} of ${topics.length} Topics`;

  if (filtered.length === 0) {
    gridNode.innerHTML = `
      <div class="col-span-full w-full text-center py-16 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
          No topics matches your active filter options.
        </p>
        <button id="clear-grid-filters-btn" class="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          Clear Filters
        </button>
      </div>
    `;
    const clearBtn = document.getElementById('clear-grid-filters-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        filters = { subject: 'All', month: 'All', status: 'All', search: '' };
        saveFilters();
        renderAll();
      };
    }
    return;
  }

  const gridHtml = filtered.map(topic => {
    const chartsCount = topic.charts_count || 0;
    const worksheetsCount = topic.worksheets_count || 0;

    // Chart progress
    let copiedChartsCount = 0;
    for (let i = 0; i < chartsCount; i++) {
      if (getCopiedStatus(topic.id, 'chart', i)) copiedChartsCount++;
    }
    const isAllChartsCopied = chartsCount > 0 && copiedChartsCount === chartsCount;
    const hasSomeChartsCopied = copiedChartsCount > 0;

    // Worksheet progress
    let copiedWorksheetsCount = 0;
    for (let i = 0; i < worksheetsCount; i++) {
      if (getCopiedStatus(topic.id, 'worksheet', i)) copiedWorksheetsCount++;
    }
    const isAllWorksheetsCopied = worksheetsCount > 0 && copiedWorksheetsCount === worksheetsCount;
    const hasSomeWorksheetsCopied = copiedWorksheetsCount > 0;

    const isBothFullyCopied = isAllChartsCopied && isAllWorksheetsCopied;
    const color = SUBJECT_COLORS[topic.subject] || { bg: 'bg-slate-500/10', text: 'text-slate-500 border-slate-500/20', glow: 'border-l-4 border-l-slate-400' };

    return `
      <div 
        class="rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:scale-[1.01] ${color.glow} ${
          isBothFullyCopied
            ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-500/5'
            : 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/50 hover:shadow-md'
        }"
      >
        <div class="flex items-center justify-between gap-2 mb-3.5">
          <span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${color.bg} ${color.text} ${color.border}">
            ${topic.subject}
          </span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ${topic.priority}
          </span>
        </div>
        <h3 class="text-base font-bold text-slate-800 dark:text-white leading-snug mb-2">#${topic.id} ${topic.topic_name}</h3>
        <p class="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
          <i data-lucide="layers" class="w-3.5 h-3.5 flex-shrink-0"></i>
          <span class="font-semibold text-slate-600 dark:text-slate-300 truncate">Classes: ${topic.classes}</span>
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">${topic.description || ''}</p>
        <div class="flex items-center justify-between py-2 px-3.5 mb-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/30">
          <div class="flex items-center gap-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <div class="flex items-center gap-1">
              <i data-lucide="clipboard-list" class="w-3.5 h-3.5 text-blue-500"></i>
              <span>${chartsCount} Charts</span>
            </div>
            <div class="flex items-center gap-1">
              <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-purple-500"></i>
              <span>${worksheetsCount} Sheets</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${topic.status === 'EXISTS' ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-amber-500 ring-4 ring-amber-500/10'}"></span>
            <span class="text-[10px] font-bold text-slate-400 tracking-wider">${topic.status}</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button 
            data-id="${topic.id}" data-type="chart"
            class="card-action-btn flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 ${
              isAllChartsCopied
                ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : hasSomeChartsCopied
                ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/80 text-slate-700 dark:text-slate-300'
            }"
          >
            ${isAllChartsCopied ? '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span>Chart ✅ (' + chartsCount + ')</span>'
              : hasSomeChartsCopied ? '<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span><span>Chart (' + copiedChartsCount + '/' + chartsCount + ')</span>'
              : '<i data-lucide="clipboard-list" class="w-3.5 h-3.5 text-slate-400"></i><span>Chart (' + chartsCount + ')</span>'}
          </button>
          <button 
            data-id="${topic.id}" data-type="worksheet"
            class="card-action-btn flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 ${
              isAllWorksheetsCopied
                ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : hasSomeWorksheetsCopied
                ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/80 text-slate-700 dark:text-slate-300'
            }"
          >
            ${isAllWorksheetsCopied ? '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span>Sheet ✅ (' + worksheetsCount + ')</span>'
              : hasSomeWorksheetsCopied ? '<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span><span>Sheet (' + copiedWorksheetsCount + '/' + worksheetsCount + ')</span>'
              : '<i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-slate-400"></i><span>Sheet (' + worksheetsCount + ')</span>'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  gridNode.innerHTML = gridHtml;

  // Bind actions
  const actionBtns = gridNode.querySelectorAll('.card-action-btn');
  actionBtns.forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const type = btn.getAttribute('data-type');
      const topicObj = topics.find(t => t.id === id);
      
      openPromptPanel(topicObj, type);
    };
  });

  lucide.createIcons();
}

// --- Prompt Panel Controller ---
function openPromptPanel(topic, type) {
  selectedTopic = topic;
  activePromptType = type;
  selectedAssetIndex = 0;
  
  panelNode.classList.remove('translate-x-full');
  panelNode.classList.add('translate-x-0');
  
  renderPromptPanel();
}

function closePromptPanel() {
  selectedTopic = null;
  panelNode.classList.remove('translate-x-0');
  panelNode.classList.add('translate-x-full');
}

// --- Render Prompt Panel ---
function renderPromptPanel() {
  if (!selectedTopic) return;

  const classesList = getIndividualClasses(selectedTopic.classes);
  const assetsCount = activePromptType === 'chart' ? (selectedTopic.charts_count || 0) : (selectedTopic.worksheets_count || 0);

  const currentPromptObj = generatePrompt(selectedTopic, activePromptType, selectedAssetIndex);
  const simplifiedPromptObj = {
    image_generation_prompt: currentPromptObj.image_generation_prompt,
    negative_prompt: currentPromptObj.negative_prompt
  };
  const highlightedHtml = syntaxHighlightJson(simplifiedPromptObj);
  const isCopied = getCopiedStatus(selectedTopic.id, activePromptType, selectedAssetIndex);

  const color = SUBJECT_COLORS[selectedTopic.subject] || { bg: 'bg-slate-500/10', text: 'text-slate-500 border-slate-500/20' };

  // Generate sub-tabs markup
  const subTabsHtml = Array.from({ length: assetsCount }).map((_, i) => {
    const assignedClass = classesList[i % classesList.length];
    const isAssetCopied = getCopiedStatus(selectedTopic.id, activePromptType, i);
    const isSelected = selectedAssetIndex === i;

    return `
      <button
        data-index="${i}"
        class="asset-sub-tab-btn flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          isSelected
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-550 dark:text-indigo-300 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
        }"
      >
        <span>${activePromptType === 'chart' ? 'Chart' : 'Sheet'} ${i + 1} (${assignedClass})</span>
        ${isAssetCopied ? '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i>' : ''}
      </button>
    `;
  }).join('');

  panelNode.innerHTML = `
    <!-- Panel Dim Backdrop -->
    <div id="panel-backdrop" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"></div>
    
    <!-- Drawer Content -->
    <div class="fixed right-0 top-0 bottom-0 w-full md:max-w-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300">
      
      <!-- Header -->
      <div class="p-6 border-b border-slate-200/60 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/20 flex-shrink-0">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${color.bg} ${color.text} ${color.border}">
                ${selectedTopic.subject}
              </span>
              <span class="text-[10px] font-bold text-slate-400 uppercase">
                ${selectedTopic.priority}
              </span>
            </div>
            <h2 class="text-lg font-bold text-slate-950 dark:text-white leading-tight">
              #${selectedTopic.id} ${selectedTopic.topic_name}
            </h2>
          </div>
          <button id="panel-close-btn" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
          <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0"></i>
          <span class="truncate pr-1">
            Range: <strong class="text-slate-700 dark:text-slate-200">${selectedTopic.classes}</strong> (Parsed to ${classesList.length} classes)
          </span>
        </div>

        <!-- Primary Type tabs -->
        <div class="flex gap-1.5 mt-5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850">
          <button id="panel-type-chart" class="flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all ${activePromptType === 'chart' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}">
            Chart Prompts (${selectedTopic.charts_count})
          </button>
          <button id="panel-type-worksheet" class="flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all ${activePromptType === 'worksheet' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}">
            Worksheet Prompts (${selectedTopic.worksheets_count})
          </button>
        </div>

        <!-- Scrollable Sub-tabs -->
        <div class="mt-4 flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          ${subTabsHtml}
        </div>
      </div>

      <!-- Code Body -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col gap-4">
        
        <!-- Filename widget -->
        <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div class="min-w-0 flex-1">
            <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Filename Format: class-subject-topic-type-number</span>
            <code class="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">
              ${currentPromptObj.filename}
            </code>
          </div>
          <button id="panel-copy-filename-btn" class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-white">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copy Name</span>
          </button>
        </div>

        <!-- JSON viewport -->
        <div class="relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/80 p-5 shadow-inner flex-1 flex flex-col overflow-hidden">
          <div class="absolute right-4 top-4 z-10">
            <button 
              id="panel-copy-prompt-btn-top" 
              class="p-1.5 rounded-lg border transition-colors ${
                isCopied 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400'
              }"
              title="Copy JSON Prompt"
            >
              <i data-lucide="${isCopied ? 'check' : 'copy'}" class="w-4 h-4 ${isCopied ? 'text-emerald-500' : ''}"></i>
            </button>
          </div>
          <pre class="font-mono text-xs overflow-y-auto whitespace-pre leading-relaxed select-text pr-10 flex-1 scrollbar-thin">
            <code>${highlightedHtml}</code>
          </pre>
        </div>
        <p class="text-[10px] text-slate-400 italic flex items-center gap-1.5 px-1.5 flex-shrink-0">
          <span>💡 Keyboard Shortcuts: Press <strong class="font-semibold text-indigo-500">C</strong> to Copy, <strong className="font-semibold text-indigo-500">Esc</strong> to Close.</span>
        </p>
      </div>

      <!-- Footer Actions -->
      ${isCopied ? `
        <div class="p-4 border-t border-slate-200 dark:border-slate-850 flex items-center justify-end bg-white dark:bg-slate-955 no-print flex-shrink-0">
          <button id="panel-reset-checkmark-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all duration-200">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>Reset Checkmark</span>
          </button>
        </div>
      ` : ''}

    </div>
  `;

  // Bind Panel Events
  document.getElementById('panel-backdrop').onclick = closePromptPanel;
  document.getElementById('panel-close-btn').onclick = closePromptPanel;

  document.getElementById('panel-type-chart').onclick = () => {
    activePromptType = 'chart';
    selectedAssetIndex = 0;
    renderPromptPanel();
  };
  document.getElementById('panel-type-worksheet').onclick = () => {
    activePromptType = 'worksheet';
    selectedAssetIndex = 0;
    renderPromptPanel();
  };

  const subTabBtns = panelNode.querySelectorAll('.asset-sub-tab-btn');
  subTabBtns.forEach(btn => {
    btn.onclick = () => {
      selectedAssetIndex = parseInt(btn.getAttribute('data-index'));
      renderPromptPanel();
    };
  });

  // Filename Copy
  const copyFilenameBtn = document.getElementById('panel-copy-filename-btn');
  copyFilenameBtn.onclick = () => {
    navigator.clipboard.writeText(currentPromptObj.filename)
      .then(() => {
        copyFilenameBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-600">Copied!</span>';
        lucide.createIcons();
        setTimeout(() => {
          copyFilenameBtn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Copy Name</span>';
          lucide.createIcons();
        }, 1500);
      });
  };

  // Top Copy Prompt
  const copyPromptBtnTop = document.getElementById('panel-copy-prompt-btn-top');
  copyPromptBtnTop.onclick = copyCurrentPrompt;

  // Reset checkmark
  const resetCheckmarkBtn = document.getElementById('panel-reset-checkmark-btn');
  if (resetCheckmarkBtn) {
    resetCheckmarkBtn.onclick = () => {
      setCopiedStatus(selectedTopic.id, activePromptType, selectedAssetIndex, false);
      showToast(`Reset status for ${activePromptType.toUpperCase()} #${selectedAssetIndex + 1}! 🔄`);
      renderPromptPanel();
      renderDashboard();
      renderTopicGrid();
    };
  }

  lucide.createIcons();
}

// --- Copy prompt implementation ---
function copyCurrentPrompt() {
  const currentPromptObj = generatePrompt(selectedTopic, activePromptType, selectedAssetIndex);
  const simplifiedPromptObj = {
    image_generation_prompt: currentPromptObj.image_generation_prompt,
    negative_prompt: currentPromptObj.negative_prompt
  };
  const jsonStr = JSON.stringify(simplifiedPromptObj, null, 2);
  
  navigator.clipboard.writeText(jsonStr)
    .then(() => {
      setCopiedStatus(selectedTopic.id, activePromptType, selectedAssetIndex, true);
      showToast(`Copied ${activePromptType.toUpperCase()} #${selectedAssetIndex + 1} prompt to clipboard! 📋✅`);
      renderPromptPanel();
      renderDashboard();
      renderTopicGrid();
    })
    .catch(err => console.error('Failed to copy prompt:', err));
}

// --- Toast alert notifications ---
let toastTimer = null;
function showToast(message) {
  toastNode.innerHTML = `
    <div class="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500">
        <i data-lucide="check-circle-2" class="w-4 h-4"></i>
      </div>
      <p class="text-sm font-medium text-slate-800 dark:text-slate-200">${message}</p>
    </div>
  `;
  toastNode.classList.remove('hidden');
  lucide.createIcons();

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastNode.classList.add('hidden');
  }, 2000);
}

// --- Reset Modal confirm actions ---
document.getElementById('modal-cancel-btn').onclick = () => {
  resetModalNode.classList.add('hidden');
  resetModalNode.classList.remove('flex');
};

document.getElementById('modal-confirm-btn').onclick = () => {
  clearAllCopiedStatuses();
  resetModalNode.classList.add('hidden');
  resetModalNode.classList.remove('flex');
  showToast('Progress has been fully reset! 🔄');
  renderAll();
};

// --- Startup App ---
initApp();
