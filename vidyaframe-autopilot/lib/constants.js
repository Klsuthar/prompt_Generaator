/**
 * VidyaFrame AutoPilot — Shared Constants
 * 
 * Action types, default configuration, status enums, and storage keys
 * shared across all extension components (background, content scripts, popup).
 * 
 * This file is loaded as a plain script (not a module) by content scripts,
 * so we attach everything to a global namespace.
 */

// eslint-disable-next-line no-var
var AUTOPILOT = AUTOPILOT || {};

(function (ns) {
  'use strict';

  // ─── Message Action Types ────────────────────────────────────────────

  ns.ACTIONS = Object.freeze({
    // Prompt Studio → Background
    QUEUE_PROMPTS: 'QUEUE_PROMPTS',
    GET_STATE: 'GET_STATE',
    GET_QUEUE: 'GET_QUEUE',
    PING: 'PING',
    GET_TOPICS: 'GET_TOPICS',

    // Background → ChatGPT Content Script
    INJECT_PROMPT: 'INJECT_PROMPT',
    CHECK_READY: 'CHECK_READY',

    // ChatGPT Content Script → Background
    PROMPT_SENT: 'PROMPT_SENT',
    GENERATION_COMPLETE: 'GENERATION_COMPLETE',
    GENERATION_ERROR: 'GENERATION_ERROR',
    CHATGPT_READY: 'CHATGPT_READY',
    CHATGPT_NOT_READY: 'CHATGPT_NOT_READY',
    CHATGPT_RATE_LIMITED: 'CHATGPT_RATE_LIMITED',
    CHATGPT_LOGIN_REQUIRED: 'CHATGPT_LOGIN_REQUIRED',

    // Popup → Background (Queue Management)
    START_PROCESSING: 'START_PROCESSING',
    PAUSE_PROCESSING: 'PAUSE_PROCESSING',
    RESUME_PROCESSING: 'RESUME_PROCESSING',
    STOP_PROCESSING: 'STOP_PROCESSING',
    RETRY_FAILED: 'RETRY_FAILED',
    SKIP_CURRENT: 'SKIP_CURRENT',
    CLEAR_QUEUE: 'CLEAR_QUEUE',
    CLEAR_COMPLETED: 'CLEAR_COMPLETED',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_CONFIG: 'UPDATE_CONFIG',

    // Background → All (Broadcast State Changes)
    STATE_UPDATED: 'STATE_UPDATED',
    QUEUE_UPDATED: 'QUEUE_UPDATED',
    PROGRESS_UPDATE: 'PROGRESS_UPDATE'
  });

  // ─── Processing States ───────────────────────────────────────────────

  ns.STATES = Object.freeze({
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    STOPPING: 'STOPPING'
  });

  // ─── Queue Item Statuses ─────────────────────────────────────────────

  ns.STATUS = Object.freeze({
    PENDING: 'pending',
    SENDING: 'sending',
    GENERATING: 'generating',
    COMPLETED: 'completed',
    FAILED: 'failed',
    SKIPPED: 'skipped'
  });

  // ─── Storage Keys ────────────────────────────────────────────────────

  ns.STORAGE_KEYS = Object.freeze({
    QUEUE: 'autopilot_queue',
    STATE: 'autopilot_state',
    CONFIG: 'autopilot_config',
    STATS: 'autopilot_stats',
    CURRENT_INDEX: 'autopilot_current_index',
    CHATGPT_TAB_ID: 'autopilot_chatgpt_tab_id',
    PROMPT_STUDIO_TAB_ID: 'autopilot_ps_tab_id'
  });

  // ─── Default Configuration ───────────────────────────────────────────

  ns.DEFAULT_CONFIG = Object.freeze({
    cooldownMs: 5000,          // Delay between prompts (ms)
    maxWaitMs: 180000,         // Maximum wait for generation (3 min)
    mutationIdleMs: 3000,      // MutationObserver idle threshold
    maxRetries: 2,             // Max retry attempts per prompt
    autoStart: false,          // Auto-start when prompts are queued
    autoDownload: false,       // Future: auto-download images
    downloadPath: '',          // Future: download directory
    newConversation: false,    // Start new ChatGPT conversation per prompt
    includeNegativePrompt: false, // Include negative prompt in ChatGPT message
    notifyOnComplete: true,    // Browser notification when queue finishes
    batchSize: 500             // Max items per storage chunk
  });

  // ─── Default Stats ──────────────────────────────────────────────────

  ns.DEFAULT_STATS = Object.freeze({
    totalProcessed: 0,
    totalFailed: 0,
    totalSkipped: 0,
    averageGenerationMs: 0,
    generationTimes: [],       // Rolling window of last 20 generation times
    sessions: []               // Array of { date, count, duration }
  });

  // ─── Alarm Names ─────────────────────────────────────────────────────

  ns.ALARMS = Object.freeze({
    HEARTBEAT: 'autopilot_heartbeat',
    PROCESS_NEXT: 'autopilot_process_next',
    GENERATION_TIMEOUT: 'autopilot_generation_timeout',
    COOLDOWN: 'autopilot_cooldown'
  });

  // ─── ChatGPT Selectors ──────────────────────────────────────────────
  // These may need updating if ChatGPT changes its DOM structure.

  ns.CHATGPT_SELECTORS = Object.freeze({
    // The ProseMirror editor where text is entered
    EDITOR: '#prompt-textarea, div[contenteditable="true"].ProseMirror, textarea[data-id="root"]',
    
    // The send button
    SEND_BUTTON: 'button[data-testid="send-button"], button[aria-label="Send prompt"]',
    
    // The stop generating button (appears during generation)
    STOP_BUTTON: 'button[aria-label="Stop generating"], button[data-testid="stop-button"]',
    
    // Response messages container
    RESPONSE_CONTAINER: 'div[data-message-author-role="assistant"]',
    
    // Streaming indicator
    STREAMING_INDICATOR: '.result-streaming, [class*="result-streaming"]',
    
    // Rate limit / error messages
    RATE_LIMIT: '[class*="rate-limit"], [class*="error"]',
    
    // Login indicator
    LOGIN_PAGE: 'button[data-testid="login-button"], a[href="/auth/login"]',
    
    // New chat button
    NEW_CHAT_BUTTON: 'a[href="/"], nav a:first-child'
  });

  // ─── Prompt Studio Detection ─────────────────────────────────────────

  ns.PROMPT_STUDIO_INDICATORS = Object.freeze({
    TITLE_TEXT: 'VidyaFrame Prompt Studio',
    APP_HEADER_ID: 'app-header',
    APP_GRID_ID: 'app-grid',
    APP_PANEL_ID: 'app-panel'
  });

})(AUTOPILOT);
