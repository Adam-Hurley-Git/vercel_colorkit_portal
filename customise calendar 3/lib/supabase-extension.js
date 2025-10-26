// Supabase Client for Chrome Extension
// Uses custom storage adapter for chrome.storage
import { CONFIG, debugLog } from '../config.production.js';

// Custom storage adapter using chrome.storage.local
const chromeStorageAdapter = {
  getItem: async (key) => {
    try {
      const result = await chrome.storage.local.get([key]);
      const value = result[key] || null;
      debugLog('Storage getItem:', key, value ? '(exists)' : '(null)');
      return value;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await chrome.storage.local.set({ [key]: value });
      debugLog('Storage setItem:', key);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: async (key) => {
    try {
      await chrome.storage.local.remove([key]);
      debugLog('Storage removeItem:', key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

// Note: For the extension to use Supabase client, you have two options:
// 1. Use CDN import (works in browser but may have limitations):
//    Import from https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm
// 2. Bundle Supabase with your extension (recommended for production)

// For now, we'll create a minimal client that handles auth via cookies
// The actual Supabase JS client can be added later if needed

export const supabaseClient = {
  url: CONFIG.SUPABASE_URL,
  anonKey: CONFIG.SUPABASE_ANON_KEY,
  storage: chromeStorageAdapter,

  // Get session from chrome storage
  async getSession() {
    const session = await chromeStorageAdapter.getItem('supabase.auth.token');
    return session ? JSON.parse(session) : null;
  },

  // Set session in chrome storage
  async setSession(session) {
    if (session) {
      await chromeStorageAdapter.setItem('supabase.auth.token', JSON.stringify(session));
    } else {
      await chromeStorageAdapter.removeItem('supabase.auth.token');
    }
  },

  // Check if user is authenticated via cookies
  async isAuthenticated() {
    try {
      // Try to get Supabase auth cookies
      const cookies = await chrome.cookies.getAll({
        url: CONFIG.SUPABASE_URL,
      });

      debugLog('Supabase cookies found:', cookies.length);

      // Look for auth token cookie
      const authCookie = cookies.find(
        (c) => c.name.includes('auth-token') || (c.name.includes('sb-') && c.name.includes('-auth-token')),
      );

      if (authCookie) {
        debugLog('Auth cookie found:', authCookie.name);
        return true;
      }

      // Fallback: check storage
      const session = await this.getSession();
      if (session) {
        debugLog('Session found in storage');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Clear auth data
  async signOut() {
    await this.setSession(null);
    await chrome.storage.local.remove(['authenticated', 'subscriptionActive']);
    debugLog('Signed out, auth data cleared');
  },
};

debugLog('Supabase extension client initialized');
