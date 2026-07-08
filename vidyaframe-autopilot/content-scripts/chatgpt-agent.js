/**
 * VidyaFrame AutoPilot — ChatGPT Agent Content Script
 * 
 * Injected into chatgpt.com pages.
 * Handles:
 * - Receiving prompts from the background service worker
 * - Injecting text into the ChatGPT input editor
 * - Triggering the send action
 * - Detecting generation completion via GenerationDetector
 * - Reporting status back to the background
 */

(function () {
  'use strict';

  const ns = window.AUTOPILOT || {};
  const SELECTORS = ns.CHATGPT_SELECTORS || {
    EDITOR: '#prompt-textarea, div[contenteditable="true"].ProseMirror, textarea[data-id="root"]',
    SEND_BUTTON: 'button[data-testid="send-button"], button[aria-label="Send prompt"]',
    STOP_BUTTON: 'button[aria-label="Stop generating"], button[data-testid="stop-button"]',
    LOGIN_PAGE: 'button[data-testid="login-button"], a[href="/auth/login"]',
    NEW_CHAT_BUTTON: 'a[href="/"], nav a:first-child'
  };

  let isProcessing = false;
  let currentDetector = null;

  console.log('[AutoPilot] ChatGPT agent loaded.');

  // ─── Message Listener ─────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.action) return false;

    switch (message.action) {
      case 'CHECK_READY':
        handleCheckReady(sendResponse);
        return true; // async

      case 'INJECT_PROMPT':
        handleInjectPrompt(message, sendResponse);
        return true; // async

      default:
        return false;
    }
  });

  // ─── Handle CHECK_READY ───────────────────────────────────────────

  function handleCheckReady(sendResponse) {
    // Check if we're on the login page
    const loginEl = document.querySelector(SELECTORS.LOGIN_PAGE);
    if (loginEl) {
      sendResponse({ action: 'CHATGPT_LOGIN_REQUIRED', ready: false });
      return;
    }

    // Check if editor exists
    const editor = findEditor();
    if (!editor) {
      sendResponse({ action: 'CHATGPT_NOT_READY', ready: false, reason: 'Editor not found' });
      return;
    }

    // Check if currently generating (stop button visible)
    const stopBtn = document.querySelector(SELECTORS.STOP_BUTTON);
    if (stopBtn) {
      sendResponse({ action: 'CHATGPT_NOT_READY', ready: false, reason: 'Currently generating' });
      return;
    }

    if (isProcessing) {
      sendResponse({ action: 'CHATGPT_NOT_READY', ready: false, reason: 'Processing another prompt' });
      return;
    }

    sendResponse({ action: 'CHATGPT_READY', ready: true });
  }

  // ─── Handle INJECT_PROMPT ─────────────────────────────────────────

  async function handleInjectPrompt(message, sendResponse) {
    const { text, itemId, config } = message;

    if (isProcessing) {
      sendResponse({ 
        action: 'GENERATION_ERROR', 
        itemId, 
        error: 'Already processing another prompt' 
      });
      return;
    }

    isProcessing = true;
    showStatusIndicator('Injecting prompt...');

    try {
      // Step 1: Find the editor
      const editor = findEditor();
      if (!editor) {
        throw new Error('ChatGPT editor not found on page');
      }

      // Step 2: Inject the prompt text
      await injectText(editor, text);
      
      // Small delay to let ChatGPT process the input
      await sleep(500);

      // Step 3: Click the send button
      const sent = await clickSendButton();
      if (!sent) {
        throw new Error('Could not click send button');
      }

      showStatusIndicator('⏳ Generating...');

      // Notify background: prompt was sent
      chrome.runtime.sendMessage({
        action: 'PROMPT_SENT',
        itemId
      });

      // Step 4: Wait for generation to complete
      const detectorConfig = {
        mutationIdleMs: config?.mutationIdleMs || 3000,
        maxWaitMs: config?.maxWaitMs || 180000
      };

      currentDetector = new ns.GenerationDetector(detectorConfig);
      const result = await currentDetector.waitForCompletion();
      currentDetector = null;

      if (result.success) {
        showStatusIndicator('✅ Complete!', 2000);
        sendResponse({
          action: 'GENERATION_COMPLETE',
          itemId,
          duration: result.duration,
          method: result.method
        });
      } else {
        showStatusIndicator('❌ Error', 2000);
        sendResponse({
          action: 'GENERATION_ERROR',
          itemId,
          error: result.error || 'Generation failed',
          duration: result.duration
        });
      }

    } catch (err) {
      console.error('[AutoPilot] Injection error:', err);
      showStatusIndicator('❌ Error', 2000);
      sendResponse({
        action: 'GENERATION_ERROR',
        itemId,
        error: err.message
      });
    } finally {
      isProcessing = false;
    }
  }

  // ─── Editor Interaction ───────────────────────────────────────────

  /**
   * Find the ChatGPT text editor element.
   */
  function findEditor() {
    // Try each selector
    const selectors = SELECTORS.EDITOR.split(', ');
    for (const selector of selectors) {
      const el = document.querySelector(selector.trim());
      if (el) return el;
    }
    return null;
  }

  /**
   * Inject text into the ChatGPT editor.
   * Handles both ProseMirror (contenteditable) and textarea editors.
   */
  async function injectText(editor, text) {
    if (editor.tagName === 'TEXTAREA') {
      // Textarea approach
      editor.focus();
      editor.value = text;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (editor.getAttribute('contenteditable') === 'true' || editor.id === 'prompt-textarea') {
      // ProseMirror / contenteditable approach
      editor.focus();
      
      // Clear existing content
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('delete', false);
      } catch (e) {
        editor.innerHTML = '';
      }

      editor.focus();

      // Dispatch paste ClipboardEvent (ProseMirror catches this and updates React state perfectly)
      try {
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', text);
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dataTransfer
        });
        editor.dispatchEvent(pasteEvent);
      } catch (err) {
        console.warn('[AutoPilot] Paste event failed, falling back to innerHTML', err);
        editor.innerHTML = '<p>' + text + '</p>';
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Wait for the UI to process
    await sleep(300);
  }

  /**
   * Click the send button.
   * Retries a few times in case the button hasn't enabled yet.
   */
  async function clickSendButton() {
    const selectors = SELECTORS.SEND_BUTTON.split(', ');
    
    for (let attempt = 0; attempt < 5; attempt++) {
      for (const selector of selectors) {
        const btn = document.querySelector(selector.trim());
        if (btn && !btn.disabled) {
          btn.click();
          console.log(`[AutoPilot] Send button clicked (attempt ${attempt + 1})`);
          return true;
        }
      }
      
      // Also try Enter key as fallback
      if (attempt >= 2) {
        const editor = findEditor();
        if (editor) {
          editor.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
          }));
          await sleep(300);
          
          // Check if generation started (stop button appeared)
          const stopBtn = document.querySelector(SELECTORS.STOP_BUTTON);
          if (stopBtn) {
            console.log('[AutoPilot] Sent via Enter key');
            return true;
          }
        }
      }
      
      await sleep(500);
    }
    
    return false;
  }

  // ─── Status Indicator ─────────────────────────────────────────────

  let statusTimeout = null;

  function showStatusIndicator(message, autoHideMs = 0) {
    let indicator = document.getElementById('autopilot-status');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'autopilot-status';
      document.body.appendChild(indicator);
    }

    indicator.textContent = `🚀 AutoPilot: ${message}`;
    indicator.style.display = 'block';

    clearTimeout(statusTimeout);
    if (autoHideMs > 0) {
      statusTimeout = setTimeout(() => {
        indicator.style.display = 'none';
      }, autoHideMs);
    }
  }

  // ─── Utility ──────────────────────────────────────────────────────

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ─── Heartbeat ────────────────────────────────────────────────────
  // Send periodic heartbeat to keep background service worker alive
  
  setInterval(() => {
    try {
      chrome.runtime.sendMessage({ action: 'PING' }, () => {
        // Suppress errors if background is not listening
        if (chrome.runtime.lastError) { /* ignore */ }
      });
    } catch {
      // Extension context may be invalidated
    }
  }, 25000); // Every 25 seconds (service worker times out at 30s)

})();
