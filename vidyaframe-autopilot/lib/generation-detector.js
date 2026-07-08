/**
 * VidyaFrame AutoPilot — Generation Detector
 * 
 * Multi-signal detection engine for determining when ChatGPT
 * has finished generating a response.
 * 
 * Signals used (in priority order):
 * 1. MutationObserver on response container — watches for DOM idle
 * 2. "Stop generating" button disappearance
 * 3. Send button re-enabled
 * 4. Configurable timeout fallback
 * 
 * This runs as a plain script in the ChatGPT content script context.
 */

// eslint-disable-next-line no-var
var AUTOPILOT = AUTOPILOT || {};

(function (ns) {
  'use strict';

  class GenerationDetector {
    constructor(options = {}) {
      this.mutationIdleMs = options.mutationIdleMs || 3000;
      this.maxWaitMs = options.maxWaitMs || 180000;
      
      this._observer = null;
      this._mutationIdleTimer = null;
      this._maxWaitTimer = null;
      this._pollInterval = null;
      this._startTime = null;
      this._resolved = false;
    }

    /**
     * Wait for ChatGPT to finish generating.
     * Returns a promise that resolves when generation is complete.
     * 
     * @returns {Promise<{success: boolean, method: string, duration: number, error?: string}>}
     */
    waitForCompletion() {
      this._startTime = Date.now();
      this._resolved = false;

      return new Promise((resolve) => {
        const finish = (method, success = true, error = null) => {
          if (this._resolved) return;
          this._resolved = true;
          this.cleanup();

          const duration = Date.now() - this._startTime;
          console.log(`[AutoPilot] Generation ${success ? 'complete' : 'failed'}: ${method} (${Math.round(duration / 1000)}s)`);
          resolve({ success, method, duration, error });
        };

        // ─── Signal 1: MutationObserver ──────────────────────────
        this._setupMutationObserver(finish);

        // ─── Signal 2 & 3: Poll for button states ───────────────
        this._setupButtonPolling(finish);

        // ─── Signal 4: Absolute timeout fallback ─────────────────
        this._maxWaitTimer = setTimeout(() => {
          // Check if there's actually content — if so, consider it success
          const hasResponse = this._hasAssistantResponse();
          finish(
            'timeout-fallback',
            hasResponse,
            hasResponse ? null : 'Maximum wait time exceeded with no response detected'
          );
        }, this.maxWaitMs);
      });
    }

    /**
     * Set up MutationObserver on the most recent assistant response.
     */
    _setupMutationObserver(finish) {
      // Wait a moment for the response to start appearing
      setTimeout(() => {
        if (this._resolved) return;

        const responseContainer = this._getResponseContainer();
        if (!responseContainer) {
          console.warn('[AutoPilot] Could not find response container for MutationObserver');
          return; // Fall through to polling/timeout
        }

        this._observer = new MutationObserver(() => {
          if (this._resolved) return;

          // Reset the idle timer on every mutation
          clearTimeout(this._mutationIdleTimer);
          this._mutationIdleTimer = setTimeout(() => {
            if (this._resolved) return;

            // Confirm: no streaming indicator and no stop button
            const isStillStreaming = this._isStreaming();
            if (!isStillStreaming) {
              finish('mutation-idle-confirmed');
            }
            // If still streaming, the observer will keep firing
          }, this.mutationIdleMs);
        });

        this._observer.observe(responseContainer, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }, 2000); // 2s delay to let the response start
    }

    /**
     * Poll for button state changes as a secondary signal.
     */
    _setupButtonPolling(finish) {
      let wasGenerating = false;

      this._pollInterval = setInterval(() => {
        if (this._resolved) return;

        const stopBtn = this._findStopButton();
        const sendBtn = this._findSendButton();

        if (stopBtn) {
          wasGenerating = true;
        }

        // If we saw the stop button before and now it's gone → done
        if (wasGenerating && !stopBtn) {
          // Small delay to let final DOM updates settle
          setTimeout(() => {
            if (this._resolved) return;
            finish('stop-button-disappeared');
          }, 1000);
          return;
        }

        // Check for error states
        const errorEl = document.querySelector(
          '[class*="error-message"], [class*="text-red"], .text-red-500'
        );
        if (errorEl && wasGenerating) {
          finish('error-detected', false, errorEl.textContent?.trim() || 'ChatGPT error');
        }
      }, 1000);
    }

    /**
     * Find the most recent assistant response container.
     */
    _getResponseContainer() {
      const selectors = ns.CHATGPT_SELECTORS;
      
      // Get all assistant response divs
      const responses = document.querySelectorAll(
        selectors?.RESPONSE_CONTAINER || 'div[data-message-author-role="assistant"]'
      );
      
      if (responses.length > 0) {
        return responses[responses.length - 1]; // Last (most recent) response
      }

      // Fallback: find the main conversation area
      const mainArea = document.querySelector('main .flex.flex-col.items-center');
      return mainArea || document.querySelector('main');
    }

    /**
     * Check if ChatGPT is currently streaming.
     */
    _isStreaming() {
      const selectors = ns.CHATGPT_SELECTORS;
      
      // Check for streaming indicator class
      const streamingEl = document.querySelector(
        selectors?.STREAMING_INDICATOR || '.result-streaming, [class*="result-streaming"]'
      );
      if (streamingEl) return true;

      // Check for stop button
      const stopBtn = this._findStopButton();
      if (stopBtn) return true;

      return false;
    }

    /**
     * Find the "Stop generating" button.
     */
    _findStopButton() {
      const selectors = ns.CHATGPT_SELECTORS;
      return document.querySelector(
        selectors?.STOP_BUTTON || 'button[aria-label="Stop generating"], button[data-testid="stop-button"]'
      );
    }

    /**
     * Find the Send button.
     */
    _findSendButton() {
      const selectors = ns.CHATGPT_SELECTORS;
      return document.querySelector(
        selectors?.SEND_BUTTON || 'button[data-testid="send-button"], button[aria-label="Send prompt"]'
      );
    }

    /**
     * Check if there's at least one assistant response on the page.
     */
    _hasAssistantResponse() {
      const responses = document.querySelectorAll(
        'div[data-message-author-role="assistant"]'
      );
      return responses.length > 0;
    }

    /**
     * Clean up all timers and observers.
     */
    cleanup() {
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      clearTimeout(this._mutationIdleTimer);
      clearTimeout(this._maxWaitTimer);
      clearInterval(this._pollInterval);
    }
  }

  ns.GenerationDetector = GenerationDetector;

})(AUTOPILOT);
