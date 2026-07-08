/**
 * VidyaFrame AutoPilot — State Machine
 * 
 * Manages the processing state (IDLE → RUNNING → PAUSED → IDLE)
 * with guards for valid transitions and persistent state storage.
 * 
 * Loaded as an ES module by the background service worker.
 */

const STATE_KEY = 'autopilot_state';
const CONFIG_KEY = 'autopilot_config';

// Valid state transitions
const TRANSITIONS = {
  IDLE:     ['RUNNING'],
  RUNNING:  ['PAUSED', 'IDLE', 'STOPPING'],
  PAUSED:   ['RUNNING', 'IDLE'],
  STOPPING: ['IDLE']
};

const DEFAULT_CONFIG = {
  cooldownMs: 5000,
  maxWaitMs: 180000,
  mutationIdleMs: 3000,
  maxRetries: 2,
  autoStart: false,
  autoDownload: false,
  downloadPath: '',
  newConversation: false,
  includeNegativePrompt: false,
  notifyOnComplete: true,
  batchSize: 500
};

/**
 * Get the current processing state.
 * @returns {Promise<string>} Current state (IDLE, RUNNING, PAUSED, STOPPING)
 */
export async function getState() {
  const result = await chrome.storage.local.get(STATE_KEY);
  return result[STATE_KEY] || 'IDLE';
}

/**
 * Set the processing state with transition validation.
 * @param {string} newState
 * @returns {Promise<{success: boolean, previousState: string, currentState: string}>}
 */
export async function setState(newState) {
  const currentState = await getState();
  
  // Allow same-state "transitions" (idempotent)
  if (currentState === newState) {
    return { success: true, previousState: currentState, currentState: newState };
  }
  
  // Validate transition
  const allowedTransitions = TRANSITIONS[currentState] || [];
  if (!allowedTransitions.includes(newState)) {
    console.warn(
      `[AutoPilot] Invalid state transition: ${currentState} → ${newState}. ` +
      `Allowed: ${allowedTransitions.join(', ')}`
    );
    return { success: false, previousState: currentState, currentState };
  }
  
  await chrome.storage.local.set({ [STATE_KEY]: newState });
  console.log(`[AutoPilot] State: ${currentState} → ${newState}`);
  return { success: true, previousState: currentState, currentState: newState };
}

/**
 * Force-set state without transition validation.
 * Use only for crash recovery.
 * @param {string} state
 */
export async function forceState(state) {
  await chrome.storage.local.set({ [STATE_KEY]: state });
}

/**
 * Check if processing is currently active.
 * @returns {Promise<boolean>}
 */
export async function isRunning() {
  const state = await getState();
  return state === 'RUNNING';
}

/**
 * Check if processing is paused.
 * @returns {Promise<boolean>}
 */
export async function isPaused() {
  const state = await getState();
  return state === 'PAUSED';
}

/**
 * Check if the system is idle.
 * @returns {Promise<boolean>}
 */
export async function isIdle() {
  const state = await getState();
  return state === 'IDLE';
}

// ─── Configuration Management ──────────────────────────────────────────

/**
 * Get the current configuration, merged with defaults.
 * @returns {Promise<Object>}
 */
export async function getConfig() {
  const result = await chrome.storage.local.get(CONFIG_KEY);
  return { ...DEFAULT_CONFIG, ...(result[CONFIG_KEY] || {}) };
}

/**
 * Update configuration (partial update — merges with existing).
 * @param {Object} updates
 * @returns {Promise<Object>} The full updated config
 */
export async function updateConfig(updates) {
  const current = await getConfig();
  const updated = { ...current, ...updates };
  await chrome.storage.local.set({ [CONFIG_KEY]: updated });
  return updated;
}

/**
 * Reset configuration to defaults.
 * @returns {Promise<Object>}
 */
export async function resetConfig() {
  await chrome.storage.local.set({ [CONFIG_KEY]: DEFAULT_CONFIG });
  return { ...DEFAULT_CONFIG };
}

// ─── Full State Snapshot ───────────────────────────────────────────────

/**
 * Get a complete state snapshot (state + config + tab IDs).
 * Used by the popup to render the full UI.
 * @returns {Promise<Object>}
 */
export async function getFullState() {
  const result = await chrome.storage.local.get([
    STATE_KEY,
    CONFIG_KEY,
    'autopilot_chatgpt_tab_id',
    'autopilot_ps_tab_id'
  ]);
  
  return {
    state: result[STATE_KEY] || 'IDLE',
    config: { ...DEFAULT_CONFIG, ...(result[CONFIG_KEY] || {}) },
    chatGptTabId: result['autopilot_chatgpt_tab_id'] || null,
    promptStudioTabId: result['autopilot_ps_tab_id'] || null
  };
}
