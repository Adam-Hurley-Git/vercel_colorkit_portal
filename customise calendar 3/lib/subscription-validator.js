// Subscription Validator
// Checks if user has active subscription via web app API
import { CONFIG, debugLog } from '../config.production.js';
import { supabaseClient } from './supabase-extension.js';

// Cache duration: 24 hours
// With FCM push notifications, we get instant updates when subscription changes
// Daily validation at 4 AM provides backup check
// This dramatically reduces API calls (from 288/day to 1/day per user)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function validateSubscription() {
  try {
    debugLog('Starting subscription validation...');

    // Get stored Supabase session
    const { supabaseSession } = await chrome.storage.local.get('supabaseSession');

    if (!supabaseSession || !supabaseSession.access_token) {
      debugLog('No Supabase session found');
      return {
        isActive: false,
        reason: 'no_session',
        message: 'Please sign in to use ColorKit',
        needsAuth: true,
      };
    }

    debugLog('Supabase session found, checking subscription...');

    // Check cache first to avoid excessive API calls
    const cached = await getCachedStatus();
    if (cached) {
      debugLog('Using cached subscription status:', cached.status);
      return cached;
    }

    // Call validation API with Bearer token
    debugLog('Fetching fresh subscription status from API...');
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
        return {
          isActive: false,
          reason: 'session_expired',
          message: 'Session expired. Please sign in again.',
          needsAuth: true,
        };
      }

      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    debugLog('API response:', data);

    // Cache the result
    await cacheStatus(data);

    return data;
  } catch (error) {
    console.error('Subscription validation failed:', error);
    return {
      isActive: false,
      reason: 'error',
      message: 'Unable to verify subscription. Please check your connection.',
      error: error.message,
    };
  }
}

// Get cached subscription status
async function getCachedStatus() {
  try {
    const result = await chrome.storage.local.get(['subscriptionStatus', 'lastChecked']);

    if (result.subscriptionStatus && result.lastChecked) {
      const age = Date.now() - result.lastChecked;

      if (age < CACHE_DURATION) {
        debugLog(`Cache hit (${Math.round(age / 1000)}s old)`);
        debugLog('Cached status:', JSON.stringify(result.subscriptionStatus, null, 2));

        // Validate cached status has required fields
        if (result.subscriptionStatus.isActive === undefined) {
          console.warn('⚠️ Invalid cached status (missing isActive), clearing cache');
          await chrome.storage.local.remove(['subscriptionStatus', 'lastChecked']);
          return null;
        }

        return result.subscriptionStatus;
      } else {
        debugLog(`Cache expired (${Math.round(age / 1000)}s old)`);
      }
    } else {
      debugLog('No cache found');
    }

    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

// Cache subscription status
async function cacheStatus(status) {
  try {
    await chrome.storage.local.set({
      subscriptionStatus: status,
      lastChecked: Date.now(),
    });
    debugLog('Status cached for 24 hours');
  } catch (error) {
    console.error('Error caching status:', error);
  }
}

// Clear subscription cache (call on logout or payment)
export async function clearSubscriptionCache() {
  try {
    await chrome.storage.local.remove(['subscriptionStatus', 'lastChecked']);
    debugLog('Subscription cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Force refresh (bypass cache)
export async function forceRefreshSubscription() {
  debugLog('Force refreshing subscription status...');
  await clearSubscriptionCache();
  return await validateSubscription();
}

debugLog('Subscription validator initialized');
