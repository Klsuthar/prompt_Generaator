/**
 * VidyaFrame AutoPilot — Popup Logic
 * 
 * Handles all popup UI interactions:
 * - Fetches and displays state from background service worker
 * - Renders queue list, progress, statistics
 * - Binds control buttons to background actions
 * - Live-updates via chrome.runtime.onMessage listener
 */

(function () {
  'use strict';

  // ─── DOM References ────────────────────────────────────────────────

  const DOM = {
    stateBadge:       document.getElementById('state-badge'),
    progressBar:      document.getElementById('progress-bar'),
    progressPercent:  document.getElementById('progress-percent'),
    progressText:     document.getElementById('progress-text'),
    etaText:          document.getElementById('eta-text'),
    
    currentSection:   document.getElementById('current-section'),
    currentName:      document.getElementById('current-name'),
    currentType:      document.getElementById('current-type'),
    currentClass:     document.getElementById('current-class'),
    currentElapsed:   document.getElementById('current-elapsed'),
    currentStatus:    document.getElementById('current-status'),
    
    btnStart:         document.getElementById('btn-start'),
    btnPause:         document.getElementById('btn-pause'),
    btnResume:        document.getElementById('btn-resume'),
    btnStop:          document.getElementById('btn-stop'),
    btnSkip:          document.getElementById('btn-skip'),
    btnRetry:         document.getElementById('btn-retry'),
    
    statCompleted:    document.getElementById('stat-completed'),
    statFailed:       document.getElementById('stat-failed'),
    statSkipped:      document.getElementById('stat-skipped'),
    statPending:      document.getElementById('stat-pending'),
    statAvgTime:      document.getElementById('stat-avg-time'),
    statTotal:        document.getElementById('stat-total'),
    
    queueList:        document.getElementById('queue-list'),
    btnClearCompleted: document.getElementById('btn-clear-completed'),
    btnClearQueue:    document.getElementById('btn-clear-queue'),

    settingsToggle:   document.getElementById('settings-toggle'),
    settingsArrow:    document.getElementById('settings-arrow'),
    settingsBody:     document.getElementById('settings-body'),
    settingCooldown:  document.getElementById('setting-cooldown'),
    settingMaxwait:   document.getElementById('setting-maxwait'),
    settingRetries:   document.getElementById('setting-retries'),
    settingAutostart: document.getElementById('setting-autostart'),
    settingNotify:    document.getElementById('setting-notify')
  };

  // ─── State ─────────────────────────────────────────────────────────

  let currentState = null;
  let elapsedTimer = null;

  // ─── Send Message to Background ───────────────────────────────────

  function sendAction(action, data = {}) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action, ...data }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[Popup] Message error:', chrome.runtime.lastError.message);
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: false });
        }
      });
    });
  }

  // ─── Fetch Full State ─────────────────────────────────────────────

  async function fetchState() {
    const response = await sendAction('GET_STATE');
    if (response && response.success) {
      currentState = response;
      render(response);
    }
  }

  // ─── Fetch Queue ──────────────────────────────────────────────────

  async function fetchQueue() {
    const response = await sendAction('GET_QUEUE');
    if (response && response.success) {
      renderQueueList(response.queue);
    }
  }

  // ─── Render All ───────────────────────────────────────────────────

  function render(data) {
    renderStateBadge(data.state);
    renderProgress(data.stats);
    renderCurrentItem(data.currentItem, data.state);
    renderControls(data.state, data.stats);
    renderStats(data.stats);
    renderSettings(data.config);
  }

  // ─── Render State Badge ───────────────────────────────────────────

  function renderStateBadge(state) {
    DOM.stateBadge.textContent = state;
    DOM.stateBadge.className = `state-badge state-${state.toLowerCase()}`;
  }

  // ─── Render Progress ──────────────────────────────────────────────

  function renderProgress(stats) {
    if (!stats || stats.total === 0) {
      DOM.progressBar.style.width = '0%';
      DOM.progressPercent.textContent = '0%';
      DOM.progressText.textContent = 'No prompts in queue';
      DOM.etaText.textContent = '';
      return;
    }

    const done = stats.completed + stats.failed + stats.skipped;
    const percent = Math.round((done / stats.total) * 100);
    
    DOM.progressBar.style.width = `${percent}%`;
    DOM.progressPercent.textContent = `${percent}%`;
    DOM.progressText.textContent = `${done} / ${stats.total} prompts processed`;
    
    if (stats.estimatedRemainingMs > 0 && stats.pending > 0) {
      DOM.etaText.textContent = `ETA: ${formatDuration(stats.estimatedRemainingMs)}`;
    } else {
      DOM.etaText.textContent = '';
    }
  }

  // ─── Render Current Item ──────────────────────────────────────────

  function renderCurrentItem(item, state) {
    if (!item || state === 'IDLE') {
      DOM.currentSection.style.display = 'none';
      clearInterval(elapsedTimer);
      return;
    }

    DOM.currentSection.style.display = 'block';
    DOM.currentName.textContent = `#${item.topicId} ${item.topicName}`;
    DOM.currentType.textContent = item.assetType === 'chart' ? 'Chart' : 'Sheet';
    DOM.currentType.className = `meta-chip ${item.assetType}`;
    DOM.currentClass.textContent = item.assignedClass || '—';

    if (item.status === 'sending') {
      DOM.currentStatus.textContent = '📤';
    } else if (item.status === 'generating') {
      DOM.currentStatus.textContent = '⏳';
    } else {
      DOM.currentStatus.textContent = '—';
    }

    // Live elapsed timer
    clearInterval(elapsedTimer);
    if (item.startedAt) {
      updateElapsed(item.startedAt);
      elapsedTimer = setInterval(() => updateElapsed(item.startedAt), 1000);
    } else {
      DOM.currentElapsed.textContent = '—';
    }
  }

  function updateElapsed(startedAt) {
    const elapsed = Date.now() - startedAt;
    DOM.currentElapsed.textContent = formatDuration(elapsed);
  }

  // ─── Render Controls ──────────────────────────────────────────────

  function renderControls(state, stats) {
    const hasPending = stats && stats.pending > 0;
    const hasFailed = stats && stats.failed > 0;
    const isIdle = state === 'IDLE';
    const isRunning = state === 'RUNNING';
    const isPaused = state === 'PAUSED';

    // Start button
    DOM.btnStart.disabled = !isIdle || !hasPending;
    DOM.btnStart.style.display = (isPaused) ? 'none' : 'flex';

    // Pause button
    DOM.btnPause.disabled = !isRunning;
    DOM.btnPause.style.display = isPaused ? 'none' : 'flex';

    // Resume button
    DOM.btnResume.style.display = isPaused ? 'flex' : 'none';
    DOM.btnResume.disabled = !isPaused;

    // Stop button
    DOM.btnStop.disabled = isIdle;

    // Skip button
    DOM.btnSkip.disabled = !isRunning;

    // Retry button
    DOM.btnRetry.disabled = !hasFailed;
  }

  // ─── Render Stats ─────────────────────────────────────────────────

  function renderStats(stats) {
    if (!stats) return;

    DOM.statCompleted.textContent = stats.completed;
    DOM.statFailed.textContent = stats.failed;
    DOM.statSkipped.textContent = stats.skipped;
    DOM.statPending.textContent = stats.pending;
    DOM.statTotal.textContent = stats.total;
    
    if (stats.averageGenerationMs > 0 && stats.completed > 0) {
      DOM.statAvgTime.textContent = formatDuration(stats.averageGenerationMs);
    } else {
      DOM.statAvgTime.textContent = '—';
    }
  }

  // ─── Render Queue List ────────────────────────────────────────────

  function renderQueueList(queue) {
    if (!queue || queue.length === 0) {
      DOM.queueList.innerHTML = `
        <div class="queue-empty">
          No prompts in queue.<br>
          Open Prompt Studio and click<br>"Queue All Visible" to get started.
        </div>
      `;
      return;
    }

    // Show max 100 items for performance
    const displayQueue = queue.slice(0, 100);
    const hasMore = queue.length > 100;

    let html = '';
    
    for (const item of displayQueue) {
      const icon = getStatusIcon(item.status);
      const isActive = item.status === 'sending' || item.status === 'generating';
      
      html += `
        <div class="queue-item ${isActive ? 'active' : ''}" data-id="${item.id}">
          <span class="queue-item-icon">${icon}</span>
          <span class="queue-item-name" title="${item.filename}">#${item.topicId} ${item.topicName}</span>
          <span class="queue-item-type ${item.assetType}">${item.assetType === 'chart' ? 'CHT' : 'SHT'} ${item.assetIndex + 1}</span>
          ${item.status === 'pending' || item.status === 'failed' 
            ? `<button class="queue-item-remove" data-remove-id="${item.id}" title="Remove">✕</button>` 
            : ''}
        </div>
      `;
    }

    if (hasMore) {
      html += `<div class="queue-empty">...and ${queue.length - 100} more items</div>`;
    }

    DOM.queueList.innerHTML = html;

    // Bind remove buttons
    DOM.queueList.querySelectorAll('.queue-item-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const itemId = btn.getAttribute('data-remove-id');
        await sendAction('REMOVE_ITEM', { itemId });
        fetchState();
        fetchQueue();
      });
    });
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'completed': return '✅';
      case 'failed':    return '❌';
      case 'skipped':   return '⏭';
      case 'sending':   return '📤';
      case 'generating': return '⏳';
      case 'pending':   return '⬜';
      default:          return '⬜';
    }
  }

  // ─── Render Settings ──────────────────────────────────────────────

  function renderSettings(config) {
    if (!config) return;

    DOM.settingCooldown.value = String(config.cooldownMs || 5000);
    DOM.settingMaxwait.value = String(config.maxWaitMs || 180000);
    DOM.settingRetries.value = String(config.maxRetries || 2);
    DOM.settingAutostart.checked = !!config.autoStart;
    DOM.settingNotify.checked = config.notifyOnComplete !== false;
  }

  // ─── Event Bindings ───────────────────────────────────────────────

  // Control buttons
  DOM.btnStart.addEventListener('click', async () => {
    await sendAction('START_PROCESSING');
    fetchState();
    fetchQueue();
  });

  DOM.btnPause.addEventListener('click', async () => {
    await sendAction('PAUSE_PROCESSING');
    fetchState();
  });

  DOM.btnResume.addEventListener('click', async () => {
    await sendAction('RESUME_PROCESSING');
    fetchState();
    fetchQueue();
  });

  DOM.btnStop.addEventListener('click', async () => {
    await sendAction('STOP_PROCESSING');
    fetchState();
    fetchQueue();
  });

  DOM.btnSkip.addEventListener('click', async () => {
    await sendAction('SKIP_CURRENT');
    fetchState();
    fetchQueue();
  });

  DOM.btnRetry.addEventListener('click', async () => {
    await sendAction('RETRY_FAILED');
    fetchState();
    fetchQueue();
  });

  DOM.btnClearCompleted.addEventListener('click', async () => {
    await sendAction('CLEAR_COMPLETED');
    fetchState();
    fetchQueue();
  });

  DOM.btnClearQueue.addEventListener('click', async () => {
    if (confirm('Clear the entire queue? This cannot be undone.')) {
      await sendAction('CLEAR_QUEUE');
      fetchState();
      fetchQueue();
    }
  });

  // Settings toggle
  DOM.settingsToggle.addEventListener('click', () => {
    const isOpen = DOM.settingsBody.style.display !== 'none';
    DOM.settingsBody.style.display = isOpen ? 'none' : 'flex';
    DOM.settingsArrow.classList.toggle('open', !isOpen);
  });

  // Settings changes
  function bindSettingChange(element, key, transform = (v) => v) {
    element.addEventListener('change', async () => {
      const value = element.type === 'checkbox' ? element.checked : transform(element.value);
      await sendAction('UPDATE_CONFIG', { config: { [key]: value } });
    });
  }

  bindSettingChange(DOM.settingCooldown, 'cooldownMs', Number);
  bindSettingChange(DOM.settingMaxwait, 'maxWaitMs', Number);
  bindSettingChange(DOM.settingRetries, 'maxRetries', Number);
  bindSettingChange(DOM.settingAutostart, 'autoStart');
  bindSettingChange(DOM.settingNotify, 'notifyOnComplete');

  // ─── Live Updates from Background ────────────────────────────────

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'STATE_UPDATED') {
      const data = {
        state: message.state,
        stats: message.stats,
        currentItem: message.currentItem,
        config: message.config
      };
      render(data);
      fetchQueue(); // Refresh queue list too
    }
  });

  // ─── Utility ──────────────────────────────────────────────────────

  function formatDuration(ms) {
    if (!ms || ms <= 0) return '—';
    
    const totalSeconds = Math.round(ms / 1000);
    
    if (totalSeconds < 60) {
      return `${totalSeconds}s`;
    }
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes < 60) {
      return `${minutes}m ${seconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  // ─── Initialize ───────────────────────────────────────────────────

  fetchState();
  fetchQueue();

  // Refresh every 5 seconds while popup is open
  setInterval(() => {
    fetchState();
  }, 5000);

})();
