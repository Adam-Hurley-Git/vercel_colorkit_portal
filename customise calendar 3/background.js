// ColorKit Background Service Worker (Manifest V3)
import { CONFIG, debugLog } from './config.production.js';
import { forceRefreshSubscription, validateSubscription } from './lib/subscription-validator.js';

// Service Worker Installation
chrome.runtime.onInstalled.addListener(async (details) => {
  debugLog('Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First time install
    chrome.storage.local.set({
      firstInstall: true,
      installDate: Date.now(),
    });
  }

  // Register with Web Push API for push notifications
  // This allows server to send instant updates when subscription changes
  if (CONFIG.VAPID_PUBLIC_KEY) {
    debugLog('Scheduling Web Push registration with VAPID public key');

    // Small delay to ensure service worker is fully initialized
    setTimeout(() => {
      ensureWebPushSubscription();
    }, 2000);
  } else {
    console.warn('⚠️ VAPID public key not configured, skipping push registration');
  }

  // OPTIMIZED: Setup 3-day validation alarm (backup check at 4 AM every 3 days)
  // This ensures subscription status is checked periodically
  // even if push notifications fail
  // Reduced from daily to every 3 days since push notifications are reliable
  const now = new Date();
  const next4AM = new Date(now);
  next4AM.setHours(4, 0, 0, 0);
  if (next4AM <= now) {
    next4AM.setDate(next4AM.getDate() + 1);
  }

  chrome.alarms.create('periodic-subscription-check', {
    when: next4AM.getTime(),
    periodInMinutes: 4320, // 72 hours (3 days)
  });

  debugLog('3-day subscription check alarm set for:', next4AM.toLocaleString());
});

// Service Worker Startup
// OPTIMIZED: Only ensure push subscription is registered on startup
// No need to validate subscription - storage already has current state
chrome.runtime.onStartup.addListener(() => {
  debugLog('Browser started, ensuring Web Push subscription registered...');

  if (CONFIG.VAPID_PUBLIC_KEY) {
    setTimeout(() => {
      // Only register push subscription, don't force validation
      // Validation happens via push notifications and 3-day alarm
      ensureWebPushSubscription();
    }, 2000);
  }
});

// Web Push Message Listener
// Receives instant notifications from server when subscription changes
// IMPORTANT: Push is just an "invalidate cache" signal - always re-validate with server
self.addEventListener('push', async (event) => {
  debugLog('Web Push received');

  try {
    const data = event.data ? event.data.json() : {};
    debugLog('Push data:', data);

    // Don't trust push payload - treat it as an invalidate signal
    // Always fetch authoritative state from server
    debugLog('Push received - re-validating subscription from server...');

    // Force refresh from server (bypasses cache)
    const result = await forceRefreshSubscription();
    debugLog('Server validation result:', result.isActive ? 'Active' : 'Inactive');

    // Update extension state based on server response
    if (!result.isActive && result.reason !== 'no_session') {
      debugLog('Subscription inactive - locking extension');
      await handleWebAppMessage({ type: 'SUBSCRIPTION_CANCELLED' });
    } else if (result.isActive) {
      debugLog('Subscription active - ensuring extension is unlocked');
      await handleWebAppMessage({ type: 'SUBSCRIPTION_UPDATED' });
    }

    // Notify popup if open
    notifyPopup({ type: 'SUBSCRIPTION_STATUS', payload: result });
  } catch (error) {
    console.error('Error handling push notification:', error);
  }
});

// Alarm Listeners - Periodic validation (every 3 days)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'periodic-subscription-check') {
    debugLog('Running periodic (3-day) subscription validation...');

    try {
      const result = await forceRefreshSubscription();
      debugLog('Periodic validation complete:', result.isActive ? 'Active' : 'Inactive');

      // If subscription is no longer active, trigger cancellation handler
      // This will update storage and broadcast to all calendar tabs
      if (!result.isActive && result.reason !== 'no_session') {
        await handleWebAppMessage({ type: 'SUBSCRIPTION_CANCELLED' });
      }
    } catch (error) {
      console.error('Periodic validation failed:', error);
    }
  }
});

// Listen for messages from web app (externally_connectable)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  debugLog('External message received from:', sender.url);

  // Verify message is from our web app
  if (sender.url && sender.url.startsWith(CONFIG.WEB_APP_URL)) {
    handleWebAppMessage(message);
    sendResponse({ received: true, status: 'success' });
  } else {
    debugLog('Message from unauthorized source:', sender.url);
    sendResponse({ received: false, status: 'unauthorized' });
  }

  return true; // Required for async sendResponse
});

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debugLog('Internal message received:', message.type);

  switch (message.type) {
    case 'CHECK_AUTH':
      checkAuthStatus().then(sendResponse);
      return true; // Required for async

    case 'CHECK_SUBSCRIPTION':
      // Content script asking if subscription is active
      checkSubscriptionStatus().then(sendResponse);
      return true; // Required for async

    case 'OPEN_WEB_APP':
      const url = message.path || '/onboarding';
      chrome.tabs.create({ url: `${CONFIG.WEB_APP_URL}${url}` });
      sendResponse({ opened: true });
      break;

    case 'CLEAR_AUTH':
      clearAuthData().then(() => {
        sendResponse({ cleared: true });
      });
      return true;

    case 'ENSURE_PUSH':
      // Optional: Allow popup/content script to trigger push subscription check
      ensureWebPushSubscription().then(() => {
        sendResponse({ initiated: true });
      });
      return true;

    default:
      sendResponse({ error: 'Unknown message type' });
  }

  return true;
});

// Handle messages from web app
async function handleWebAppMessage(message) {
  debugLog('Handling web app message:', message.type);

  switch (message.type) {
    case 'AUTH_SUCCESS':
      // Store Supabase session tokens
      const sessionData = {
        authenticated: true,
        authTimestamp: Date.now(),
      };

      // If session data provided, store it
      if (message.session) {
        sessionData.supabaseSession = {
          access_token: message.session.access_token,
          refresh_token: message.session.refresh_token,
          user: message.session.user,
        };
        debugLog('Supabase session tokens received and stored');
      }

      // If subscription status provided, store it
      if (message.subscriptionStatus) {
        sessionData.subscriptionActive = message.subscriptionStatus.hasSubscription;
        sessionData.subscriptionStatus = {
          isActive: message.subscriptionStatus.hasSubscription,
          status: message.subscriptionStatus.status,
          message: message.subscriptionStatus.hasSubscription ? 'Subscription active' : 'No active subscription',
          dataSource: 'auth_success',
        };
        sessionData.lastChecked = Date.now(); // Set cache timestamp
        debugLog('Subscription status:', message.subscriptionStatus);
      }

      await chrome.storage.local.set(sessionData);

      // If there's a pending push subscription, register it now that we have a session
      const { pendingPushSubscription, pushSubscription } = await chrome.storage.local.get([
        'pendingPushSubscription',
        'pushSubscription',
      ]);
      if (pendingPushSubscription) {
        debugLog('Found pending push subscription, registering now...');
        await registerPushSubscription(pendingPushSubscription);
      }

      // If we have a stored push subscription, validate it with backend now that we're logged in
      // This handles the case where extension subscribed before user logged in
      if (pushSubscription && !pendingPushSubscription) {
        debugLog('User logged in, validating stored push subscription...');
        const isValid = await validateSubscriptionWithBackend(pushSubscription);
        if (!isValid) {
          debugLog('Stored subscription not in backend, registering it now...');
          await registerPushSubscription(pushSubscription);
        }
      }

      // Notify popup if open
      notifyPopup({ type: 'AUTH_UPDATED' });
      debugLog('Auth success saved with session tokens');
      break;

    case 'PAYMENT_SUCCESS':
      // Clear old cache first to avoid conflicts
      await chrome.storage.local.remove(['lastChecked']);

      // Set subscription state
      await chrome.storage.local.set({
        subscriptionActive: true,
        subscriptionStatus: {
          isActive: true,
          status: 'active',
          message: 'Subscription active',
          dataSource: 'payment_success',
        },
        subscriptionTimestamp: Date.now(),
        lastChecked: Date.now(), // Set cache timestamp so popup doesn't re-fetch
      });

      // Notify popup
      notifyPopup({ type: 'SUBSCRIPTION_UPDATED' });

      // Broadcast to all calendar tabs to re-enable features
      await broadcastToCalendarTabs({ type: 'SUBSCRIPTION_UPDATED' });

      debugLog('Payment success saved - subscription now active, content scripts notified');
      break;

    case 'SUBSCRIPTION_CANCELLED':
      // Subscription was cancelled - update status
      await chrome.storage.local.set({
        subscriptionActive: false,
        subscriptionStatus: {
          isActive: false,
          status: 'cancelled',
          reason: 'subscription_cancelled',
          message: 'Subscription cancelled',
          dataSource: 'cancellation_event',
        },
        subscriptionTimestamp: Date.now(),
        lastChecked: Date.now(), // Set cache timestamp
      });

      // Notify popup to show "Get Started" button
      notifyPopup({ type: 'SUBSCRIPTION_UPDATED' });

      // IMPORTANT: Broadcast to all calendar tabs to disable features immediately
      await broadcastToCalendarTabs({ type: 'SUBSCRIPTION_CANCELLED' });

      debugLog('Subscription cancelled - cache cleared, content scripts notified, extension blocked');
      break;

    case 'LOGOUT':
      await clearAuthData();
      notifyPopup({ type: 'AUTH_UPDATED' });
      debugLog('Logout processed');
      break;

    case 'PAGE_LOADED':
      // Web app page loaded - could use for heartbeat
      debugLog('Web app page loaded');
      break;

    default:
      debugLog('Unknown web app message type:', message.type);
  }
}

// Check current auth status
async function checkAuthStatus() {
  const data = await chrome.storage.local.get([
    'authenticated',
    'subscriptionActive',
    'authTimestamp',
    'subscriptionTimestamp',
  ]);

  return {
    authenticated: data.authenticated || false,
    subscriptionActive: data.subscriptionActive || false,
    authTimestamp: data.authTimestamp || null,
    subscriptionTimestamp: data.subscriptionTimestamp || null,
  };
}

// Check subscription status using validator (for content scripts)
async function checkSubscriptionStatus() {
  try {
    const result = await validateSubscription();

    debugLog('Subscription check result:', result.isActive ? 'Active' : 'Inactive');

    return {
      isActive: result.isActive || false,
      status: result.status || 'unknown',
      reason: result.reason || null,
    };
  } catch (error) {
    console.error('Subscription check failed:', error);
    return {
      isActive: false,
      status: 'error',
      reason: 'validation_failed',
    };
  }
}

// Broadcast message to all Google Calendar tabs
async function broadcastToCalendarTabs(message) {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://calendar.google.com/*' });
    debugLog(`Broadcasting ${message.type} to ${tabs.length} calendar tab(s)`);

    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab might not have content script loaded yet
          debugLog('Could not send to tab:', tab.id);
        });
      }
    }
  } catch (error) {
    console.error('Failed to broadcast to tabs:', error);
  }
}

// Clear all auth data
async function clearAuthData() {
  await chrome.storage.local.remove([
    'authenticated',
    'subscriptionActive',
    'authTimestamp',
    'subscriptionTimestamp',
    'subscriptionStatus',
    'lastChecked',
    'supabaseSession', // Clear Supabase session tokens
  ]);

  debugLog('Auth data and session tokens cleared');
}

// Notify popup of updates
function notifyPopup(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup might not be open, that's okay
    debugLog('Popup not open to receive message');
  });
}

// Global flag to prevent concurrent push subscription attempts
let subscribing = false;

// Helper: Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper: validate subscription with backend
async function validateSubscriptionWithBackend(subscription) {
  try {
    // Get current Supabase session
    const { supabaseSession } = await chrome.storage.local.get('supabaseSession');

    if (!supabaseSession || !supabaseSession.access_token) {
      debugLog('No session available for validation, will validate after login');
      return false;
    }

    const resp = await fetch(`${CONFIG.WEB_APP_URL}/api/extension/validate-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseSession.access_token}`,
      },
      body: JSON.stringify({ subscription }),
    });

    if (!resp.ok) {
      debugLog('Backend validation failed:', resp.status);
      return false;
    }

    const { valid } = await resp.json();
    return !!valid;
  } catch (error) {
    debugLog('Backend validation error:', error?.message);
    return false;
  }
}

// Main: ensure we have a push subscription and the backend accepts it
// Uses storage-first approach to avoid unnecessary re-subscription
async function ensureWebPushSubscription() {
  if (subscribing) {
    debugLog('Push subscription already in progress, skipping...');
    return;
  }

  subscribing = true;

  try {
    // Get the service worker registration (we're already in a service worker)
    const registration = self.registration;

    // Check if we already have a subscription stored
    const { pushSubscription } = await chrome.storage.local.get(['pushSubscription']);

    if (pushSubscription) {
      debugLog('Found stored push subscription, validating with backend...');
      const ok = await validateSubscriptionWithBackend(pushSubscription);
      if (ok) {
        debugLog('✅ Stored push subscription is valid, no re-subscription needed');
        return;
      }
      debugLog('Stored subscription is invalid or not in backend, will subscribe fresh');
    } else {
      debugLog('No stored push subscription found, will subscribe fresh');
    }

    // Subscribe to push notifications
    debugLog('Subscribing to Web Push with VAPID public key...');

    const applicationServerKey = urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);

    let subscription;
    let subscriptionType = 'silent';

    try {
      // Try silent push first (Chrome 121+)
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: false, // Silent push - no notifications required (Chrome 121+)
        applicationServerKey: applicationServerKey,
      });
      debugLog('✅ Web Push subscription successful (silent mode)!');
    } catch (silentPushError) {
      debugLog('⚠️ Silent push not supported, falling back to visible notifications...');
      debugLog('   Error:', silentPushError?.message || silentPushError);

      // Fall back to visible notifications (Chrome < 121)
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true, // Visible notifications - fallback for older Chrome
          applicationServerKey: applicationServerKey,
        });
        subscriptionType = 'visible';
        debugLog('✅ Web Push subscription successful (visible mode - fallback)');

        // Store flag to show Chrome update notice later
        await chrome.storage.local.set({ shouldShowChromeUpdateNotice: true });
      } catch (visiblePushError) {
        throw new Error(`Both silent and visible push failed: ${visiblePushError?.message || visiblePushError}`);
      }
    }

    debugLog('   Subscription endpoint:', subscription.endpoint);
    debugLog('   Subscription type:', subscriptionType);

    // Convert subscription to JSON format for storage/transmission
    const subscriptionJson = subscription.toJSON();

    // Store subscription locally
    await chrome.storage.local.set({ pushSubscription: subscriptionJson });
    debugLog('Push subscription stored in extension storage');

    // Send to backend (or save as pending if no session yet)
    await registerPushSubscription(subscriptionJson);
  } catch (e) {
    console.error('❌ Web Push subscription failed:', e?.message || e);
    console.error('   Will retry on next service worker wake.');
  } finally {
    subscribing = false;
  }
}

// Register push subscription with server
// Allows server to send push notifications to this extension instance
async function registerPushSubscription(subscription) {
  debugLog('Registering push subscription with server...');

  // Get current Supabase session
  const { supabaseSession } = await chrome.storage.local.get('supabaseSession');

  if (!supabaseSession || !supabaseSession.access_token) {
    debugLog('No session available, will register push subscription after login');
    // Store subscription locally to register later when user logs in
    await chrome.storage.local.set({ pendingPushSubscription: subscription });
    return;
  }

  try {
    const response = await fetch(`${CONFIG.WEB_APP_URL}/api/extension/register-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseSession.access_token}`,
      },
      body: JSON.stringify({
        subscription: subscription,
        user_id: supabaseSession.user.id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to register push subscription: ${response.status} - ${errorText}`);
    }

    debugLog('Push subscription registered with server successfully');

    // Clear pending subscription if it was stored
    await chrome.storage.local.remove('pendingPushSubscription');
  } catch (error) {
    console.error('Failed to register push subscription with server:', error);
    // Store subscription to retry later
    await chrome.storage.local.set({ pendingPushSubscription: subscription });
  }
}

// Keep service worker alive with periodic heartbeat (optional)
// Service workers can shut down after 30 seconds of inactivity
// This is normal behavior in MV3, state should be in storage
debugLog('Background service worker initialized');
