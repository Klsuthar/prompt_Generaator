// ============================================================
// VidyaFrame — English Tenses: Prompt Generator Page (Simple & Fast)
// ============================================================

// --- Theme Management ---
const THEME_KEY = 'vidyaframe_theme';
let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
let selectedClassLevel = 'class4-5';

// --- Panel Drawer State ---
let panelOpen = false;
let panelTenseId = null;
let panelCategory = null;
let panelAssetType = 'chart'; // 'chart' or 'worksheet'
let panelAssetIndex = 0;

// --- Copy Tracking (localStorage) ---
const TENSE_COPIED_PREFIX = 'vidyaframe_tense_copied_v4_';

function getTenseCopiedStatus(tenseId, assetType, classLevel, index) {
  return localStorage.getItem(`${TENSE_COPIED_PREFIX}${tenseId}_${assetType}_${classLevel}_${index}`) === 'true';
}

function setTenseCopiedStatus(tenseId, assetType, classLevel, index, value) {
  const key = `${TENSE_COPIED_PREFIX}${tenseId}_${assetType}_${classLevel}_${index}`;
  if (value) {
    localStorage.setItem(key, 'true');
  } else {
    localStorage.removeItem(key);
  }
}

// --- Theme Actions ---
function applyTheme() {
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem(THEME_KEY, currentTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = `<i data-lucide="${currentTheme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>`;
    lucide.createIcons();
  }
}

// --- Class Level Definitions ---
const CLASS_LEVELS = [
  { id: 'class4-5', label: 'Class 4–5', shortLabel: '4-5', color: 'emerald', description: 'Main Tenses Overview' },
  { id: 'class6', label: 'Class 6', shortLabel: '6', color: 'blue', description: 'Present/Past/Future Parts' },
  { id: 'class7-8', label: 'Class 7–8', shortLabel: '7-8', color: 'violet', description: 'Tense-wise Details' },
  { id: 'class9-10', label: 'Class 9–10', shortLabel: '9-10', color: 'rose', description: '12 Specific Tenses Mastery' },
];

const ASSET_COUNTS = {
  'class4-5': { charts: 1, worksheets: 1 },
  'class6': { charts: 3, worksheets: 3 },
  'class7-8': { charts: 2, worksheets: 2 },
  'class9-10': { charts: 1, worksheets: 1 }
};

const TENSE_COLORS = {
  present: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    border: 'border-blue-500/20 dark:border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-500',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  past: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    border: 'border-amber-500/20 dark:border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-500',
    lightBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  future: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  mixed: {
    gradient: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    border: 'border-indigo-500/20 dark:border-indigo-500/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    accentBg: 'bg-indigo-500',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/30',
  }
};

// ============================================================
// DATA STRUCTURE FOR DYNAMIC LEVEL CARDS
// ============================================================

const LEVEL_CARDS_DATA = {
  'class4-5': [
    {
      id: 'tenses-overview',
      name: 'Main Tenses Overview',
      desc: 'Simple introduction explaining: what is Present Tense, what is Past Tense, and what is Future Tense.',
      category: 'mixed',
      chartsCount: 1,
      worksheetsCount: 2,
      focuses: ['Introduction to Present, Past, and Future tenses with basic identification markers']
    }
  ],
  'class6': [
    {
      id: 'present-parts',
      name: 'Present Tense Parts',
      desc: 'Explaining the 4 parts of Present Tense: Simple, Continuous, Perfect, and Perfect Continuous.',
      category: 'present',
      chartsCount: 1,
      worksheetsCount: 1,
      focuses: ['Visual overview of Simple Present, Present Continuous, Present Perfect, and Present Perfect Continuous']
    },
    {
      id: 'past-parts',
      name: 'Past Tense Parts',
      desc: 'Explaining the 4 parts of Past Tense: Simple, Continuous, Perfect, and Perfect Continuous.',
      category: 'past',
      chartsCount: 1,
      worksheetsCount: 1,
      focuses: ['Visual overview of Simple Past, Past Continuous, Past Perfect, and Past Perfect Continuous']
    },
    {
      id: 'future-parts',
      name: 'Future Tense Parts',
      desc: 'Explaining the 4 parts of Future Tense: Simple, Continuous, Perfect, and Perfect Continuous.',
      category: 'future',
      chartsCount: 1,
      worksheetsCount: 1,
      focuses: ['Visual overview of Simple Future, Future Continuous, Future Perfect, and Future Perfect Continuous']
    }
  ],
  'class7-8': [
    {
      id: 'present-details',
      name: 'Present Tense Details',
      desc: 'Detailed rules, formulas, signal words, and examples for the four present tense subtypes.',
      category: 'present',
      chartsCount: 2,
      worksheetsCount: 2,
      focuses: [
        'Present Tense formulas (Affirmative/Negative/Interrogative) and signal/clue words',
        'Present Tense daily usage rules and examples tables for all 4 subtypes'
      ]
    },
    {
      id: 'past-details',
      name: 'Past Tense Details',
      desc: 'Detailed rules, formulas, signal words, and examples for the four past tense subtypes.',
      category: 'past',
      chartsCount: 2,
      worksheetsCount: 2,
      focuses: [
        'Past Tense formulas (Affirmative/Negative/Interrogative) and signal/clue words',
        'Past Tense narrative usage rules and examples tables for all 4 subtypes'
      ]
    },
    {
      id: 'future-details',
      name: 'Future Tense Details',
      desc: 'Detailed rules, formulas, signal words, and examples for the four future tense subtypes.',
      category: 'future',
      chartsCount: 2,
      worksheetsCount: 2,
      focuses: [
        'Future Tense formulas (Affirmative/Negative/Interrogative) and signal/clue words',
        'Future Tense predictive usage rules and examples tables for all 4 subtypes'
      ]
    }
  ],
  'class9-10': [
    // 12 Tense Subtypes specific cards
    { id: 'simple-present', name: 'Simple Present Tense', category: 'present', desc: 'Habits, regular routines, scientific facts, permanent situations.', focuses: ['Daily habits, routines, and recurring actions with formulas'] },
    { id: 'present-continuous', name: 'Present Continuous Tense', category: 'present', desc: 'Actions happening right now, temporary states, future plans.', focuses: ['Actions happening right now, at this exact moment of speaking'] },
    { id: 'present-perfect', name: 'Present Perfect Tense', category: 'present', desc: 'Past actions with present results, lifetime experiences.', focuses: ['Recent actions with clear consequences in the present moment'] },
    { id: 'present-perfect-continuous', name: 'Present Perfect Continuous Tense', category: 'present', desc: 'Actions started in past and still continuing.', focuses: ['Ongoing processes starting in past and continuing at this moment'] },
    
    { id: 'simple-past', name: 'Simple Past Tense', category: 'past', desc: 'Completed past actions, historical facts, narrative sequence.', focuses: ['Completed past events at a specific time in the past'] },
    { id: 'past-continuous', name: 'Past Continuous Tense', category: 'past', desc: 'Ongoing actions in progress at a specific past time.', focuses: ['Actions in progress at a specific past hour or moment'] },
    { id: 'past-perfect', name: 'Past Perfect Tense', category: 'past', desc: 'Actions completed before another past action (past of the past).', focuses: ['The earlier of two past events (past of the past) with formulas'] },
    { id: 'past-perfect-continuous', name: 'Past Perfect Continuous Tense', category: 'past', desc: 'Ongoing past actions continuing up to another past point.', focuses: ['Ongoing past actions continuing up to another past benchmark'] },

    { id: 'simple-future', name: 'Simple Future Tense', category: 'future', desc: 'Predictions, promises, spontaneous decisions, plans.', focuses: ['Spontaneous decisions, predictions, and offers using will/shall'] },
    { id: 'future-continuous', name: 'Future Continuous Tense', category: 'future', desc: 'Actions that will be in progress at a specific future time.', focuses: ['Actions that will be in progress at a specific time in the future'] },
    { id: 'future-perfect', name: 'Future Perfect Tense', category: 'future', desc: 'Actions completed before a future deadline.', focuses: ['Actions completed before a specific future time deadline'] },
    { id: 'future-perfect-continuous', name: 'Future Perfect Continuous Tense', category: 'future', desc: 'Ongoing duration of actions up to a future point.', focuses: ['Duration of an ongoing activity calculated at a future date'] }
  ]
};

// Mixed tenses worksheets per level
const MIXED_WS_DATA = {
  'class4-5': [],
  'class6': [
    { name: 'Mixed Worksheet 1', focus: 'Basic identification of Present, Past, and Future tense subtypes' },
    { name: 'Mixed Worksheet 2', focus: 'Simple fill-in-the-blanks testing present, past, and future forms' }
  ],
  'class7-8': [
    { name: 'Mixed Worksheet 1', focus: 'Tense identification and simple transformations across all tenses' },
    { name: 'Mixed Worksheet 2', focus: 'Fill-in-the-blanks with correct verb forms' },
    { name: 'Mixed Worksheet 3', focus: 'Error correction of tense usage in short sentences' },
    { name: 'Mixed Worksheet 4', focus: 'Sentence re-ordering and tense identification' }
  ],
  'class9-10': [
    // Subtype mixed worksheets
    { name: 'Mixed Worksheet 1 (Tense Subtypes Mixed)', focus: 'Advanced mixed practice covering all 12 tense subtypes' },
    { name: 'Mixed Worksheet 2 (Tense Subtypes Mixed)', focus: 'Error correction and sentence transformations for all 12 subtypes' },
    // Category mixed worksheets (Present mixed, Past mixed, Future mixed)
    { name: 'Present Tenses Mixed Worksheet', focus: 'Combined exercises covering all 4 Present tense subtypes' },
    { name: 'Past Tenses Mixed Worksheet', focus: 'Combined exercises covering all 4 Past tense subtypes' },
    { name: 'Future Tenses Mixed Worksheet', focus: 'Combined exercises covering all 4 Future tense subtypes' },
    // Grand general mixed worksheets
    { name: 'Mixed Tenses Board Exam Prep', focus: 'Board-style exam questions testing advanced tenses usage and transformations' },
    { name: 'Mixed Tenses Paragraph Editing', focus: 'Paragraph-level correction and passage completion with correct tenses' }
  ]
};

// ============================================================
// PROMPT ENGINE
// ============================================================

function getCurrentClassLabel() {
  const found = CLASS_LEVELS.find(c => c.id === selectedClassLevel);
  return found ? found.label : 'Class 4-5';
}

function getClassLevelNum(classStr) {
  const match = classStr.match(/\d+/);
  return match ? parseInt(match[0]) : 4;
}

function getStyleForClass(level) {
  if (level <= 4) return 'clean, polished illustrated academic infographic style with labeled diagrams and clear hierarchy';
  if (level <= 6) return 'semi-realistic flat academic illustration with structured diagrams and data visualization';
  return 'clean professional academic diagram style with precise technical illustrations';
}

// Worksheet section pools
const WS_SECTIONS_PRIMARY = [
  'Fill in the blanks: sentences with missing words, with a word bank provided at the top',
  'Match the columns: Column A and Column B with items to connect using lines or arrows',
  'True or False: 5-6 statements where student writes T or F in the box next to each',
  'Circle the correct answer: multiple-choice with 3 options per question',
  'Arrange in order: jumbled words to form correct sentences',
];

const WS_SECTIONS_UPPER = [
  'Multiple choice questions (MCQ): 4-5 questions with options A, B, C, D and answer circles',
  'Fill in the blanks: sentences with key verb forms missing (no word bank — recall-based)',
  'Match the following: two columns of sentences and their tense names to connect',
  'Transform the sentences: change affirmative to negative, interrogative, or different tense',
  'Error correction: sentences with grammatical errors that student identifies and corrects',
];

function getWorksheetSections(level, index) {
  const pool = level <= 5 ? WS_SECTIONS_PRIMARY : WS_SECTIONS_UPPER;
  const count = level <= 5 ? 4 : 5;
  const offset = (index * 3) % pool.length;
  const sections = [];
  for (let i = 0; i < count; i++) {
    sections.push(pool[(offset + i) % pool.length]);
  }
  return sections;
}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[\s\/_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function generateTensePrompt(tenseId, cardName, category, assetType, classStr, assetIndex, totalAssets, cardFocuses) {
  const classLevel = getClassLevelNum(classStr);
  const style = getStyleForClass(classLevel);
  const cleanClass = classStr.toLowerCase().replace(/\s+/g, '-');
  const cardSlug = slugify(cardName);
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  // Vary focus item based on index
  const focusItem = cardFocuses[assetIndex % cardFocuses.length] || 'general grammar usage rules';

  let contentDepth = '';
  if (classLevel <= 5) {
    contentDepth = `Simple introduction showing: main tense names, basic definitions, and simple examples of what Present, Past, and Future Tense mean. Clear labels, big fonts.`;
  } else if (classLevel <= 6) {
    contentDepth = `Intermediate level diagram showing: the active tense category and its 4 parts (Simple, Continuous, Perfect, and Perfect Continuous). Include a formula chart and clear examples.`;
  } else if (classLevel <= 8) {
    contentDepth = `Detailed grammar rules chart showing: all 4 tense subtypes of the active category with complete formulas (affirmative, negative, interrogative), when to use them, signal words, and example tables.`;
  } else {
    contentDepth = `Advanced comprehensive mastery card showing: detailed formulas, usage rules, signal words, example conjugation tables, common mistakes vs corrections, exceptions, and transformation practice questions.`;
  }

  let imagePrompt = '';
  const indexSuffix = totalAssets > 1 ? `-${assetIndex + 1}` : '';
  const filename = `${cleanClass}-english-${cardSlug}-${assetType}${indexSuffix}`;

  if (assetType === 'chart') {
    const layout = classLevel <= 5
      ? '3 neatly structured visual cards (Present, Past, Future) side-by-side on the page, each with a large visual illustration and basic summary'
      : 'central detailed diagram with labeled boxes, structured tables, clean bold headers at the top';

    imagePrompt = `Create a high-quality educational wall chart titled '${cardName}'. Subject: English Grammar. Target audience: ${classStr} students. CRITICAL: Do NOT write, print, or include any class tag, grade label, age group, or level text (such as "Class ${classLevel}", "Grade ${classLevel}", etc.) anywhere on the chart design. The chart must contain ONLY the grammar rules, title, formulas, and examples. Focus specifically on: ${focusItem}. Art style: ${style}. Color palette: clean dark blue (#0C2340) primary color, soft blue (#1D4ED8) secondary accents, on a pure white (#FFFFFF) background. Typography: use clean, extremely sharp, bold sans-serif fonts for all headings and texts. Design rules: STRICT edge-to-edge layout with ZERO margin, ZERO padding, ZERO border, ZERO frame. Pure white background (#FFFFFF). The content must fill the entire canvas from edge to edge. No watermarks, no decorative borders. Print-ready at 300dpi, A4 portrait orientation.`;
  } else {
    const sections = getWorksheetSections(classLevel, assetIndex);
    const sectionList = sections.map((s, i) => `Section ${i + 1}: ${s}`).join('. ');

    imagePrompt = `Create a print-ready educational worksheet titled '${cardName} — Worksheet'. Subject: English Grammar. Target audience: ${classStr} students. CRITICAL: Do NOT write, print, or include any class tag, grade label, age group, or level text (such as "Class ${classLevel}", "Grade ${classLevel}", etc.) anywhere on the worksheet design. The worksheet must contain ONLY the grammar questions, title, instructions, and workspace. Focus testing on: ${focusItem}. Art style: ${style}. Color palette: clean dark blue (#0C2340) primary color, soft blue (#1D4ED8) secondary accents, on a pure white (#FFFFFF) background. Typography: use clean, extremely sharp, bold sans-serif fonts for all headings and texts. Topic focus: '${cardName}' — all questions must test different aspects and skills of this topic. IMPORTANT: The worksheet MUST have exactly ${sections.length} clearly separated sections, each using a COMPLETELY DIFFERENT question format. The sections are: ${sectionList}. Every section must have its own bold section heading (e.g., "A. Fill in the Blanks", "B. Choose the Correct Answer"). DO NOT repeat the same question type across sections. Include generous blank answer spaces (lines, boxes, circles) for student responses. Design rules: STRICT edge-to-edge layout with ZERO margin, ZERO padding, ZERO border, ZERO frame. Pure white background (#FFFFFF). The content must fill the entire canvas from edge to edge. No watermarks, no decorative borders. Print-ready at 300dpi, A4 portrait orientation.`;
  }

  const negativePrompt = 'class labels, grade labels, age labels, class tags, grade tags, level tags, level badges, class indicators, grade indicators, borders, frames, outlines, margins, padding, decorative borders, watermarks, dark backgrounds, overlapping text, blurry text, distorted letters, cropped content, vignette, shadow borders, rounded corners frame, header bar, footer bar, page number, logo, brand name, stock photo style, photographic, 3D render unless specified, word search puzzle, repetitive question format, all same question type';

  return {
    filename: filename,
    assigned_class: classStr,
    tense_name: cardName,
    category: categoryLabel,
    asset_type: assetType,
    image_generation_prompt: imagePrompt,
    negative_prompt: negativePrompt,
  };
}

// --- Generate Mixed Tense Worksheet Prompt ---
function generateMixedTensesPrompt(classStr, wsName, assetIndex, totalAssets, focusDesc) {
  const classLevel = getClassLevelNum(classStr);
  const style = getStyleForClass(classLevel);
  const cleanClass = classStr.toLowerCase().replace(/\s+/g, '-');
  const wsSlug = slugify(wsName);
  const filename = `${cleanClass}-english-${wsSlug}`;

  const sections = getWorksheetSections(classLevel, assetIndex + 6); // offset to ensure different questions
  const sectionList = sections.map((s, i) => `Section ${i + 1}: ${s}`).join('. ');

  const imagePrompt = `Create a print-ready educational worksheet titled '${wsName}'. Subject: English Grammar. Target audience: ${classStr} students. CRITICAL: Do NOT write, print, or include any class tag, grade label, age group, or level text (such as "Class ${classLevel}", "Grade ${classLevel}", etc.) anywhere on the worksheet design. The worksheet must contain ONLY the grammar questions, title, instructions, and workspace. Focus testing on: ${focusDesc}. Art style: ${style}. Color palette: clean dark blue (#0C2340) primary color, soft blue (#1D4ED8) secondary accents, on a pure white (#FFFFFF) background. Typography: use clean, extremely sharp, bold sans-serif fonts for all headings and texts. Topic focus: Mixed Tenses — all questions must test different aspects and skills of various tenses (simple, continuous, perfect, perfect continuous) together. IMPORTANT: The worksheet MUST have exactly ${sections.length} clearly separated sections, each using a COMPLETELY DIFFERENT question format. The sections are: ${sectionList}. Every section must have its own bold section heading (e.g., "A. Identify the Tense", "B. Rewrite the Sentences"). DO NOT repeat the same question type across sections. Include generous blank answer spaces (lines, boxes, circles) for student responses. Design rules: STRICT edge-to-edge layout with ZERO margin, ZERO padding, ZERO border, ZERO frame. Pure white background (#FFFFFF). The content must fill the entire canvas from edge to edge. No watermarks, no decorative borders. Print-ready at 300dpi, A4 portrait orientation.`;

  const negativePrompt = 'class labels, grade labels, age labels, class tags, grade tags, level tags, level badges, class indicators, grade indicators, borders, frames, outlines, margins, padding, decorative borders, watermarks, dark backgrounds, overlapping text, blurry text, distorted letters, cropped content, vignette, shadow borders, rounded corners frame, header bar, footer bar, page number, logo, brand name, stock photo style, photographic, 3D render unless specified, word search puzzle, repetitive question format, all same question type';

  return {
    filename: filename,
    assigned_class: classStr,
    tense_name: wsName,
    category: 'Mixed',
    asset_type: 'worksheet',
    image_generation_prompt: imagePrompt,
    negative_prompt: negativePrompt,
  };
}

// --- Toast ---
let toastTimer = null;
function showToast(message) {
  const toastNode = document.getElementById('app-toast');
  if (!toastNode) return;
  toastNode.innerHTML = `
    <div class="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-emerald-500/20 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5">
      <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500">
        <i data-lucide="check-circle-2" class="w-4 h-4"></i>
      </div>
      <p class="text-sm font-medium text-slate-800 dark:text-slate-200">${message}</p>
    </div>
  `;
  toastNode.classList.remove('hidden');
  lucide.createIcons();
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastNode.classList.add('hidden'); }, 2000);
}

// --- Syntax Highlighting for JSON ---
function syntaxHighlightJson(jsonObj) {
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  let escaped = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
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

// ============================================================
// UI RENDERING
// ============================================================

function renderClassSelector() {
  const container = document.getElementById('class-selector');
  if (!container) return;

  container.innerHTML = CLASS_LEVELS.map(cl => {
    const isActive = selectedClassLevel === cl.id;
    const colorMap = {
      emerald: { active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600' },
      blue: { active: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600' },
      violet: { active: 'bg-violet-500 text-white shadow-lg shadow-violet-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-600' },
      amber: { active: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600' },
      rose: { active: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30', inactive: 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600' },
    };
    const colors = colorMap[cl.color];

    return `
      <button
        data-class="${cl.id}"
        class="class-level-btn flex flex-col items-center gap-1 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl border transition-all duration-300 transform ${
          isActive 
            ? `${colors.active} border-transparent scale-105` 
            : `${colors.inactive} border-slate-200/50 dark:border-slate-700/50`
        }"
      >
        <span class="text-lg sm:text-xl font-extrabold">${cl.shortLabel}</span>
        <span class="text-[10px] sm:text-xs font-semibold opacity-85">${cl.description}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.class-level-btn').forEach(btn => {
    btn.onclick = () => {
      selectedClassLevel = btn.getAttribute('data-class');
      renderClassSelector();
      renderQuickNav();
      renderOverviewStats();
      renderTenseCards();
    };
  });
}

function renderTenseCard(card, colors) {
  const classLabel = getCurrentClassLabel();
  const chartsCount = card.chartsCount || 1;
  const worksheetsCount = card.worksheetsCount || 1;

  let isComplete = true;
  for (let i = 0; i < chartsCount; i++) {
    if (!getTenseCopiedStatus(card.id, 'chart', classLabel, i)) {
      isComplete = false;
      break;
    }
  }
  if (isComplete) {
    for (let i = 0; i < worksheetsCount; i++) {
      if (!getTenseCopiedStatus(card.id, 'worksheet', classLabel, i)) {
        isComplete = false;
        break;
      }
    }
  }

  // Generate buttons for Charts
  const chartButtonsHtml = Array.from({ length: chartsCount }).map((_, i) => {
    const isCopied = getTenseCopiedStatus(card.id, 'chart', classLabel, i);
    const promptObj = generateTensePrompt(card.id, card.name, card.category, 'chart', classLabel, i, chartsCount, card.focuses);
    
    return `
      <div class="flex flex-col justify-between p-3 rounded-lg border transition-all ${
        isCopied 
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20' 
          : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850'
      }">
        <div class="mb-2">
          <span class="text-[11px] font-bold text-slate-700 dark:text-slate-350 flex items-center justify-between">
            <span>Chart ${i + 1}</span>
            ${isCopied ? '<span class="text-[9px] font-extrabold text-emerald-500">✅</span>' : ''}
          </span>
          <code class="block text-[8px] font-mono text-slate-405 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap" title="${promptObj.filename}">
            ${promptObj.filename}
          </code>
        </div>
        <div class="flex gap-1 mt-1">
          <button
            data-tense-id="${card.id}" data-tense-name="${card.name}" data-category="${card.category}" data-prompt-type="chart" data-class="${classLabel}" data-asset-idx="${i}" data-total-assets="${chartsCount}"
            class="direct-copy-btn flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold transition-all ${
              isCopied
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }"
          >
            <i data-lucide="${isCopied ? 'check' : 'copy'}" class="w-2.5 h-2.5"></i>
            <span>${isCopied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            data-tense-id="${card.id}" data-tense-name="${card.name}" data-category="${card.category}" data-prompt-type="chart" data-asset-idx="${i}"
            class="view-prompt-btn p-1 rounded border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            title="View Details"
          >
            <i data-lucide="eye" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Generate buttons for Worksheets
  const worksheetButtonsHtml = Array.from({ length: worksheetsCount }).map((_, i) => {
    const isCopied = getTenseCopiedStatus(card.id, 'worksheet', classLabel, i);
    const promptObj = generateTensePrompt(card.id, card.name, card.category, 'worksheet', classLabel, i, worksheetsCount, card.focuses);

    return `
      <div class="flex flex-col justify-between p-3 rounded-lg border transition-all ${
        isCopied 
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20' 
          : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-850'
      }">
        <div class="mb-2">
          <span class="text-[11px] font-bold text-slate-700 dark:text-slate-350 flex items-center justify-between">
            <span>Worksheet ${i + 1}</span>
            ${isCopied ? '<span class="text-[9px] font-extrabold text-emerald-500">✅</span>' : ''}
          </span>
          <code class="block text-[8px] font-mono text-slate-405 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap" title="${promptObj.filename}">
            ${promptObj.filename}
          </code>
        </div>
        <div class="flex gap-1 mt-1">
          <button
            data-tense-id="${card.id}" data-tense-name="${card.name}" data-category="${card.category}" data-prompt-type="worksheet" data-class="${classLabel}" data-asset-idx="${i}" data-total-assets="${worksheetsCount}"
            class="direct-copy-btn flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold transition-all ${
              isCopied
                ? 'bg-emerald-500 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }"
          >
            <i data-lucide="${isCopied ? 'check' : 'copy'}" class="w-2.5 h-2.5"></i>
            <span>${isCopied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            data-tense-id="${card.id}" data-tense-name="${card.name}" data-category="${card.category}" data-prompt-type="worksheet" data-asset-idx="${i}"
            class="view-prompt-btn p-1 rounded border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            title="View Details"
          >
            <i data-lucide="eye" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="tense-card rounded-2xl border p-5 transition-all duration-300 ${
      isComplete 
        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 dark:border-emerald-500/30 shadow-sm' 
        : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-800/50 hover:border-slate-350 dark:hover:border-slate-750'
    }">
      <div class="flex items-start justify-between gap-3 mb-3 border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>${card.name}</span>
            ${isComplete ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">✅ Done</span>' : ''}
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">${card.desc}</p>
        </div>
      </div>

      <!-- Quick Copy Grid -->
      <div class="space-y-4">
        <!-- Chart Grid -->
        <div>
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2">
            <i data-lucide="clipboard-list" class="w-3 h-3 text-blue-500"></i> Charts (${chartsCount})
          </span>
          <div class="grid grid-cols-2 gap-2">
            ${chartButtonsHtml}
          </div>
        </div>

        <!-- Worksheet Grid -->
        <div>
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2">
            <i data-lucide="file-spreadsheet" class="w-3 h-3 text-purple-500"></i> Worksheets (${worksheetsCount})
          </span>
          <div class="grid grid-cols-2 gap-2">
            ${worksheetButtonsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- Render Mixed Tenses Worksheets ---
function renderMixedTensesSection() {
  const classLabel = getCurrentClassLabel();
  const mixedWorksheets = MIXED_WS_DATA[selectedClassLevel] || [];
  const mixedCount = mixedWorksheets.length;
  if (mixedCount === 0) return '';

  let allMixedComplete = true;
  const buttonsHtml = mixedWorksheets.map((ws, i) => {
    const isCopied = getMixedCopiedStatus(classLabel, i);
    if (!isCopied) allMixedComplete = false;
    const promptObj = generateMixedTensesPrompt(classLabel, ws.name, i, mixedCount, ws.focus);

    return `
      <div class="flex flex-col justify-between p-4 rounded-xl border transition-all ${
        isCopied 
          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 shadow-sm' 
          : 'bg-white/80 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 shadow-sm'
      }">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-500"></i> ${ws.name}
            </span>
            ${isCopied ? '<span class="text-[10px] font-bold text-emerald-500">✅ Copied</span>' : ''}
          </div>
          <code class="block text-[9px] font-mono text-slate-455 dark:text-slate-405 bg-slate-55/50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200/40 dark:border-slate-850 truncate mb-3" title="${promptObj.filename}">
            File: ${promptObj.filename}
          </code>
        </div>
        <div class="flex gap-2">
          <button
            data-class="${classLabel}" data-ws-name="${ws.name}" data-ws-focus="${ws.focus}" data-asset-idx="${i}" data-total-assets="${mixedCount}"
            class="mixed-copy-btn flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
              isCopied
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }"
          >
            <i data-lucide="${isCopied ? 'check' : 'copy'}" class="w-3.5 h-3.5"></i>
            <span>${isCopied ? 'Copied' : 'Copy Prompt'}</span>
          </button>
          <button
            data-ws-name="${ws.name}" data-ws-focus="${ws.focus}" data-asset-idx="${i}"
            class="mixed-view-btn p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            title="View Details"
          >
            <i data-lucide="eye" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="mt-12 mb-10 border-t border-dashed border-slate-200 dark:border-slate-800 pt-8 animate-fadeIn">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
          <i data-lucide="shuffle" class="w-5 h-5"></i>
        </div>
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Mixed Tenses Worksheets</span>
            ${allMixedComplete ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">✅ Done</span>' : ''}
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">Comprehensive worksheets covering questions from multiple tenses combined</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${buttonsHtml}
      </div>
    </section>
  `;
}

function renderTenseCards() {
  const mainContent = document.getElementById('tense-main-content');
  if (!mainContent) return;

  const cardsData = LEVEL_CARDS_DATA[selectedClassLevel] || [];
  
  // Categorize cards
  const categories = {
    mixed: [],
    present: [],
    past: [],
    future: []
  };
  cardsData.forEach(card => {
    if (categories[card.category]) {
      categories[card.category].push(card);
    }
  });

  const catRenderConfig = [
    { key: 'mixed', title: 'Tenses Overview', icon: 'book-open', colors: TENSE_COLORS.mixed },
    { key: 'present', title: 'Present Tense', icon: 'clock', colors: TENSE_COLORS.present },
    { key: 'past', title: 'Past Tense', icon: 'history', colors: TENSE_COLORS.past },
    { key: 'future', title: 'Future Tense', icon: 'rocket', colors: TENSE_COLORS.future }
  ];

  let cardsHtml = catRenderConfig.map(cfg => {
    const list = categories[cfg.key];
    if (!list || list.length === 0) return '';
    const colors = cfg.colors;

    return `
      <section class="mb-10 animate-fadeIn" id="section-${cfg.key}">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white shadow-md">
            <i data-lucide="${cfg.icon}" class="w-5 h-5"></i>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">${cfg.title}</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          ${list.map(t => renderTenseCard(t, colors)).join('')}
        </div>
      </section>
    `;
  }).join('');

  // Add mixed worksheets section at the bottom
  cardsHtml += renderMixedTensesSection();

  mainContent.innerHTML = cardsHtml;

  // Bind direct copy buttons
  mainContent.querySelectorAll('.direct-copy-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cardId = btn.getAttribute('data-tense-id');
      const cardName = btn.getAttribute('data-tense-name');
      const category = btn.getAttribute('data-category');
      const promptType = btn.getAttribute('data-prompt-type');
      const classLabel = btn.getAttribute('data-class');
      const assetIdx = parseInt(btn.getAttribute('data-asset-idx'));
      const totalAssets = parseInt(btn.getAttribute('data-total-assets'));

      const card = cardsData.find(c => c.id === cardId);
      if (!card) return;

      const promptObj = generateTensePrompt(cardId, cardName, category, promptType, classLabel, assetIdx, totalAssets, card.focuses);

      navigator.clipboard.writeText(promptObj.image_generation_prompt).then(() => {
        setTenseCopiedStatus(cardId, promptType, classLabel, assetIdx, true);
        showToast(`Copied ${promptType.toUpperCase()} ${assetIdx + 1} prompt for ${classLabel}! 📋✅`);
        renderTenseCards();
        renderOverviewStats();
      });
    };
  });

  // Bind view details buttons
  mainContent.querySelectorAll('.view-prompt-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cardId = btn.getAttribute('data-tense-id');
      const cardName = btn.getAttribute('data-tense-name');
      const category = btn.getAttribute('data-category');
      const promptType = btn.getAttribute('data-prompt-type');
      const assetIdx = parseInt(btn.getAttribute('data-asset-idx'));
      openPromptPanel(cardId, cardName, category, promptType, assetIdx);
    };
  });

  // Bind mixed copy buttons
  mainContent.querySelectorAll('.mixed-copy-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const classLabel = btn.getAttribute('data-class');
      const wsName = btn.getAttribute('data-ws-name');
      const wsFocus = btn.getAttribute('data-ws-focus');
      const assetIdx = parseInt(btn.getAttribute('data-asset-idx'));
      const totalAssets = parseInt(btn.getAttribute('data-total-assets'));

      const promptObj = generateMixedTensesPrompt(classLabel, wsName, assetIdx, totalAssets, wsFocus);

      navigator.clipboard.writeText(promptObj.image_generation_prompt).then(() => {
        setMixedCopiedStatus(classLabel, assetIdx, true);
        showToast(`Copied ${wsName} prompt for ${classLabel}! 📋✅`);
        renderTenseCards();
        renderOverviewStats();
      });
    };
  });

  // Bind mixed view buttons
  mainContent.querySelectorAll('.mixed-view-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const wsName = btn.getAttribute('data-ws-name');
      const wsFocus = btn.getAttribute('data-ws-focus');
      const assetIdx = parseInt(btn.getAttribute('data-asset-idx'));
      const classLabel = getCurrentClassLabel();
      const mixedWorksheets = MIXED_WS_DATA[selectedClassLevel] || [];
      openMixedPromptPanel(classLabel, wsName, wsFocus, assetIdx, mixedWorksheets.length);
    };
  });

  lucide.createIcons();
}

// --- Quick Navigation Pills ---
function renderQuickNav() {
  const nav = document.getElementById('quick-nav');
  if (!nav) return;

  const categories = [
    { id: 'mixed', label: 'Overview', color: TENSE_COLORS.mixed },
    { id: 'present', label: 'Present', color: TENSE_COLORS.present },
    { id: 'past', label: 'Past', color: TENSE_COLORS.past },
    { id: 'future', label: 'Future', color: TENSE_COLORS.future },
  ];

  // Only render links if the active card categories contain them
  const cardsData = LEVEL_CARDS_DATA[selectedClassLevel] || [];
  const activeKeys = new Set(cardsData.map(c => c.category));

  nav.innerHTML = categories.map(cat => {
    if (!activeKeys.has(cat.id)) return '';
    return `
      <a href="#section-${cat.id}" class="flex items-center gap-1.5 px-3 py-2 rounded-xl ${cat.color.bg} ${cat.color.text} border ${cat.color.border} text-xs font-bold hover:scale-105 transition-all">
        <span class="w-1.5 h-1.5 rounded-full ${cat.color.accentBg}"></span>
        ${cat.label}
      </a>
    `;
  }).join('');
}

// --- Overview Status Counters ---
function renderOverviewStats() {
  const statsEl = document.getElementById('tense-stats');
  if (!statsEl) return;

  let copiedCount = 0;
  let totalAssets = 0;
  const classLabel = getCurrentClassLabel();
  const cardsData = LEVEL_CARDS_DATA[selectedClassLevel] || [];
  const mixedWorksheets = MIXED_WS_DATA[selectedClassLevel] || [];

  // Calculate tense card assets
  cardsData.forEach(card => {
    const chartsCount = card.chartsCount || 1;
    const worksheetsCount = card.worksheetsCount || 1;
    totalAssets += chartsCount + worksheetsCount;

    for (let i = 0; i < chartsCount; i++) {
      if (getTenseCopiedStatus(card.id, 'chart', classLabel, i)) copiedCount++;
    }
    for (let i = 0; i < worksheetsCount; i++) {
      if (getTenseCopiedStatus(card.id, 'worksheet', classLabel, i)) copiedCount++;
    }
  });

  // Calculate mixed worksheets
  totalAssets += mixedWorksheets.length;
  for (let i = 0; i < mixedWorksheets.length; i++) {
    if (getMixedCopiedStatus(classLabel, i)) copiedCount++;
  }

  const percent = Math.round((copiedCount / totalAssets) * 100) || 0;

  statsEl.innerHTML = `
    <div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 max-w-sm mx-auto">
      <div class="text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase">Copied Progress (${classLabel})</span>
        <div class="flex items-baseline gap-1.5 mt-1">
          <span class="text-xl font-black text-slate-900 dark:text-white">${copiedCount}</span>
          <span class="text-xs text-slate-400">/ ${totalAssets} assets</span>
        </div>
      </div>
      <div class="text-right">
        <span class="text-lg font-black text-emerald-500">${percent}%</span>
        <div class="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div class="h-full bg-emerald-500 rounded-full" style="width: ${percent}%"></div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// PROMPT PANEL — Slide-in Drawer
// ============================================================

function openPromptPanel(cardId, cardName, category, assetType, assetIdx) {
  panelOpen = true;
  panelTenseId = cardId;
  panelCategory = category;
  panelAssetType = assetType;
  panelAssetIndex = assetIdx;

  const panelNode = document.getElementById('prompt-panel');
  if (panelNode) {
    panelNode.classList.remove('translate-x-full');
    panelNode.classList.add('translate-x-0');
    document.body.classList.add('overflow-hidden');
  }
  renderPromptPanel();
}

function openMixedPromptPanel(classLabel, wsName, wsFocus, assetIdx, totalAssets) {
  panelOpen = true;
  panelTenseId = 'mixed';
  panelCategory = 'mixed';
  panelAssetType = 'worksheet';
  panelAssetIndex = assetIdx;

  const panelNode = document.getElementById('prompt-panel');
  if (panelNode) {
    panelNode.classList.remove('translate-x-full');
    panelNode.classList.add('translate-x-0');
    document.body.classList.add('overflow-hidden');
  }
  renderMixedPromptPanelContent(classLabel, wsName, wsFocus, assetIdx, totalAssets);
}

function closePromptPanel() {
  panelOpen = false;
  const panelNode = document.getElementById('prompt-panel');
  if (panelNode) {
    panelNode.classList.remove('translate-x-0');
    panelNode.classList.add('translate-x-full');
    document.body.classList.remove('overflow-hidden');
  }
}

function renderPromptPanel() {
  if (!panelOpen || !panelTenseId) return;

  const panelNode = document.getElementById('prompt-panel');
  if (!panelNode) return;

  const cardsData = LEVEL_CARDS_DATA[selectedClassLevel] || [];
  const card = cardsData.find(c => c.id === panelTenseId);
  if (!card) return;

  const classLabel = getCurrentClassLabel();
  const activeCount = panelAssetType === 'chart' ? card.chartsCount : card.worksheetsCount;

  const promptObj = generateTensePrompt(panelTenseId, card.name, panelCategory, panelAssetType, classLabel, panelAssetIndex, activeCount, card.focuses);
  const simplifiedObj = {
    image_generation_prompt: promptObj.image_generation_prompt,
    negative_prompt: promptObj.negative_prompt,
  };
  const highlightedHtml = syntaxHighlightJson(simplifiedObj);
  const isCopied = getTenseCopiedStatus(panelTenseId, panelAssetType, classLabel, panelAssetIndex);
  const catColors = TENSE_COLORS[panelCategory] || TENSE_COLORS.present;

  const subTabsHtml = Array.from({ length: activeCount }).map((_, i) => {
    const isAssetCopied = getTenseCopiedStatus(panelTenseId, panelAssetType, classLabel, i);
    const isSelected = panelAssetIndex === i;
    return `
      <button
        data-asset-idx="${i}"
        class="panel-class-tab flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          isSelected
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
        }"
      >
        <span>${panelAssetType === 'chart' ? 'Chart' : 'Sheet'} ${i + 1}</span>
        ${isAssetCopied ? '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i>' : ''}
      </button>
    `;
  }).join('');

  panelNode.innerHTML = `
    <!-- Panel Dim Backdrop -->
    <div id="panel-backdrop" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"></div>

    <!-- Drawer Content -->
    <div class="fixed right-0 top-0 bottom-0 w-full md:max-w-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300">

      <!-- Header -->
      <div class="p-6 border-b border-slate-200/60 dark:border-slate-800/50 bg-slate-50/40 dark:bg-slate-900/20 flex-shrink-0">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${catColors.bg} ${catColors.text} ${catColors.border}">
                ${card.category.toUpperCase()} Tense
              </span>
              <span class="text-[10px] font-bold text-slate-400 uppercase">
                ${panelAssetType === 'chart' ? '📊 Chart' : '📝 Worksheet'}
              </span>
            </div>
            <h2 class="text-lg font-bold text-slate-950 dark:text-white leading-tight">
              ${card.name}
            </h2>
          </div>
          <button id="panel-close-btn" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
          <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0"></i>
          <span>Class: <strong class="text-slate-700 dark:text-slate-200">${classLabel}</strong></span>
        </div>

        <!-- Primary Type tabs -->
        <div class="flex gap-1.5 mt-5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
          <button id="panel-type-chart" class="flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all ${panelAssetType === 'chart' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}">
            📊 Chart Prompts
          </button>
          <button id="panel-type-worksheet" class="flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all ${panelAssetType === 'worksheet' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}">
            📝 Worksheet Prompts
          </button>
        </div>

        <!-- Scrollable Sub-tabs -->
        <div id="panel-sub-tabs" class="mt-4 flex gap-1.5 overflow-x-auto pb-1.5">
          ${subTabsHtml}
        </div>
      </div>

      <!-- Code Body -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-955/40 flex flex-col gap-4">

        <!-- Filename widget -->
        <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div class="min-w-0 flex-1">
            <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Filename</span>
            <code class="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">${promptObj.filename}</code>
          </div>
          <button id="panel-copy-filename-btn" class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copy Name</span>
          </button>
        </div>

        <!-- JSON viewport -->
        <div class="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-inner flex-1 flex flex-col overflow-hidden">
          <div class="absolute right-4 top-4 z-10">
            <button
              id="panel-copy-prompt-btn-top"
              class="p-1.5 rounded-lg border transition-colors ${
                isCopied
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400'
              }"
              title="Copy Image Prompt"
            >
              <i data-lucide="${isCopied ? 'check' : 'copy'}" class="w-4 h-4 ${isCopied ? 'text-emerald-500' : ''}"></i>
            </button>
          </div>
          <pre class="font-mono text-xs overflow-y-auto whitespace-pre leading-relaxed select-text pr-10 flex-1"><code>${highlightedHtml}</code></pre>
        </div>

        <!-- Copy Buttons Row -->
        <div class="flex flex-wrap gap-2 flex-shrink-0">
          <button id="panel-copy-negative-btn" class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all duration-200 shadow-sm">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copy Negative Prompt</span>
          </button>
          <button id="panel-copy-all-btn" class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 shadow-sm">
            <i data-lucide="copy-plus" class="w-3.5 h-3.5"></i>
            <span>Copy All</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      ${isCopied ? `
        <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-white dark:bg-slate-950 flex-shrink-0">
          <button id="panel-reset-checkmark-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all duration-200">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>Reset Checkmark</span>
          </button>
        </div>
      ` : ''}

    </div>
  `;

  // Bind panel events
  document.getElementById('panel-backdrop').onclick = closePromptPanel;
  document.getElementById('panel-close-btn').onclick = closePromptPanel;

  // Type tabs
  document.getElementById('panel-type-chart').onclick = () => {
    panelAssetType = 'chart';
    panelAssetIndex = 0;
    renderPromptPanel();
  };
  document.getElementById('panel-type-worksheet').onclick = () => {
    panelAssetType = 'worksheet';
    panelAssetIndex = 0;
    renderPromptPanel();
  };

  // Sub-tabs
  panelNode.querySelectorAll('.panel-class-tab').forEach(btn => {
    btn.onclick = () => {
      panelAssetIndex = parseInt(btn.getAttribute('data-asset-idx'));
      renderPromptPanel();
    };
  });

  // Filename copy
  document.getElementById('panel-copy-filename-btn').onclick = () => {
    const btn = document.getElementById('panel-copy-filename-btn');
    navigator.clipboard.writeText(promptObj.filename).then(() => {
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-600">Copied!</span>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Copy Name</span>';
        lucide.createIcons();
      }, 1500);
    });
  };

  // Copy image prompt (top button)
  document.getElementById('panel-copy-prompt-btn-top').onclick = () => {
    navigator.clipboard.writeText(promptObj.image_generation_prompt).then(() => {
      setTenseCopiedStatus(panelTenseId, panelAssetType, classLabel, panelAssetIndex, true);
      showToast(`Copied ${panelAssetType.toUpperCase()} ${panelAssetIndex + 1} prompt for ${classLabel}! 📋✅`);
      renderPromptPanel();
      renderTenseCards();
      renderOverviewStats();
    });
  };

  // Copy negative prompt
  document.getElementById('panel-copy-negative-btn').onclick = () => {
    const btn = document.getElementById('panel-copy-negative-btn');
    navigator.clipboard.writeText(promptObj.negative_prompt).then(() => {
      showToast('Copied negative prompt! 📋');
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-600">Copied!</span>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Copy Negative Prompt</span>';
        lucide.createIcons();
      }, 1500);
    });
  };

  // Copy all
  document.getElementById('panel-copy-all-btn').onclick = () => {
    const allText = `IMAGE PROMPT:\n${promptObj.image_generation_prompt}\n\nNEGATIVE PROMPT:\n${promptObj.negative_prompt}`;
    const btn = document.getElementById('panel-copy-all-btn');
    navigator.clipboard.writeText(allText).then(() => {
      setTenseCopiedStatus(panelTenseId, panelAssetType, classLabel, panelAssetIndex, true);
      showToast('Copied all prompts! 📋✅');
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-600">Copied!</span>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy-plus" class="w-3.5 h-3.5"></i><span>Copy All</span>';
        lucide.createIcons();
      }, 1500);
      renderPromptPanel();
      renderTenseCards();
      renderOverviewStats();
    });
  };

  // Reset checkmark
  const resetBtn = document.getElementById('panel-reset-checkmark-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      setTenseCopiedStatus(panelTenseId, panelAssetType, classLabel, panelAssetIndex, false);
      showToast('Reset checkmark! 🔄');
      renderPromptPanel();
      renderTenseCards();
      renderOverviewStats();
    };
  }

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closePromptPanel();
      window.removeEventListener('keydown', escHandler);
    }
  };
  window.addEventListener('keydown', escHandler);

  lucide.createIcons();
}

function renderMixedPromptPanelContent(classLabel, wsName, wsFocus, assetIdx, totalAssets) {
  const panelNode = document.getElementById('prompt-panel');
  if (!panelNode) return;

  const promptObj = generateMixedTensesPrompt(classLabel, wsName, assetIdx, totalAssets, wsFocus);
  const simplifiedObj = {
    image_generation_prompt: promptObj.image_generation_prompt,
    negative_prompt: promptObj.negative_prompt,
  };
  const highlightedHtml = syntaxHighlightJson(simplifiedObj);
  const isCopied = getMixedCopiedStatus(classLabel, assetIdx);
  const catColors = TENSE_COLORS.mixed;

  const subTabsHtml = Array.from({ length: totalAssets }).map((_, i) => {
    const isAssetCopied = getMixedCopiedStatus(classLabel, i);
    const isSelected = assetIdx === i;
    const mixedWorksheets = MIXED_WS_DATA[selectedClassLevel] || [];
    const thisWs = mixedWorksheets[i] || { name: `Mixed Sheet ${i + 1}`, focus: '' };

    return `
      <button
        data-asset-idx="${i}" data-ws-name="${thisWs.name}" data-ws-focus="${thisWs.focus}"
        class="panel-mixed-tab flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          isSelected
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
        }"
      >
        <span>Mixed Sheet ${i + 1}</span>
        ${isAssetCopied ? '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i>' : ''}
      </button>
    `;
  }).join('');

  panelNode.innerHTML = `
    <!-- Panel Dim Backdrop -->
    <div id="panel-backdrop" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"></div>

    <!-- Drawer Content -->
    <div class="fixed right-0 top-0 bottom-0 w-full md:max-w-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300">

      <!-- Header -->
      <div class="p-6 border-b border-slate-200/60 dark:border-slate-800/50 bg-slate-50/40 dark:bg-slate-900/20 flex-shrink-0">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${catColors.bg} ${catColors.text} ${catColors.border}">
                Mixed Tenses Practice
              </span>
              <span class="text-[10px] font-bold text-slate-400 uppercase">
                📝 Worksheet
              </span>
            </div>
            <h2 class="text-lg font-bold text-slate-950 dark:text-white leading-tight">
              ${wsName}
            </h2>
          </div>
          <button id="panel-close-btn" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
          <i data-lucide="info" class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0"></i>
          <span>Class: <strong class="text-slate-700 dark:text-slate-200">${classLabel}</strong></span>
        </div>

        <!-- Scrollable Sub-tabs -->
        <div id="panel-sub-tabs" class="mt-4 flex gap-1.5 overflow-x-auto pb-1.5">
          ${subTabsHtml}
        </div>
      </div>

      <!-- Code Body -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-955/40 flex flex-col gap-4">

        <!-- Filename widget -->
        <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div class="min-w-0 flex-1">
            <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Filename</span>
            <code class="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">${promptObj.filename}</code>
          </div>
          <button id="panel-copy-filename-btn" class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copy Name</span>
          </button>
        </div>

        <!-- JSON viewport -->
        <div class="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-inner flex-1 flex flex-col overflow-hidden">
          <div class="absolute right-4 top-4 z-10">
            <button
              id="panel-copy-prompt-btn-top"
              class="p-1.5 rounded-lg border transition-colors ${
                isCopied
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-905 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400'
              }"
              title="Copy Image Prompt"
            >
              <i data-lucide="${isCopied ? 'check' : 'copy'}" class="w-4 h-4 ${isCopied ? 'text-emerald-500' : ''}"></i>
            </button>
          </div>
          <pre class="font-mono text-xs overflow-y-auto whitespace-pre leading-relaxed select-text pr-10 flex-1"><code>${highlightedHtml}</code></pre>
        </div>

        <!-- Copy Buttons Row -->
        <div class="flex flex-wrap gap-2 flex-shrink-0">
          <button id="panel-copy-negative-btn" class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all duration-200 shadow-sm">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copy Negative Prompt</span>
          </button>
          <button id="panel-copy-all-btn" class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 shadow-sm">
            <i data-lucide="copy-plus" class="w-3.5 h-3.5"></i>
            <span>Copy All</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      ${isCopied ? `
        <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-white dark:bg-slate-950 flex-shrink-0">
          <button id="panel-reset-checkmark-btn" class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all duration-200">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>Reset Checkmark</span>
          </button>
        </div>
      ` : ''}

    </div>
  `;

  // Bind panel events
  document.getElementById('panel-backdrop').onclick = closePromptPanel;
  document.getElementById('panel-close-btn').onclick = closePromptPanel;

  // Sub-tabs
  panelNode.querySelectorAll('.panel-mixed-tab').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-asset-idx'));
      const wsNameAttr = btn.getAttribute('data-ws-name');
      const wsFocusAttr = btn.getAttribute('data-ws-focus');
      renderMixedPromptPanelContent(classLabel, wsNameAttr, wsFocusAttr, idx, totalAssets);
    };
  });

  // Filename copy
  document.getElementById('panel-copy-filename-btn').onclick = () => {
    const btn = document.getElementById('panel-copy-filename-btn');
    navigator.clipboard.writeText(promptObj.filename).then(() => {
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-600">Copied!</span>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Copy Name</span>';
        lucide.createIcons();
      }, 1500);
    });
  };

  // Copy image prompt
  document.getElementById('panel-copy-prompt-btn-top').onclick = () => {
    navigator.clipboard.writeText(promptObj.image_generation_prompt).then(() => {
      setMixedCopiedStatus(classLabel, assetIdx, true);
      showToast(`Copied ${wsName} prompt for ${classLabel}! 📋✅`);
      renderMixedPromptPanelContent(classLabel, wsName, wsFocus, assetIdx, totalAssets);
      renderTenseCards();
      renderOverviewStats();
    });
  };

  // Copy negative prompt
  document.getElementById('panel-copy-negative-btn').onclick = () => {
    const btn = document.getElementById('panel-copy-negative-btn');
    navigator.clipboard.writeText(promptObj.negative_prompt).then(() => {
      showToast('Copied negative prompt! 📋');
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-600">Copied!</span>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy" class="w-3.5 h-3.5"></i><span>Copy Negative Prompt</span>';
        lucide.createIcons();
      }, 1500);
    });
  };

  // Copy all
  document.getElementById('panel-copy-all-btn').onclick = () => {
    const allText = `IMAGE PROMPT:\n${promptObj.image_generation_prompt}\n\nNEGATIVE PROMPT:\n${promptObj.negative_prompt}`;
    const btn = document.getElementById('panel-copy-all-btn');
    navigator.clipboard.writeText(allText).then(() => {
      setMixedCopiedStatus(classLabel, assetIdx, true);
      showToast('Copied all prompts! 📋✅');
      btn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-600">Copied!</span>';
      lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy-plus" class="w-3.5 h-3.5"></i><span>Copy All</span>';
        lucide.createIcons();
      }, 1500);
      renderMixedPromptPanelContent(classLabel, wsName, wsFocus, assetIdx, totalAssets);
      renderTenseCards();
      renderOverviewStats();
    });
  };

  // Reset checkmark
  const resetBtn = document.getElementById('panel-reset-checkmark-btn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      setMixedCopiedStatus(classLabel, assetIdx, false);
      showToast('Reset checkmark! 🔄');
      renderMixedPromptPanelContent(classLabel, wsName, wsFocus, assetIdx, totalAssets);
      renderTenseCards();
      renderOverviewStats();
    };
  }

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closePromptPanel();
      window.removeEventListener('keydown', escHandler);
    }
  };
  window.addEventListener('keydown', escHandler);

  lucide.createIcons();
}

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  applyTheme();
  renderClassSelector();
  renderQuickNav();
  renderOverviewStats();
  renderTenseCards();

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.onclick = () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme();
    };
  }

  lucide.createIcons();
}

// Start
document.addEventListener('DOMContentLoaded', init);
