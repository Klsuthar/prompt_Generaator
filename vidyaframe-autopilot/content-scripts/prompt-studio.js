/**
 * VidyaFrame AutoPilot — Prompt Studio Content Script
 * 
 * Injected into VidyaFrame Prompt Studio pages.
 * Adds AutoPilot integration buttons (Send, Queue All) to the UI
 * and communicates with the background service worker.
 * 
 * Does NOT modify existing app.js — works via DOM overlay only.
 */

(function () {
  'use strict';

  const ns = window.AUTOPILOT || {};

  // ─── Guard: Only run on Prompt Studio pages ───────────────────────
  function isPromptStudio() {
    const header = document.getElementById('app-header');
    const grid = document.getElementById('app-grid');
    if (header && grid) return true;

    const title = document.title || '';
    const url = (window.location.href || '').toLowerCase();
    return (
      title.includes('VidyaFrame') ||
      title.includes('Prompt Studio') ||
      url.includes('prompt_generaator') ||
      url.includes('promptgenerator') ||
      url.includes('klsuthar.github.io') ||
      url.endsWith('index.html') ||
      (url.includes('localhost') && window.location.pathname === '/') ||
      (url.includes('127.0.0.1') && window.location.pathname === '/')
    );
  }

  if (!isPromptStudio()) {
    return;
  }

  console.log('[AutoPilot] Prompt Studio detected — initializing integration.');

  // ─── State ────────────────────────────────────────────────────────
  let topicsData = null;
  let isExtensionReady = false;

  // Fetch topics.json immediately at document_start (dispatched to fetch-interceptor.js)
  loadTopicsData();

  // ─── Fetch Topics Data ────────────────────────────────────────────
  async function loadTopicsData() {
    try {
      const url = chrome.runtime.getURL('data/topics.json');
      const res = await fetch(url);
      topicsData = await res.json();
      
      // Dispatch data to the injected script in main world
      window.postMessage({ type: 'AUTOPILOT_DATA', topics: topicsData }, '*');
      console.log(`[AutoPilot] Loaded ${topicsData.length} topics from extension package.`);
      return;
    } catch (err) {
      console.warn('[AutoPilot] Could not load topics from extension package directly.', err);
    }
  }

  // ─── Extension Communication ──────────────────────────────────────
  function sendToBackground(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async function checkExtension() {
    try {
      const response = await sendToBackground({ action: 'PING' });
      isExtensionReady = response && response.pong;
      return isExtensionReady;
    } catch {
      isExtensionReady = false;
      return false;
    }
  }

  // ─── Queue Prompt(s) ──────────────────────────────────────────────

  async function queueSinglePrompt(topic, assetType, assetIndex) {
    if (!ns.PromptBuilder) {
      showAutoPilotToast('❌ Prompt builder not loaded', 'error');
      return;
    }

    const item = ns.PromptBuilder.buildQueueItem(topic, assetType, assetIndex);
    
    try {
      const response = await sendToBackground({
        action: 'QUEUE_PROMPTS',
        prompts: [item]
      });

      if (response && response.success) {
        showAutoPilotToast(`⚡ Queued: ${item.filename}`, 'success');
      } else {
        showAutoPilotToast(`❌ Failed to queue prompt`, 'error');
      }
    } catch (err) {
      showAutoPilotToast(`❌ Extension error: ${err.message}`, 'error');
    }
  }

  async function queueAllForTopic(topic) {
    if (!ns.PromptBuilder) {
      showAutoPilotToast('❌ Prompt builder not loaded', 'error');
      return;
    }

    const items = ns.PromptBuilder.buildAllForTopic(topic);

    try {
      const response = await sendToBackground({
        action: 'QUEUE_PROMPTS',
        prompts: items
      });

      if (response && response.success) {
        showAutoPilotToast(`⚡ Queued ${response.added} prompts for "${topic.topic_name}"`, 'success');
      }
    } catch (err) {
      showAutoPilotToast(`❌ Extension error: ${err.message}`, 'error');
    }
  }

  async function queueTypeForTopic(topic, assetType) {
    if (!ns.PromptBuilder) {
      showAutoPilotToast('❌ Prompt builder not loaded', 'error');
      return;
    }

    const items = [];
    const count = assetType === 'chart' ? (topic.charts_count || 0) : (topic.worksheets_count || 0);

    for (let i = 0; i < count; i++) {
      items.push(ns.PromptBuilder.buildQueueItem(topic, assetType, i));
    }

    try {
      const response = await sendToBackground({
        action: 'QUEUE_PROMPTS',
        prompts: items
      });

      if (response && response.success) {
        showAutoPilotToast(`⚡ Queued ${response.added} ${assetType === 'chart' ? 'charts' : 'sheets'} for "${topic.topic_name}"`, 'success');
      }
    } catch (err) {
      showAutoPilotToast(`❌ Extension error: ${err.message}`, 'error');
    }
  }

  async function queueAllFiltered() {
    if (!topicsData || !ns.PromptBuilder) {
      showAutoPilotToast('❌ Topics data not available', 'error');
      return;
    }

    // Read current filter state from the DOM
    const filteredTopics = getFilteredTopicsFromDOM();
    
    if (filteredTopics.length === 0) {
      showAutoPilotToast('⚠️ No topics match current filters', 'warning');
      return;
    }

    const items = ns.PromptBuilder.buildBatch(filteredTopics);

    try {
      const response = await sendToBackground({
        action: 'QUEUE_PROMPTS',
        prompts: items
      });

      if (response && response.success) {
        showAutoPilotToast(
          `⚡ Queued ${response.added} prompts from ${filteredTopics.length} topics` +
          (response.skipped > 0 ? ` (${response.skipped} already in queue)` : ''),
          'success'
        );
      }
    } catch (err) {
      showAutoPilotToast(`❌ Extension error: ${err.message}`, 'error');
    }
  }

  // ─── DOM Reading Helpers ──────────────────────────────────────────

  function getFilteredTopicsFromDOM() {
    if (!topicsData) return [];

    // Read filter state from sidebar controls
    const subjectBtns = document.querySelectorAll('.subject-tab-btn');
    let activeSubject = 'All';
    subjectBtns.forEach(btn => {
      // Check if button has the active styling (contains 'text-white')
      if (btn.classList.contains('text-white') || btn.className.includes('text-white')) {
        activeSubject = btn.getAttribute('data-subject') || 'All';
      }
    });

    const monthSelect = document.querySelector('#month-select');
    const activeMonth = monthSelect ? monthSelect.value : 'All';

    const statusSelect = document.querySelector('#status-select');
    const activeStatus = statusSelect ? statusSelect.value : 'All';

    const searchInput = document.querySelector('#search-input');
    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

    return topicsData.filter(topic => {
      if (activeSubject !== 'All' && topic.subject !== activeSubject) return false;
      if (activeMonth !== 'All' && topic.priority !== activeMonth) return false;
      if (activeStatus !== 'All' && topic.status !== activeStatus) return false;
      if (searchQuery) {
        const nameMatch = topic.topic_name.toLowerCase().includes(searchQuery);
        const descMatch = (topic.description || '').toLowerCase().includes(searchQuery);
        const classMatch = (topic.classes || '').toLowerCase().includes(searchQuery);
        if (!nameMatch && !descMatch && !classMatch) return false;
      }
      return true;
    });
  }

  function getTopicFromCardButton(btn) {
    const topicId = parseInt(btn.getAttribute('data-id'));
    if (!topicsData) return null;
    return topicsData.find(t => t.id === topicId) || null;
  }

  function getCurrentPanelTopic() {
    if (!topicsData) return null;
    
    // Read topic ID from the panel heading
    const panelNode = document.getElementById('app-panel');
    if (!panelNode || panelNode.classList.contains('translate-x-full')) return null;
    
    const heading = panelNode.querySelector('h2');
    if (!heading) return null;
    
    const match = heading.textContent.match(/#(\d+)/);
    if (!match) return null;
    
    const topicId = parseInt(match[1]);
    return topicsData.find(t => t.id === topicId) || null;
  }

  function getCurrentPanelAssetType() {
    const chartTab = document.getElementById('panel-type-chart');
    if (!chartTab) return 'chart';
    
    // Active tab has shadow-sm class
    return chartTab.className.includes('shadow-sm') ? 'chart' : 'worksheet';
  }

  function getCurrentAssetIndex() {
    const subTabs = document.querySelectorAll('.asset-sub-tab-btn');
    for (let i = 0; i < subTabs.length; i++) {
      if (subTabs[i].className.includes('shadow-sm') || subTabs[i].className.includes('border-indigo')) {
        return i;
      }
    }
    return 0;
  }

  // ─── UI Injection ─────────────────────────────────────────────────

  /**
   * Add AutoPilot integration buttons to the Prompt Studio UI.
   * Uses MutationObserver to inject buttons when panels open/close.
   */
  function injectUI() {
    // Inject the "Queue All Filtered" button in the grid header
    injectGridHeaderButton();

    // Watch for panel open/close to inject panel buttons
    const panelObserver = new MutationObserver(() => {
      injectPanelButtons();
    });

    const panelNode = document.getElementById('app-panel');
    if (panelNode) {
      panelObserver.observe(panelNode, { 
        attributes: true, 
        attributeFilter: ['class'],
        childList: true,
        subtree: true
      });
    }

    // Watch for grid re-renders to inject card buttons
    const gridNode = document.getElementById('app-grid');
    if (gridNode) {
      const gridObserver = new MutationObserver(() => {
        injectCardButtons();
        injectGridHeaderButton();
      });
      gridObserver.observe(gridNode, { childList: true });
    }

    // Initial injection
    injectCardButtons();
  }

  function injectGridHeaderButton() {
    const gridInfoBar = document.getElementById('grid-info-bar');
    if (!gridInfoBar) return;
    
    const parent = gridInfoBar.parentElement;
    if (!parent || parent.querySelector('.autopilot-queue-all-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'autopilot-queue-all-btn';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span>Queue All Visible</span>
    `;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      queueAllFiltered();
    };

    parent.appendChild(btn);
  }

  function injectCardButtons() {
    const cards = document.querySelectorAll('#app-grid > div');
    
    cards.forEach(card => {
      if (card.querySelector('.autopilot-card-btn')) return;

      // Find the action buttons container
      const btnGrid = card.querySelector('.grid.grid-cols-2');
      if (!btnGrid) return;

      // Find topic ID from existing buttons
      const existingBtn = card.querySelector('.card-action-btn');
      if (!existingBtn) return;
      const topicId = parseInt(existingBtn.getAttribute('data-id'));
      const topic = topicsData?.find(t => t.id === topicId);
      if (!topic) return;

      // Add a container for queue buttons (split into charts and sheets)
      const queueRow = document.createElement('div');
      queueRow.className = 'autopilot-card-btn mt-2 grid grid-cols-2 gap-2';
      
      const queueChartsBtn = document.createElement('button');
      queueChartsBtn.className = 'autopilot-card-queue-btn';
      queueChartsBtn.innerHTML = `
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <span>⚡ Charts (${topic.charts_count})</span>
      `;
      queueChartsBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        queueTypeForTopic(topic, 'chart');
      };
      
      const queueSheetsBtn = document.createElement('button');
      queueSheetsBtn.className = 'autopilot-card-queue-btn';
      queueSheetsBtn.innerHTML = `
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <span>⚡ Sheets (${topic.worksheets_count})</span>
      `;
      queueSheetsBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        queueTypeForTopic(topic, 'worksheet');
      };
      
      queueRow.appendChild(queueChartsBtn);
      queueRow.appendChild(queueSheetsBtn);
      btnGrid.parentElement.appendChild(queueRow);
    });
  }

  function injectPanelButtons() {
    const panelNode = document.getElementById('app-panel');
    if (!panelNode || panelNode.classList.contains('translate-x-full')) return;

    // Don't inject twice
    if (panelNode.querySelector('.autopilot-panel-btn')) return;

    const topic = getCurrentPanelTopic();
    if (!topic) return;

    // Find the copy buttons row
    const copyRow = panelNode.querySelector('.flex.flex-wrap.gap-2.flex-shrink-0');
    if (!copyRow) return;

    // "Send Current to AutoPilot" button
    const sendBtn = document.createElement('button');
    sendBtn.className = 'autopilot-panel-btn autopilot-send-btn';
    sendBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span>Send to AutoPilot</span>
    `;
    sendBtn.onclick = (e) => {
      e.preventDefault();
      const assetType = getCurrentPanelAssetType();
      const assetIndex = getCurrentAssetIndex();
      queueSinglePrompt(topic, assetType, assetIndex);
    };

    // "Queue All [Type]" button
    const assetType = getCurrentPanelAssetType();
    const count = assetType === 'chart' ? topic.charts_count : topic.worksheets_count;
    
    const queueAllBtn = document.createElement('button');
    queueAllBtn.className = 'autopilot-panel-btn autopilot-queue-type-btn';
    queueAllBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
      <span>Queue All ${assetType === 'chart' ? 'Charts' : 'Sheets'} (${count})</span>
    `;
    queueAllBtn.onclick = (e) => {
      e.preventDefault();
      const items = [];
      const totalOfType = assetType === 'chart' ? topic.charts_count : topic.worksheets_count;
      for (let i = 0; i < totalOfType; i++) {
        items.push(ns.PromptBuilder.buildQueueItem(topic, assetType, i));
      }
      sendToBackground({
        action: 'QUEUE_PROMPTS',
        prompts: items
      }).then(response => {
        if (response && response.success) {
          showAutoPilotToast(`⚡ Queued ${response.added} ${assetType} prompts`, 'success');
        }
      }).catch(err => {
        showAutoPilotToast(`❌ Error: ${err.message}`, 'error');
      });
    };

    copyRow.appendChild(sendBtn);
    copyRow.appendChild(queueAllBtn);
  }

  // ─── Toast Notifications ──────────────────────────────────────────

  let autopilotToastTimer = null;

  function showAutoPilotToast(message, type = 'success') {
    let toast = document.getElementById('autopilot-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'autopilot-toast';
      document.body.appendChild(toast);
    }

    const colorMap = {
      success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981' },
      error:   { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444' },
      warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#F59E0B' }
    };
    const colors = colorMap[type] || colorMap.success;

    toast.innerHTML = `
      <div style="
        display: flex; align-items: center; gap: 10px; padding: 12px 18px;
        border-radius: 12px; border: 1px solid ${colors.border};
        background: ${colors.bg}; backdrop-filter: blur(12px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
        color: ${colors.text};
        animation: autopilotSlideIn 0.2s ease-out;
      ">
        <span>${message}</span>
      </div>
    `;
    toast.style.display = 'block';

    clearTimeout(autopilotToastTimer);
    autopilotToastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  // ─── Initialization ──────────────────────────────────────────────

  async function init() {
    // Load topics data if not already loaded
    if (!topicsData) {
      await loadTopicsData();
    }

    // Check if extension background is reachable
    const ready = await checkExtension();
    if (!ready) {
      console.warn('[AutoPilot] Extension background not reachable. Retrying in 2s...');
      setTimeout(async () => {
        const retryReady = await checkExtension();
        if (retryReady) {
          console.log('[AutoPilot] Extension connected on retry.');
          injectUI();
        } else {
          console.warn('[AutoPilot] Extension still not reachable. AutoPilot buttons will not appear.');
        }
      }, 2000);
      return;
    }

    console.log('[AutoPilot] Extension connected. Injecting UI.');
    injectUI();
  }

  // Wait for DOM to be fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
  } else {
    setTimeout(init, 500);
  }

})();
