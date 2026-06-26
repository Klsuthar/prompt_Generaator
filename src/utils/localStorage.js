const COPIED_PREFIX = 'vidyaframe_copied_';
const FILTERS_KEY = 'vidyaframe_persisted_filters';
const THEME_KEY = 'vidyaframe_theme';

export function getCopiedStatus(id, type, index) {
  try {
    return localStorage.getItem(`${COPIED_PREFIX}${id}_${type}_${index}`) === 'true';
  } catch {
    return false;
  }
}

export function setCopiedStatus(id, type, index, value) {
  try {
    if (value) {
      localStorage.setItem(`${COPIED_PREFIX}${id}_${type}_${index}`, 'true');
    } else {
      localStorage.removeItem(`${COPIED_PREFIX}${id}_${type}_${index}`);
    }
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
}

export function getAllCopiedStatuses(topics) {
  const statuses = {};
  try {
    topics.forEach(topic => {
      const chartsCount = topic.charts_count || 0;
      for (let i = 0; i < chartsCount; i++) {
        statuses[`${topic.id}_chart_${i}`] = localStorage.getItem(`${COPIED_PREFIX}${topic.id}_chart_${i}`) === 'true';
      }
      
      const worksheetsCount = topic.worksheets_count || 0;
      for (let i = 0; i < worksheetsCount; i++) {
        statuses[`${topic.id}_worksheet_${i}`] = localStorage.getItem(`${COPIED_PREFIX}${topic.id}_worksheet_${i}`) === 'true';
      }
    });
  } catch (e) {
    console.error('Error loading copied statuses', e);
  }
  return statuses;
}

export function clearAllCopiedStatuses() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(COPIED_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (e) {
    console.error('Error clearing localStorage copied statuses', e);
    return false;
  }
}

export function getPersistedFilters() {
  try {
    const data = localStorage.getItem(FILTERS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error loading filters from localStorage', e);
    return null;
  }
}

export function setPersistedFilters(filters) {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch (e) {
    console.error('Error saving filters to localStorage', e);
  }
}

export function getPersistedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

export function setPersistedTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error saving theme to localStorage', e);
  }
}
