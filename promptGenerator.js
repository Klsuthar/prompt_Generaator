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

export function getStyleForClass(level) {
  if (level <= 0) return 'cute flat cartoon illustration';
  if (level <= 2) return 'semi-cartoon clean illustration';
  if (level <= 4) return 'clean illustrated academic';
  if (level <= 6) return 'semi-realistic flat academic illustration';
  return 'clean academic diagram style';
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
      return '2x3 grid of large visual cards with titles underneath';
    }
    if (level <= 4) {
      return '3x2 or 4x2 structured grid card layout';
    }
    return 'detailed central diagram with labeled pointers';
  } else {
    if (level <= 0) {
      return 'matching columns, circle-the-correct-image blocks, and large drawing spaces';
    }
    if (level <= 4) {
      return 'fill-in-the-blanks with visual boxes, short answer lines, and simple match grids';
    }
    return 'multiple choice checkboxes, diagram labeling, and step-by-step boxed workspaces';
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
  
  const isMultiple = totalOfType > 1;
  const assetTitle = focusItem.toLowerCase() === topic.topic_name.toLowerCase()
    ? (isMultiple ? `${topic.topic_name} (Part ${index + 1})` : topic.topic_name)
    : `${topic.topic_name}: ${focusItem}`;

  let imagePrompt = '';
  if (assetType === 'chart') {
    imagePrompt = `An educational wall chart for children titled '${assetTitle}', designed for ${assignedClass} level (reference only — DO NOT write '${assignedClass}', grade label, or class text anywhere on the image itself). Strict edge-to-edge layout: zero margin and zero padding, where illustrations and text extend almost to the canvas boundaries. Pure white background (#FFFFFF) with absolutely no borders, outlines, or frames. Clear and legible ${style} elements illustrating and labeling "${focusItem}". Harmonious color palette. No watermarks.`;
  } else {
    imagePrompt = `A print-ready student worksheet titled '${assetTitle}', designed for ${assignedClass} level (reference only — DO NOT write '${assignedClass}', grade label, or class text anywhere on the worksheet itself). Strict edge-to-edge layout: zero margin and zero padding, where questions and writing sections extend almost to the canvas boundaries. Pure white background (#FFFFFF) with absolutely no borders, outlines, or frames. Simple ${style} exercises: ${layout}, focusing on "${focusItem}". Ample blank spaces, lines, and boxes for writing answers, with clear simple instructions.`;
  }

  const negativePrompt = "borders, frames, outlines, margins, padding, decorative borders, watermarks, class labels, grade labels, dark backgrounds, overlapping text";
  const filename = getAssetFilename(topic, assetType, index, totalOfType, assignedClass);

  return {
    filename: filename,
    assigned_class: assignedClass,
    focus_item: focusItem,
    image_generation_prompt: imagePrompt,
    negative_prompt: negativePrompt
  };
}
