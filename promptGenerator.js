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
  } else {
    if (level <= 0) {
      return 'large visual matching columns with dotted connector lines, circle-the-correct-image sections with 4 options per row, and oversized tracing/drawing boxes with grey guide outlines';
    }
    if (level <= 4) {
      return 'numbered fill-in-the-blank questions with visual hint boxes, short answer lines (___), match-the-column with connecting arrows, and a simple word/number grid';
    }
    return 'multiple-choice questions with checkbox circles (A/B/C/D), diagram labeling with blank leader lines, step-by-step worked example boxes, and a data table with empty cells to fill';
  }
}

export function getAssetFilename(topic, assetType, index, totalOfType, assignedClass) {
  const cleanClass = assignedClass.toLowerCase().replace(/\s+/g, '-');
  const cleanSubject = topic.subject.toLowerCase().replace(/\s+/g, '-');
  const cleanTopic = topic.seo_slug.toLowerCase();
  const cleanType = assetType.toLowerCase();
  const suffix = totalOfType > 1 ? `-${index + 1}` : '';
  return `${cleanClass}-${cleanSubject}-${cleanTopic}-${cleanType}${suffix}`;
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
    imagePrompt = `Create a print-ready educational worksheet titled '${assetTitle}'. Target audience: ${assignedClass} students (DO NOT print class name on the worksheet). Art style: ${style}. Color palette: ${colorPalette}. Layout: ${layout}. Content focus: exercise questions about '${focusItem}' with age-appropriate difficulty. Include numbered questions, clear instructions text at the top of each section, and generous blank answer spaces (lines, boxes, circles). Typography: clean sans-serif for instructions, mono-spaced or handwriting-style blanks for answers. Design rules: STRICT edge-to-edge layout with ZERO margin, ZERO padding, ZERO border, ZERO frame. Pure white background (#FFFFFF). The content must fill the entire canvas from edge to edge. No watermarks, no decorative borders. Print-ready at 300dpi, A4 portrait orientation.`;
  }

  const negativePrompt = 'borders, frames, outlines, margins, padding, decorative borders, watermarks, class labels, grade labels, dark backgrounds, overlapping text, blurry text, distorted letters, cropped content, vignette, shadow borders, rounded corners frame, header bar, footer bar, page number, logo, brand name, stock photo style, photographic, 3D render unless specified';
  const filename = getAssetFilename(topic, assetType, index, totalOfType, assignedClass);

  return {
    filename: filename,
    assigned_class: assignedClass,
    focus_item: focusItem,
    image_generation_prompt: imagePrompt,
    negative_prompt: negativePrompt
  };
}
