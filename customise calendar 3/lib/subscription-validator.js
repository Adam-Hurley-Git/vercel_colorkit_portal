// Subscription Validator
// Validates subscription status by reading from storage
// Storage is kept fresh by:
//   1. Push notifications (real-time updates)
//   2. 3-day periodic alarm (backup check)
//   3. PAYMENT_SUCCESS messages from web app
import { CONFIG, debugLog } from '../config.production.js';

/**
 * Validate subscription by reading from storage
 * NO API CALL - just reads cached status kept fresh by push notifications and 3-day alarm
 *
 * This function is used by:
 * - Popup when opening (instant display, no loading spinner)
 * - Content script internal checks
 *
 * Returns the current subscription status from storage
 */
export async function validateSubscription() {
  try {
    debugLog('Reading subscription status from storage...');

    // Get subscription status from storage (kept fresh by push + alarm)
    const { subscriptionStatus } = await chrome.storage.local.get('subscriptionStatus');

    if (subscriptionStatus && subscriptionStatus.isActive !== undefined) {
      debugLog('Subscription status from storage:', subscriptionStatus.status);
      return subscriptionStatus;
    }

    // No status in storage yet - check if we have session
    const { supabaseSession } = await chrome.storage.local.get('supabaseSession');

    if (!supabaseSession || !supabaseSession.access_token) {
      debugLog('No subscription status and no session found');
      return {
        isActive: false,
        reason: 'no_session',
        message: 'Please sign in to use ColorKit',
        needsAuth: true,
      };
    }

    // Have session but no subscription status - awaiting first validation
    debugLog('Have session but no subscription status - awaiting first check from push/alarm');
    return {
      isActive: false,
      reason: 'pending_validation',
      message: 'Checking subscription status...',
    };
  } catch (error) {
    console.error('Failed to read subscription status:', error);
    return {
      isActive: false,
      reason: 'error',
      message: 'Unable to read subscription status',
      error: error.message,
    };
  }
}

/**
 * Force refresh subscription status from API
 * MAKES API CALL - only used by push notifications and 3-day alarm
 *
 * This is the ONLY function that makes API calls to validate subscription.
 * Called by:
 * - Push notification handler (real-time updates)
 * - 3-day periodic alarm (backup validation)
 *
 * Updates storage with fresh data from server
 */
export async function forceRefreshSubscription() {
  debugLog('Force refreshing subscription status from API...');

  try {
    // Get stored Supabase session
    const { supabaseSession } = await chrome.storage.local.get('supabaseSession');

    if (!supabaseSession || !supabaseSession.access_token) {
      debugLog('No Supabase session found - cannot validate');
      const noSessionResult = {
        isActive: false,
        reason: 'no_session',
        message: 'Please sign in to use ColorKit',
        needsAuth: true,
      };

      // Update storage
      await chrome.storage.local.set({
        subscriptionStatus: noSessionResult,
        subscriptionActive: false,
      });

      return noSessionResult;
    }

    debugLog('Making API call to validate subscription...');

    // Call validation API with Bearer token
    const response = await fetch(`${CONFIG.WEB_APP_URL}/api/extension/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseSession.access_token}`,
      },
    });

    if (!response.ok) {
      debugLog('API returned error:', response.status);

      // If unauthorized, clear session and ask user to re-login
      if (response.status === 401) {
        await chrome.storage.local.remove(['supabaseSession', 'authenticated']);
        const sessionExpiredResult = {
          isActive: false,
          reason: 'session_expired',
          message: 'Session expired. Please sign in again.',
          needsAuth: true,
        };

        // Update storage
        await chrome.storage.local.set({
          subscriptionStatus: sessionExpiredResult,
          subscriptionActive: false,
        });

        return sessionExpiredResult;
      }

      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    debugLog('API response:', data);

    // Update BOTH subscriptionStatus (object) and subscriptionActive (boolean)
    // This ensures popup and calendar features stay in sync
    await chrome.storage.local.set({
      subscriptionStatus: data,
      subscriptionActive: data.isActive || false,
      subscriptionTimestamp: Date.now(),
    });

    debugLog('Storage updated with fresh subscription status');

    return data;
  } catch (error) {
    console.error('Force refresh failed:', error);
    const errorResult = {
      isActive: false,
      reason: 'error',
      message: 'Unable to verify subscription. Please check your connection.',
      error: error.message,
    };

    // Update storage - mark as inactive on error (fail-safe)
    await chrome.storage.local.set({
      subscriptionStatus: errorResult,
      subscriptionActive: false,
    });

    return errorResult;
  }
}

/**
 * Clear subscription cache
 * Removes subscriptionStatus and lastChecked from storage
 * Used on logout or when forcing a refresh
 */
export async function clearSubscriptionCache() {
  try {
    await chrome.storage.local.remove(['subscriptionStatus', 'lastChecked']);
    debugLog('Subscription cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

debugLog('Subscription validator initialized (no automatic API calls - push + 3-day alarm only)');
