/**
 * VidyaFrame AutoPilot — Background Service Worker
 * 
 * Central orchestrator for the extension.
 * Manages the processing loop: dequeue → inject → wait → mark → next.
 * 
 * Uses ES module imports for queue-manager and state-machine.
 */

import * as QueueManager from '../lib/queue-manager.js';
import * as StateMachine from '../lib/state-machine.js';

// ─── Constants (duplicated here since content script constants are IIFE-based) ──

const ACTIONS = {
  QUEUE_PROMPTS: 'QUEUE_PROMPTS',
  GET_STATE: 'GET_STATE',
  GET_QUEUE: 'GET_QUEUE',
  PING: 'PING',
  GET_TOPICS: 'GET_TOPICS',
  INJECT_PROMPT: 'INJECT_PROMPT',
  CHECK_READY: 'CHECK_READY',
  PROMPT_SENT: 'PROMPT_SENT',
  GENERATION_COMPLETE: 'GENERATION_COMPLETE',
  GENERATION_ERROR: 'GENERATION_ERROR',
  CHATGPT_READY: 'CHATGPT_READY',
  CHATGPT_NOT_READY: 'CHATGPT_NOT_READY',
  CHATGPT_RATE_LIMITED: 'CHATGPT_RATE_LIMITED',
  CHATGPT_LOGIN_REQUIRED: 'CHATGPT_LOGIN_REQUIRED',
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
  STATE_UPDATED: 'STATE_UPDATED',
  QUEUE_UPDATED: 'QUEUE_UPDATED',
  PROGRESS_UPDATE: 'PROGRESS_UPDATE'
};

const ALARMS = {
  HEARTBEAT: 'autopilot_heartbeat',
  PROCESS_NEXT: 'autopilot_process_next',
  GENERATION_TIMEOUT: 'autopilot_generation_timeout',
  COOLDOWN: 'autopilot_cooldown'
};

// ─── State ──────────────────────────────────────────────────────────

let chatGptTabId = null;
let currentItemId = null;
let processingPromise = null;
let skipRequested = false;

// ─── Initialization ─────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[AutoPilot] Extension installed/updated.');
  await StateMachine.forceState('IDLE');
  
  // Recover any stuck items from previous session
  const recovered = await QueueManager.recoverStuckItems();
  if (recovered > 0) {
    console.log(`[AutoPilot] Recovered ${recovered} stuck items.`);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[AutoPilot] Browser started — recovering state.');
  const state = await StateMachine.getState();
  
  // If we were running when browser closed, go back to IDLE
  if (state === 'RUNNING' || state === 'PAUSED' || state === 'STOPPING') {
    await StateMachine.forceState('IDLE');
    const recovered = await QueueManager.recoverStuckItems();
    if (recovered > 0) {
      console.log(`[AutoPilot] Recovered ${recovered} stuck items from previous session.`);
    }
  }
});

// ─── Message Router ─────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.action) return false;

  // Handle async responses
  handleMessage(message, sender)
    .then(response => sendResponse(response))
    .catch(err => {
      console.error('[AutoPilot] Message handler error:', err);
      sendResponse({ success: false, error: err.message });
    });

  return true; // Keep the message channel open for async response
});

async function handleMessage(message, sender) {
  switch (message.action) {

    // ─── Ping/Pong ──────────────────────────────────────────
    case ACTIONS.PING:
      return { pong: true, version: '1.0.0' };

    // ─── Queue Management ───────────────────────────────────
    case ACTIONS.QUEUE_PROMPTS: {
      const result = await QueueManager.enqueue(message.prompts || []);
      broadcastUpdate();
      
      // Auto-start if configured
      const config = await StateMachine.getConfig();
      if (config.autoStart && result.added > 0) {
        const state = await StateMachine.getState();
        if (state === 'IDLE') {
          startProcessing();
        }
      }
      
      return { success: true, ...result };
    }

    case ACTIONS.GET_QUEUE: {
      const queue = await QueueManager.getQueue();
      const stats = await QueueManager.getQueueStats();
      return { success: true, queue, stats };
    }

    case ACTIONS.GET_TOPICS: {
      try {
        const url = chrome.runtime.getURL('data/topics.json');
        const res = await fetch(url);
        const topics = await res.json();
        return { success: true, topics };
      } catch (err) {
        console.error('[AutoPilot] Failed to load topics.json:', err);
        return { success: false, error: err.message };
      }
    }

    case ACTIONS.GET_STATE: {
      const fullState = await StateMachine.getFullState();
      const stats = await QueueManager.getQueueStats();
      const current = await QueueManager.getCurrentItem();
      return { success: true, ...fullState, stats, currentItem: current };
    }

    // ─── Processing Controls ────────────────────────────────
    case ACTIONS.START_PROCESSING:
      return await startProcessing();

    case ACTIONS.PAUSE_PROCESSING:
      return await pauseProcessing();

    case ACTIONS.RESUME_PROCESSING:
      return await resumeProcessing();

    case ACTIONS.STOP_PROCESSING:
      return await stopProcessing();

    case ACTIONS.SKIP_CURRENT:
      return await skipCurrent();

    case ACTIONS.RETRY_FAILED: {
      const count = await QueueManager.retryAllFailed();
      broadcastUpdate();
      return { success: true, count };
    }

    case ACTIONS.CLEAR_QUEUE:
      await QueueManager.clearQueue();
      await stopProcessing();
      broadcastUpdate();
      return { success: true };

    case ACTIONS.CLEAR_COMPLETED: {
      const removed = await QueueManager.clearCompleted();
      broadcastUpdate();
      return { success: true, removed };
    }

    case ACTIONS.REMOVE_ITEM:
      await QueueManager.removeItem(message.itemId);
      broadcastUpdate();
      return { success: true };

    // ─── Configuration ──────────────────────────────────────
    case ACTIONS.UPDATE_CONFIG: {
      const config = await StateMachine.updateConfig(message.config);
      return { success: true, config };
    }

    // ─── ChatGPT Status Reports ─────────────────────────────
    case ACTIONS.PROMPT_SENT:
      if (message.itemId) {
        await QueueManager.markGenerating(message.itemId);
        broadcastUpdate();
      }
      return { success: true };

    default:
      return { success: false, error: `Unknown action: ${message.action}` };
  }
}

// ─── Processing Engine ──────────────────────────────────────────────

async function startProcessing() {
  const result = await StateMachine.setState('RUNNING');
  if (!result.success) {
    return { success: false, error: `Cannot start: current state is ${result.currentState}` };
  }

  console.log('[AutoPilot] Starting processing loop.');
  broadcastUpdate();
  
  // Start the heartbeat alarm to keep service worker alive
  chrome.alarms.create(ALARMS.HEARTBEAT, { periodInMinutes: 0.4 }); // Every 24 seconds
  
  // Begin processing
  processNext();
  
  return { success: true };
}

async function pauseProcessing() {
  const result = await StateMachine.setState('PAUSED');
  if (!result.success) {
    return { success: false, error: `Cannot pause: current state is ${result.currentState}` };
  }

  console.log('[AutoPilot] Processing paused.');
  chrome.alarms.clear(ALARMS.HEARTBEAT);
  broadcastUpdate();
  return { success: true };
}

async function resumeProcessing() {
  const result = await StateMachine.setState('RUNNING');
  if (!result.success) {
    return { success: false, error: `Cannot resume: current state is ${result.currentState}` };
  }

  console.log('[AutoPilot] Processing resumed.');
  chrome.alarms.create(ALARMS.HEARTBEAT, { periodInMinutes: 0.4 });
  broadcastUpdate();
  processNext();
  return { success: true };
}

async function stopProcessing() {
  const currentState = await StateMachine.getState();
  
  if (currentState === 'IDLE') {
    return { success: true };
  }

  // If currently processing, mark as stopping
  if (currentState === 'RUNNING') {
    await StateMachine.setState('STOPPING');
  }

  // Reset any in-progress items
  await QueueManager.recoverStuckItems();
  
  await StateMachine.forceState('IDLE');
  currentItemId = null;
  skipRequested = false;
  
  chrome.alarms.clear(ALARMS.HEARTBEAT);
  chrome.alarms.clear(ALARMS.PROCESS_NEXT);
  chrome.alarms.clear(ALARMS.GENERATION_TIMEOUT);
  chrome.alarms.clear(ALARMS.COOLDOWN);
  
  console.log('[AutoPilot] Processing stopped.');
  broadcastUpdate();
  return { success: true };
}

async function skipCurrent() {
  if (!currentItemId) {
    return { success: false, error: 'No item currently processing' };
  }

  skipRequested = true;
  await QueueManager.markSkipped(currentItemId);
  console.log(`[AutoPilot] Skipping item: ${currentItemId}`);
  broadcastUpdate();
  
  // Process next immediately
  processNext();
  return { success: true };
}

// ─── Main Processing Loop ───────────────────────────────────────────

async function processNext() {
  const state = await StateMachine.getState();
  
  if (state !== 'RUNNING') {
    console.log(`[AutoPilot] Not processing — state is ${state}`);
    return;
  }

  // Get next pending item
  const item = await QueueManager.getNextPending();
  
  if (!item) {
    console.log('[AutoPilot] Queue empty — all done!');
    await finishProcessing();
    return;
  }

  currentItemId = item.id;
  skipRequested = false;

  console.log(`[AutoPilot] Processing: ${item.id} (${item.filename})`);

  try {
    // Step 1: Mark as sending
    await QueueManager.markSending(item.id);
    broadcastUpdate();

    // Step 2: Ensure ChatGPT tab exists and is ready
    const tabId = await ensureChatGptTab();
    if (!tabId) {
      throw new Error('Could not open or find ChatGPT tab');
    }

    // Step 3: Wait for ChatGPT to be ready
    const ready = await waitForChatGptReady(tabId);
    if (!ready) {
      throw new Error('ChatGPT tab is not ready (may need login or is still generating)');
    }

    // Check if skip was requested during wait
    if (skipRequested) return;

    // Step 4: Send the prompt to ChatGPT content script
    const config = await StateMachine.getConfig();
    
    const response = await sendToChatGpt(tabId, {
      action: 'INJECT_PROMPT',
      text: item.promptText,
      itemId: item.id,
      config: {
        mutationIdleMs: config.mutationIdleMs,
        maxWaitMs: config.maxWaitMs
      }
    });

    // Check if skip was requested during generation
    if (skipRequested) return;

    // Step 5: Process the response
    if (response && response.action === 'GENERATION_COMPLETE') {
      await QueueManager.markCompleted(item.id, response.duration);
      console.log(`[AutoPilot] ✅ Completed: ${item.id} (${Math.round((response.duration || 0) / 1000)}s)`);
    } else if (response && response.action === 'GENERATION_ERROR') {
      const maxRetries = config.maxRetries || 2;
      const currentItem = await QueueManager.getItemById(item.id);
      
      if (currentItem && currentItem.attempts < maxRetries) {
        // Reset to pending for retry
        await QueueManager.updateItem(item.id, { 
          status: 'pending', 
          error: response.error,
          startedAt: null 
        });
        console.log(`[AutoPilot] ⚠️ Retrying: ${item.id} (attempt ${currentItem.attempts}/${maxRetries})`);
      } else {
        await QueueManager.markFailed(item.id, response.error || 'Unknown error');
        console.log(`[AutoPilot] ❌ Failed: ${item.id} — ${response.error}`);
      }
    } else {
      // Unexpected response
      await QueueManager.markFailed(item.id, 'Unexpected response from ChatGPT agent');
    }

    broadcastUpdate();

    // Step 6: Cooldown before next prompt
    const cooldown = config.cooldownMs || 5000;
    console.log(`[AutoPilot] Cooldown: ${cooldown / 1000}s before next prompt.`);
    
    await sleep(cooldown);

    // Step 7: Process next
    const currentState = await StateMachine.getState();
    if (currentState === 'RUNNING') {
      processNext();
    } else if (currentState === 'STOPPING') {
      await StateMachine.forceState('IDLE');
      broadcastUpdate();
    }

  } catch (err) {
    console.error(`[AutoPilot] Error processing ${item.id}:`, err);
    
    const config = await StateMachine.getConfig();
    const currentItem = await QueueManager.getItemById(item.id);
    
    if (currentItem && currentItem.attempts < (config.maxRetries || 2)) {
      await QueueManager.updateItem(item.id, { 
        status: 'pending', 
        error: err.message,
        startedAt: null 
      });
    } else {
      await QueueManager.markFailed(item.id, err.message);
    }
    
    broadcastUpdate();

    // Wait and try next item (don't stop the entire queue for one failure)
    await sleep(5000);
    
    const currentState = await StateMachine.getState();
    if (currentState === 'RUNNING') {
      processNext();
    }
  }
}

async function finishProcessing() {
  await StateMachine.forceState('IDLE');
  currentItemId = null;
  
  chrome.alarms.clear(ALARMS.HEARTBEAT);
  
  broadcastUpdate();

  // Send notification
  const config = await StateMachine.getConfig();
  if (config.notifyOnComplete) {
    const stats = await QueueManager.getQueueStats();
    chrome.notifications.create('autopilot-complete', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: 'VidyaFrame AutoPilot — Complete!',
      message: `All prompts processed. ✅ ${stats.completed} completed, ❌ ${stats.failed} failed, ⏭ ${stats.skipped} skipped.`,
      priority: 2
    });
  }
}

// ─── ChatGPT Tab Management ────────────────────────────────────────

async function ensureChatGptTab() {
  // Check if we have a stored tab ID
  if (chatGptTabId) {
    try {
      const tab = await chrome.tabs.get(chatGptTabId);
      if (tab && tab.url && (tab.url.includes('chatgpt.com') || tab.url.includes('chat.openai.com'))) {
        // Tab exists and is ChatGPT — activate it
        await chrome.tabs.update(chatGptTabId, { active: true });
        return chatGptTabId;
      }
    } catch {
      // Tab no longer exists
      chatGptTabId = null;
    }
  }

  // Search for an existing ChatGPT tab
  const tabs = await chrome.tabs.query({ url: ['https://chatgpt.com/*', 'https://chat.openai.com/*'] });
  
  if (tabs.length > 0) {
    chatGptTabId = tabs[0].id;
    await chrome.tabs.update(chatGptTabId, { active: true });
    await chrome.storage.local.set({ 'autopilot_chatgpt_tab_id': chatGptTabId });
    return chatGptTabId;
  }

  // No ChatGPT tab found — create one
  const newTab = await chrome.tabs.create({ url: 'https://chatgpt.com/', active: true });
  chatGptTabId = newTab.id;
  await chrome.storage.local.set({ 'autopilot_chatgpt_tab_id': chatGptTabId });
  
  // Wait for the tab to load
  await waitForTabLoad(chatGptTabId);
  
  // Extra wait for ChatGPT to initialize its JS
  await sleep(3000);
  
  return chatGptTabId;
}

function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    
    // Timeout after 30s
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, 30000);
  });
}

async function waitForChatGptReady(tabId, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await sendToChatGpt(tabId, { action: 'CHECK_READY' });
      
      if (response && response.ready) {
        return true;
      }
      
      if (response && response.action === 'CHATGPT_LOGIN_REQUIRED') {
        console.warn('[AutoPilot] ChatGPT requires login. Pausing...');
        await pauseProcessing();
        
        chrome.notifications.create('autopilot-login', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
          title: 'VidyaFrame AutoPilot — Login Required',
          message: 'Please log in to ChatGPT, then resume processing.',
          priority: 2
        });
        
        return false;
      }
      
      console.log(`[AutoPilot] ChatGPT not ready (attempt ${attempt + 1}/${maxAttempts}): ${response?.reason || 'unknown'}`);
      await sleep(2000);
      
    } catch (err) {
      console.warn(`[AutoPilot] Error checking ChatGPT readiness:`, err.message);
      await sleep(2000);
    }
  }
  
  return false;
}

function sendToChatGpt(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// ─── Alarm Handler ──────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case ALARMS.HEARTBEAT: {
      // Just keep the service worker alive
      const state = await StateMachine.getState();
      if (state === 'IDLE') {
        chrome.alarms.clear(ALARMS.HEARTBEAT);
      }
      break;
    }
    
    case ALARMS.PROCESS_NEXT: {
      const state = await StateMachine.getState();
      if (state === 'RUNNING') {
        processNext();
      }
      break;
    }
  }
});

// ─── Tab Close Detection ────────────────────────────────────────────

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === chatGptTabId) {
    console.warn('[AutoPilot] ChatGPT tab was closed.');
    chatGptTabId = null;
    
    const state = await StateMachine.getState();
    if (state === 'RUNNING') {
      console.log('[AutoPilot] Pausing due to ChatGPT tab closure.');
      await pauseProcessing();
      
      chrome.notifications.create('autopilot-tab-closed', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: 'VidyaFrame AutoPilot — Paused',
        message: 'ChatGPT tab was closed. Open ChatGPT and resume to continue.',
        priority: 1
      });
    }
  }
});

// ─── Broadcast State Updates ────────────────────────────────────────

async function broadcastUpdate() {
  try {
    const fullState = await StateMachine.getFullState();
    const stats = await QueueManager.getQueueStats();
    const currentItem = await QueueManager.getCurrentItem();

    // Broadcast to all extension pages (popup, options)
    chrome.runtime.sendMessage({
      action: ACTIONS.STATE_UPDATED,
      state: fullState.state,
      stats,
      currentItem,
      config: fullState.config
    }).catch(() => {
      // No listeners — that's fine (popup may not be open)
    });
  } catch {
    // Suppress errors when no listeners
  }
}

// ─── Utility ────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('[AutoPilot] Background service worker loaded.');
