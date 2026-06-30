const CLASS_SEQUENCE = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8'
];

export function getIndividualClasses(classesStr) {
  const s = (classesStr || '').trim();
  if (!s) return ['Class 1'];
  
  // Split by dash or hyphen
  const parts = s.split(/-+/).map(p => p.trim());
  if (parts.length === 1) {
    return [parts[0]];
  }
  
  const start = parts[0];
  const end = parts[1];
  
  const startIndex = CLASS_SEQUENCE.findIndex(c => c.toLowerCase() === start.toLowerCase());
  const endIndex = CLASS_SEQUENCE.findIndex(c => c.toLowerCase() === end.toLowerCase());
  
  if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
    return CLASS_SEQUENCE.slice(startIndex, endIndex + 1);
  }
  
  return [start];
}

export function getClassLevel(classesStr) {
  const s = (classesStr || '').toLowerCase();
  if (s.includes('nursery') || s.includes('lkg') || s.includes('ukg') || s.includes('pre-school')) {
    return 0; // Pre-primary
  }
  const match = s.match(/\d+/);
  if (match) {
    return parseInt(match[0]);
  }
  return 1; // Fallback to Class 1
}

export function getColorPalette(subject) {
  const s = (subject || '').toLowerCase().trim();
  if (s.includes('math'))   return 'royal blue (#3B82F6) primary, soft teal accents, warm amber highlights';
  if (s.includes('english')) return 'rich violet (#8B5CF6) primary, lavender accents, cream highlights';
  if (s.includes('evs'))    return 'fresh emerald (#10B981) primary, leaf green, sky blue accents';
  if (s.includes('science')) return 'deep teal (#14B8A6) primary, electric blue, golden yellow accents';
  if (s.includes('hindi'))  return 'warm amber (#F59E0B) primary, deep orange, maroon accents';
  if (s.includes('drawing') || s.includes('art')) return 'vibrant pink (#EC4899) primary, coral, soft peach accents';
  // Sensible default for any other subject
  return 'bright blue (#3B82F6) primary, soft grey accents, warm amber highlights';
}

export function getStyleForClass(level) {
  if (level <= 0) return 'adorable kawaii-style flat vector illustration with rounded shapes and cheerful expressions — suitable for toddlers';
  if (level <= 2) return 'bright, friendly semi-cartoon clean vector illustration with bold outlines and soft shadows — age 5-7 appropriate';
  if (level <= 4) return 'clean, polished illustrated academic infographic style with labeled diagrams and clear hierarchy';
  if (level <= 6) return 'semi-realistic flat academic illustration with structured diagrams and data visualization';
  return 'clean professional academic diagram style with precise technical illustrations';
}

export function getContentItems(topic) {
  const desc = topic.description || '';
  let cleaned = desc
    .replace(/(charts and matching worksheets|practice worksheets|worksheets and charts|worksheets|charts|matching activities|for nursery|for class \d+-\d+|for class \d+|for lkg|for ukg|covering.*)/gi, '')
    .trim();
  
  cleaned = cleaned.replace(/[.,\s]+$/, '');
  
  if (!cleaned) {
    return [topic.topic_name];
  }
  
  const items = cleaned
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
    
  return items.length > 0 ? items : [topic.topic_name];
}

export function getLayout(topic, assetType, level) {
  if (assetType === 'chart') {
    if (level <= 0) {
      return '2x3 grid of large rounded visual cards, each card showing a single concept with a large colorful illustration and a bold label underneath in large rounded sans-serif font';
    }
    if (level <= 4) {
      return '3x2 or 4x2 neatly structured grid, each cell containing a titled mini-card with illustration, label, and key fact — separated by thin subtle lines';
    }
    return 'central detailed diagram with labeled arrows and pointers, supplementary info boxes in corners, clean header title bar at top';
  }
  // For worksheets, layout is handled by getWorksheetSections()
  return '';
}

// --- Worksheet Section Pools by Class Level ---
// Each pool contains distinct question/activity formats.
// We pick 4-5 sections per worksheet and rotate by index to keep each worksheet unique.

const WORKSHEET_SECTIONS_PRESCHOOL = [
  'Trace and color: large dotted outlines of objects related to the topic for tracing practice',
  'Circle the correct one: show 4 images per row, child circles the one that matches the instruction',
  'Match the columns: two columns of images connected by drawing lines between matching pairs',
  'Count and write: show groups of objects, child writes the number in a large box below',
  'Color by instruction: outline drawings with simple written color instructions (e.g., "Color the big one red")',
  'Spot the difference: two nearly identical illustrations side by side, child circles differences',
  'Draw and complete: partially drawn images that the child completes (e.g., draw the missing half)',
  'Tick (✓) or Cross (✗): simple yes/no visual questions where child marks correct or incorrect',
  'Sort and group: mixed objects that child cuts or circles to group into 2-3 categories',
  'Sequence order: 3-4 jumbled picture cards that child numbers in correct order'
];

const WORKSHEET_SECTIONS_PRIMARY = [
  'Fill in the blanks: sentences with missing words/numbers, with a word bank provided at the top',
  'Match the columns: Column A and Column B with items to connect using lines or arrows',
  'True or False: 5-6 statements where student writes T or F in the box next to each',
  'Short answer questions: 3-4 questions with 2-line answer spaces below each',
  'Label the diagram: a clear illustration with blank leader lines pointing to key parts to label',
  'Word problem / Story problem: 2-3 age-appropriate real-life scenario questions with workspace boxes',
  'Circle the correct answer: multiple-choice with 3 options per question (no checkboxes, just circle)',
  'Arrange in order: jumbled items (numbers, steps, events) that student re-orders by writing 1, 2, 3...',
  'Complete the table: a partially filled table/chart where student fills empty cells',
  'Odd one out: rows of 4-5 items where student crosses out the one that does not belong',
  'Classify and sort: a list of mixed items and 2-3 category boxes to sort them into',
  'Look and answer: an illustration or diagram followed by 3-4 observation-based questions'
];

const WORKSHEET_SECTIONS_UPPER = [
  'Multiple choice questions (MCQ): 4-5 questions with options A, B, C, D and answer circles',
  'Fill in the blanks: sentences with key terms missing (no word bank — recall-based)',
  'Match the following: two columns of terms/definitions to connect',
  'True or False with correction: statements where student marks T/F and corrects false ones',
  'Diagram labeling: a detailed diagram with numbered blank labels to fill in',
  'Short answer questions: 4-5 conceptual questions with 3-line answer spaces',
  'Reasoning / Give reasons: 2-3 "Why" or "Explain" questions with multi-line answer boxes',
  'Complete the table/chart: a data table with some cells blank for the student to compute and fill',
  'Solve step-by-step: 2-3 problems with structured workspace showing step 1, step 2, step 3 boxes',
  'Define the following: 4-5 key terms with blank lines for writing definitions',
  'Identify and classify: a list of items to sort into provided category columns',
  'Crossword or word puzzle: a small crossword grid (max 6-8 words) with clues listed below'
];

function getWorksheetSections(level, index) {
  let pool;
  if (level <= 0) {
    pool = WORKSHEET_SECTIONS_PRESCHOOL;
  } else if (level <= 4) {
    pool = WORKSHEET_SECTIONS_PRIMARY;
  } else {
    pool = WORKSHEET_SECTIONS_UPPER;
  }

  // Pick 4-5 sections, rotating start position by index so each worksheet gets different combos
  const count = (level <= 0) ? 4 : 5;
  const offset = (index * 3) % pool.length; // shift by 3 per worksheet to maximize variety
  const sections = [];
  for (let i = 0; i < count; i++) {
    sections.push(pool[(offset + i) % pool.length]);
  }
  return sections;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\/_]+/g, '-')      // Replace spaces, slashes, underscores with -
    .replace(/[^\w\-]+/g, '')       // Remove all other non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple hyphens with single -
}

export function getAssetFilename(topic, assetType, index, totalOfType, assignedClass, focusItem) {
  const cleanClass = assignedClass.toLowerCase().replace(/\s+/g, '-');
  const cleanSubject = topic.subject.toLowerCase().replace(/\s+/g, '-');
  const cleanTopic = topic.seo_slug.toLowerCase();
  
  const focusSlug = slugify(focusItem || '');
  
  let combinedTopic = cleanTopic;
  if (focusSlug && focusSlug !== cleanTopic) {
    if (focusSlug.includes(cleanTopic)) {
      combinedTopic = focusSlug;
    } else if (cleanTopic.includes(focusSlug)) {
      combinedTopic = cleanTopic;
    } else {
      combinedTopic = `${cleanTopic}-${focusSlug}`;
    }
  }

  const cleanType = assetType.toLowerCase();
  const suffix = totalOfType > 1 ? `-${index + 1}` : '';
  return `${cleanClass}-${cleanSubject}-${combinedTopic}-${cleanType}${suffix}`;
}

export function generatePrompt(topic, assetType, index = 0) {
  const totalOfType = assetType === 'chart' ? (topic.charts_count || 0) : (topic.worksheets_count || 0);
  const classesList = getIndividualClasses(topic.classes);
  const assignedClass = classesList[index % classesList.length];
  
  const classLevel = getClassLevel(assignedClass);
  const style = getStyleForClass(classLevel);
  
  const contentItems = getContentItems(topic);
  const focusItem = contentItems[index % contentItems.length];
  
  const layout = getLayout(topic, assetType, classLevel);
  const colorPalette = getColorPalette(topic.subject);
  
  const isMultiple = totalOfType > 1;
  const assetTitle = focusItem.toLowerCase() === topic.topic_name.toLowerCase()
    ? (isMultiple ? `${topic.topic_name} (Part ${index + 1})` : topic.topic_name)
    : `${topic.topic_name}: ${focusItem}`;

  let imagePrompt = '';
  if (assetType === 'chart') {
    imagePrompt = `Create a high-quality educational wall chart titled '${assetTitle}'. Target audience: ${assignedClass} students (DO NOT print class name on the image). Art style: ${style}. Color palette: ${colorPalette}. Layout: ${layout}. Content focus: clearly illustrate and label '${focusItem}' with accurate educational detail. Typography: use clean bold sans-serif headings and legible body text. Design rules: STRICT edge-to-edge layout with ZERO margin, ZERO padding, ZERO border, ZERO frame. Pure white background (#FFFFFF). The content must fill the entire canvas from edge to edge. No watermarks, no decorative borders. Print-ready at 300dpi, A4 portrait orientation.`;
  } else {
    // Build diverse worksheet sections
    const sections = getWorksheetSections(classLevel, index);
    const sectionList = sections.map((s, i) => `Section ${i + 1}: ${s}`).join('. ');

    imagePrompt = `Create a print-ready educational worksheet titled '${assetTitle}'. Target audience: ${assignedClass} students (DO NOT print class name on the worksheet). Art style: ${style}. Color palette: ${colorPalette}. Topic focus: '${focusItem}' — all questions must test different aspects and skills of this topic. IMPORTANT: The worksheet MUST have exactly ${sections.length} clearly separated sections, each using a COMPLETELY DIFFERENT question format. The sections are: ${sectionList}. Every section must have its own bold section heading (e.g., "A. Fill in the Blanks", "B. Match the Following"). DO NOT repeat the same question type across sections. Include generous blank answer spaces (lines, boxes, circles) for student responses. Typography: clean sans-serif for instructions, clear numbered questions. Design rules: STRICT edge-to-edge layout with ZERO margin, ZERO padding, ZERO border, ZERO frame. Pure white background (#FFFFFF). The content must fill the entire canvas from edge to edge. No watermarks, no decorative borders. Print-ready at 300dpi, A4 portrait orientation.`;
  }

  const negativePrompt = 'borders, frames, outlines, margins, padding, decorative borders, watermarks, class labels, grade labels, dark backgrounds, overlapping text, blurry text, distorted letters, cropped content, vignette, shadow borders, rounded corners frame, header bar, footer bar, page number, logo, brand name, stock photo style, photographic, 3D render unless specified, word search puzzle, repetitive question format, all same question type';
  const filename = getAssetFilename(topic, assetType, index, totalOfType, assignedClass, focusItem);

  return {
    filename: filename,
    assigned_class: assignedClass,
    focus_item: focusItem,
    image_generation_prompt: imagePrompt,
    negative_prompt: negativePrompt
  };
}

