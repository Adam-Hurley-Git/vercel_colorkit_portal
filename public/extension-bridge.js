// Extension Bridge Script
// Handles communication between web app and Chrome extension

(function () {
  // Get extension ID from meta tag
  const metaExtensionId = document.querySelector('meta[name="extension-id"]');
  const EXTENSION_ID = metaExtensionId ? metaExtensionId.content : '';

  console.log('[Extension Bridge] Loaded, Extension ID:', EXTENSION_ID || 'Not configured');

  // Function to send message to extension
  function notifyExtension(message) {
    if (!EXTENSION_ID) {
      console.warn('[Extension Bridge] Extension ID not configured');
      return;
    }

    // Check if chrome.runtime is available
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('[Extension Bridge] Sending message to extension:', message.type);

      chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
        if (chrome.runtime.lastError) {
          console.log('[Extension Bridge] Extension not reachable:', chrome.runtime.lastError.message);
          console.log('[Extension Bridge] This is normal if extension is not installed or disabled');
        } else {
          console.log('[Extension Bridge] ✅ Extension received message:', response);
        }
      });
    } else {
      console.log('[Extension Bridge] Chrome runtime not available (not in Chrome or extensions disabled)');
    }
  }

  // Listen for auth success event
  window.addEventListener('colorkit:auth-success', (event) => {
    console.log('[Extension Bridge] Auth success event triggered');
    notifyExtension({
      type: 'AUTH_SUCCESS',
      timestamp: Date.now(),
    });
  });

  // Listen for payment success event
  window.addEventListener('colorkit:payment-success', (event) => {
    console.log('[Extension Bridge] Payment success event triggered');
    notifyExtension({
      type: 'PAYMENT_SUCCESS',
      timestamp: Date.now(),
    });
  });

  // Listen for logout event
  window.addEventListener('colorkit:logout', (event) => {
    console.log('[Extension Bridge] Logout event triggered');
    notifyExtension({
      type: 'LOGOUT',
      timestamp: Date.now(),
    });
  });

  // Notify extension that page loaded (optional, for debugging)
  window.addEventListener('load', () => {
    console.log('[Extension Bridge] Page loaded, notifying extension');
    notifyExtension({
      type: 'PAGE_LOADED',
      url: window.location.href,
      timestamp: Date.now(),
    });
  });

  console.log('[Extension Bridge] Event listeners registered');
})();
