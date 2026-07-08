/**
 * VidyaFrame AutoPilot — Fetch Interceptor
 * 
 * Injected into the MAIN world (page context).
 * Intercepts fetch requests to topics.json and returns data from the extension.
 * This runs in the main world page context but does not violate the page's CSP
 * because it is loaded as an extension file declared in the manifest.
 */
(function () {
  'use strict';

  let topicsResolver = null;
  const topicsPromise = new Promise(resolve => {
    topicsResolver = resolve;
  });

  // Listen for topics data dispatched from the isolated content script
  window.addEventListener('message', (event) => {
    // Only accept messages from the same window
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'AUTOPILOT_DATA') {
      console.log('[AutoPilot] Fetch Interceptor received topics data.');
      if (topicsResolver) {
        topicsResolver(event.data.topics);
      }
    }
  });

  // Override window.fetch
  const originalFetch = window.fetch;
  window.fetch = async function (url, options) {
    const urlStr = typeof url === 'string' ? url : (url && url.url) || '';
    
    if (urlStr.includes('topics.json')) {
      console.log('[AutoPilot] Intercepted fetch for topics.json. Waiting for extension data...');
      const data = await topicsPromise;
      console.log('[AutoPilot] Returning extension data for topics.json.');
      
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return originalFetch.apply(this, arguments);
  };

  console.log('[AutoPilot] Main world fetch interceptor active.');
})();
