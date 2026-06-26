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

export function getColorPalette(level, subject) {
  let colorWord = 'slate';
  switch (subject) {
    case 'Mathematics':
      colorWord = 'royal blue';
      break;
    case 'English':
      colorWord = 'violet purple';
      break;
    case 'EVS':
      colorWord = 'emerald green';
      break;
    case 'Science':
      colorWord = 'dark teal';
      break;
    case 'Hindi':
      colorWord = 'warm amber orange';
      break;
    case 'Drawing':
      colorWord = 'magenta pink';
      break;
    default:
      colorWord = 'slate';
  }

  if (level <= 0) {
    return `Bright, cheerful, and inviting soft pastel palette dominated by soft ${colorWord} and gentle pastel accents. Suitable for young toddlers.`;
  }
  if (level <= 4) {
    return `Lively, clean, and modern color palette. Balanced combination of primary-adjacent tones (gentle ${colorWord} and secondary accents) against the pure white background. Print-ready, clear contrast.`;
  }
  return `Structured academic palette. Cool and professional tones (professional ${colorWord} alongside cool gray and slate gradients) for advanced learning. Clear color coding for classifications.`;
}

export function getContentItems(topic) {
  const desc = topic.description || '';
  // Clean description of generic trailer text
  let cleaned = desc
    .replace(/(charts and matching worksheets|practice worksheets|worksheets and charts|worksheets|charts|matching activities|for nursery|for class \d+-\d+|for class \d+|for lkg|for ukg|covering.*)/gi, '')
    .trim();
  
  // Remove trailing periods/commas/spaces
  cleaned = cleaned.replace(/[.,\s]+$/, '');
  
  if (!cleaned) {
    return [topic.topic_name];
  }
  
  // Split by comma or semicolon
  const items = cleaned
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
    
  return items.length > 0 ? items : [topic.topic_name];
}

export function getLayout(topic, assetType, level) {
  if (assetType === 'chart') {
    if (level <= 0) {
      return '2x3 grid of large visual cards, each containing one clear illustration with its label underneath. Large bold title at the very top.';
    }
    if (level <= 4) {
      return '3x2 or 4x2 structured grid layout. Each cell contains a clear diagram/illustration, a bold sub-header, and a brief description. Clean dividing gutters between cards.';
    }
    return 'Detailed central academic diagram with neat pointer lines pointing to labeled parts. Surrounding cards for supporting formulas, definitions, and key takeaways.';
  } else {
    // worksheet
    if (level <= 0) {
      return 'Large clean activity sections: matching column on the left and right, circle-the-correct-image block at the bottom. Ample empty space for writing or drawing.';
    }
    if (level <= 4) {
      return 'Structured page layout with 3 distinct question blocks: Section A for fill-in-the-blanks with visual boxes, Section B for short answers with clean dashed lines, and Section C for a small crossword or match-the-following grid.';
    }
    return 'Clean academic exam layout: Section A with multiple choice questions with checkbox options, Section B for diagram analysis with pointer labels to fill in, and Section C for step-by-step problem-solving inside boxed workspaces.';
  }
}

export function buildMainPrompt(topic, assetType, style, focusItem, layout, assignedClass, index, totalOfType) {
  const isMultiple = totalOfType > 1;
  const assetTitle = focusItem.toLowerCase() === topic.topic_name.toLowerCase()
    ? (isMultiple ? `${topic.topic_name} (Part ${index + 1})` : topic.topic_name)
    : `${topic.topic_name}: ${focusItem}`;

  const baseRules = `Universal Prompt Constraints:
- Pure white background (#FFFFFF). No textures, no patterns, no gradients in background.
- NO border, NO frame, NO outer decorative edge around the chart/sheet.
- Heading '${assetTitle}' placed at the top with minimal gap — no excessive white space above the title.
- Heading is bold, clean, simple sans-serif — well-designed but NOT overly stylized or decorative.
- Class level is for reference only — DO NOT show class name, grade, or subject name anywhere on the image.
- A4 Portrait format (3:4 ratio). Print-ready at 300dpi.
- Minimal background elements — content is the focus, background stays clean white.
- Text must be crystal clear and legible. No blurry or overlapping text.
- Color palette: harmonious, thoughtful, age-appropriate. Not random or garish.
- No watermarks, no logos, no copyright text.`;

  if (assetType === 'chart') {
    return `Educational ${style} wall chart titled '${assetTitle}' for teaching ${assignedClass} students.
${baseRules}
Layout Architecture: ${layout}
Primary Content Focus: Illustrate and label the concept of "${focusItem}".
Ensure the visuals are clean, age-appropriate, and structured. Every illustrated element must be clearly defined in its own block/card with a solid outline and clear text labels.`;
  } else {
    // worksheet
    return `Educational ${style} student worksheet titled '${assetTitle}' designed for ${assignedClass} students.
${baseRules}
Layout Architecture: ${layout}
Worksheet Exercises:
1. Primary Activity focusing on "${focusItem}" (e.g. fill-in-the-blanks, label diagram, or tracing exercises, with empty answer lines/boxes).
2. Review exercises related to ${topic.topic_name} appropriate for ${assignedClass} level.
Include simple and clear instructions for each section. Ample empty spaces, boxes, or dotted lines for writing answers. Clean, print-ready black & white or minimal-color activity layout.`;
  }
}

export function buildNegativePrompt() {
  return 'class label, grade label, subject name on image, border, frame, outer edge outline, decorative border, dark background, watermark, blurry text, low resolution, photo realism, overcrowded layout, excessive background elements, too much empty space above heading, overly decorative fonts';
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
  const colors = getColorPalette(classLevel, topic.subject);
  
  const contentItems = getContentItems(topic);
  const focusItem = contentItems[index % contentItems.length];
  
  const layout = getLayout(topic, assetType, classLevel);
  const mainPrompt = buildMainPrompt(topic, assetType, style, focusItem, layout, assignedClass, index, totalOfType);
  const negativePrompt = buildNegativePrompt();
  const filename = getAssetFilename(topic, assetType, index, totalOfType, assignedClass);

  return {
    filename: filename,
    asset_type: assetType,
    asset_number: index + 1,
    total_assets_of_type: totalOfType,
    assigned_class: assignedClass,
    focus_item: focusItem,
    topic: topic.topic_name,
    reference_class: `${assignedClass} (reference only — do not show on image)`,
    image_generation_prompt: mainPrompt,
    negative_prompt: negativePrompt,
    design_specs: {
      size: 'A4 Portrait',
      resolution: '2480x3508px at 300dpi',
      aspect_ratio: '3:4',
      background: '#FFFFFF pure white — no textures, no patterns',
      border: 'none',
      extra_elements: 'minimal — no unnecessary decorative elements in background'
    },
    typography: {
      heading: 'Bold, clean sans-serif. Simple but well-designed. NOT overly decorative. Clear and readable from distance.',
      heading_position: 'Top of chart — no excessive empty space above heading',
      body_text: 'Clear, legible, appropriately sized for age group',
      class_label_on_image: false,
      subject_label_on_image: false
    },
    color_guidance: colors,
    style: style,
    midjourney_params: '--ar 3:4 --style raw --v 6 --q 2',
    gpt2_usage_note: 'GPT-2 is a text-completion model and cannot generate images. Use this JSON prompt\'s \'image_generation_prompt\' field with DALL-E 3, Midjourney, Ideogram, or Stable Diffusion XL for image creation.',
    layout: layout
  };
}
