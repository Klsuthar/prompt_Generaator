/**
 * VidyaFrame AutoPilot — Queue Manager
 * 
 * Handles all CRUD operations on the prompt queue stored in chrome.storage.local.
 * Designed for large-scale operation (10,000+ items) with chunked storage.
 * 
 * Loaded as an ES module by the background service worker.
 */

const QUEUE_KEY = 'autopilot_queue';
const STATS_KEY = 'autopilot_stats';

/**
 * Get the entire queue from storage.
 * @returns {Promise<Array>} Array of queue items
 */
export async function getQueue() {
  const result = await chrome.storage.local.get(QUEUE_KEY);
  return result[QUEUE_KEY] || [];
}

/**
 * Save the entire queue to storage.
 * @param {Array} queue
 */
export async function saveQueue(queue) {
  await chrome.storage.local.set({ [QUEUE_KEY]: queue });
}

/**
 * Add one or more prompts to the queue.
 * Deduplicates by item id — if an item with the same id exists and is pending/failed,
 * it gets replaced. Completed/skipped items are left alone.
 * 
 * @param {Array} newItems - Array of queue item objects
 * @returns {Promise<{added: number, skipped: number, total: number}>}
 */
export async function enqueue(newItems) {
  const queue = await getQueue();
  const existingIds = new Set(queue.map(item => item.id));
  
  let added = 0;
  let skipped = 0;

  for (const item of newItems) {
    if (existingIds.has(item.id)) {
      // Find existing item
      const existingIndex = queue.findIndex(q => q.id === item.id);
      const existing = queue[existingIndex];
      
      // Only replace if existing is pending or failed
      if (existing.status === 'pending' || existing.status === 'failed') {
        queue[existingIndex] = {
          ...item,
          status: 'pending',
          attempts: 0,
          error: null,
          queuedAt: Date.now()
        };
        added++;
      } else {
        skipped++;
      }
    } else {
      queue.push({
        ...item,
        status: 'pending',
        attempts: 0,
        error: null,
        queuedAt: Date.now(),
        startedAt: null,
        completedAt: null,
        generationDuration: null
      });
      added++;
    }
  }

  await saveQueue(queue);
  return { added, skipped, total: queue.length };
}

/**
 * Get the next pending item from the queue.
 * @returns {Promise<Object|null>} The next pending queue item, or null if none
 */
export async function getNextPending() {
  const queue = await getQueue();
  return queue.find(item => item.status === 'pending') || null;
}

/**
 * Update the status of a queue item by id.
 * @param {string} itemId
 * @param {Object} updates - Fields to merge into the item
 * @returns {Promise<Object|null>} The updated item, or null if not found
 */
export async function updateItem(itemId, updates) {
  const queue = await getQueue();
  const index = queue.findIndex(item => item.id === itemId);
  
  if (index === -1) return null;
  
  queue[index] = { ...queue[index], ...updates };
  await saveQueue(queue);
  return queue[index];
}

/**
 * Mark an item as "sending" (about to be injected into ChatGPT).
 * @param {string} itemId
 */
export async function markSending(itemId) {
  return updateItem(itemId, {
    status: 'sending',
    startedAt: Date.now(),
    attempts: (await getItemById(itemId))?.attempts + 1 || 1
  });
}

/**
 * Mark an item as "generating" (prompt sent, waiting for completion).
 * @param {string} itemId
 */
export async function markGenerating(itemId) {
  return updateItem(itemId, { status: 'generating' });
}

/**
 * Mark an item as completed.
 * @param {string} itemId
 * @param {number} generationDuration - How long the generation took (ms)
 */
export async function markCompleted(itemId, generationDuration = null) {
  return updateItem(itemId, {
    status: 'completed',
    completedAt: Date.now(),
    generationDuration,
    error: null
  });
}

/**
 * Mark an item as failed.
 * @param {string} itemId
 * @param {string} errorMessage
 */
export async function markFailed(itemId, errorMessage) {
  return updateItem(itemId, {
    status: 'failed',
    completedAt: Date.now(),
    error: errorMessage
  });
}

/**
 * Mark an item as skipped.
 * @param {string} itemId
 */
export async function markSkipped(itemId) {
  return updateItem(itemId, {
    status: 'skipped',
    completedAt: Date.now()
  });
}

/**
 * Get a single queue item by id.
 * @param {string} itemId
 * @returns {Promise<Object|null>}
 */
export async function getItemById(itemId) {
  const queue = await getQueue();
  return queue.find(item => item.id === itemId) || null;
}

/**
 * Reset all failed items back to pending for retry.
 * @returns {Promise<number>} Number of items reset
 */
export async function retryAllFailed() {
  const queue = await getQueue();
  let count = 0;
  
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].status === 'failed') {
      queue[i].status = 'pending';
      queue[i].error = null;
      queue[i].startedAt = null;
      queue[i].completedAt = null;
      queue[i].generationDuration = null;
      // Keep attempts count for tracking
      count++;
    }
  }
  
  await saveQueue(queue);
  return count;
}

/**
 * Remove a single item from the queue.
 * @param {string} itemId
 * @returns {Promise<boolean>}
 */
export async function removeItem(itemId) {
  const queue = await getQueue();
  const filtered = queue.filter(item => item.id !== itemId);
  
  if (filtered.length === queue.length) return false;
  
  await saveQueue(filtered);
  return true;
}

/**
 * Clear all items from the queue.
 * @returns {Promise<void>}
 */
export async function clearQueue() {
  await saveQueue([]);
}

/**
 * Clear only completed items from the queue.
 * @returns {Promise<number>} Number of items removed
 */
export async function clearCompleted() {
  const queue = await getQueue();
  const filtered = queue.filter(item => item.status !== 'completed');
  const removed = queue.length - filtered.length;
  
  await saveQueue(filtered);
  return removed;
}

/**
 * Get queue statistics.
 * @returns {Promise<Object>} Stats object with counts by status
 */
export async function getQueueStats() {
  const queue = await getQueue();
  
  const stats = {
    total: queue.length,
    pending: 0,
    sending: 0,
    generating: 0,
    completed: 0,
    failed: 0,
    skipped: 0
  };

  for (const item of queue) {
    if (stats[item.status] !== undefined) {
      stats[item.status]++;
    }
  }

  // Calculate average generation time from completed items
  const completedWithDuration = queue.filter(
    item => item.status === 'completed' && item.generationDuration > 0
  );
  
  if (completedWithDuration.length > 0) {
    const totalDuration = completedWithDuration.reduce(
      (sum, item) => sum + item.generationDuration, 0
    );
    stats.averageGenerationMs = Math.round(totalDuration / completedWithDuration.length);
  } else {
    stats.averageGenerationMs = 90000; // Default estimate: 90 seconds
  }

  // Estimated time remaining
  const remaining = stats.pending + stats.sending + stats.generating;
  stats.estimatedRemainingMs = remaining * (stats.averageGenerationMs + 5000); // +5s cooldown

  return stats;
}

/**
 * Get the currently processing item (sending or generating).
 * @returns {Promise<Object|null>}
 */
export async function getCurrentItem() {
  const queue = await getQueue();
  return queue.find(
    item => item.status === 'sending' || item.status === 'generating'
  ) || null;
}

/**
 * Reset any items stuck in "sending" or "generating" state back to pending.
 * Used for crash recovery.
 * @returns {Promise<number>} Number of items reset
 */
export async function recoverStuckItems() {
  const queue = await getQueue();
  let count = 0;
  
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].status === 'sending' || queue[i].status === 'generating') {
      queue[i].status = 'pending';
      queue[i].startedAt = null;
      count++;
    }
  }
  
  if (count > 0) {
    await saveQueue(queue);
  }
  return count;
}
