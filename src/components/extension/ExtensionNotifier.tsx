'use client';

import { useEffect, useRef } from 'react';
import type { ExtensionMessage } from '@/utils/extension-messaging';

interface ExtensionNotifierProps {
  message: ExtensionMessage | null;
}

/**
 * Client component that sends messages to the Chrome extension
 * Uses chrome.runtime.sendMessage with externally_connectable
 *
 * This component renders nothing - it only sends messages on mount
 */
export function ExtensionNotifier({ message }: ExtensionNotifierProps) {
  const hasSent = useRef(false);

  useEffect(() => {
    // Only send once per mount and only if we have a message
    if (!message || hasSent.current) {
      return;
    }

    // Get extension ID from environment variable
    const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;

    console.log('='.repeat(60));
    console.log('🔔 [ExtensionNotifier] Attempting to send message to extension');
    console.log('   Message type:', message.type);
    console.log('   Target Extension ID:', extensionId || 'NOT SET');
    console.log('='.repeat(60));

    if (!extensionId) {
      console.error('❌ [ExtensionNotifier] NEXT_PUBLIC_EXTENSION_ID not configured!');
      console.error('   Extension will NOT receive unlock messages');
      console.error('   → Check Vercel environment variables');
      return;
    }

    // Check if chrome.runtime is available (only in Chrome/Edge browsers)
    // Using window check to avoid TypeScript errors in build
    if (
      typeof window === 'undefined' ||
      !(window as typeof window & { chrome?: { runtime?: unknown } }).chrome ||
      !(window as typeof window & { chrome: { runtime?: { sendMessage?: unknown } } }).chrome.runtime ||
      !(window as typeof window & { chrome: { runtime: { sendMessage: unknown } } }).chrome.runtime.sendMessage
    ) {
      console.log('[ExtensionNotifier] chrome.runtime not available - user may be using non-Chrome browser');
      return;
    }

    // TypeScript-safe access to chrome API
    const chromeApi = (
      window as typeof window & {
        chrome: { runtime: { sendMessage: CallableFunction; lastError?: { message: string } } };
      }
    ).chrome;

    try {
      chromeApi.runtime.sendMessage(extensionId, message, (response: unknown) => {
        // Check for errors
        if (chromeApi.runtime.lastError) {
          console.log('='.repeat(60));
          console.error('❌ [ExtensionNotifier] Extension not responding!');
          console.error('   Error:', chromeApi.runtime.lastError.message);
          console.error('   Extension ID used:', extensionId);
          console.error('');
          console.error('   Possible causes:');
          console.error('   1. Extension not installed');
          console.error('   2. Wrong extension ID (check manifest.json)');
          console.error('   3. Extension disabled/crashed');
          console.error('   4. Build has old NEXT_PUBLIC_EXTENSION_ID (need hard refresh)');
          console.log('='.repeat(60));
        } else {
          console.log('='.repeat(60));
          console.log('✅ [ExtensionNotifier] Message sent successfully!');
          console.log('   Extension response:', response);
          console.log('='.repeat(60));
        }
      });

      hasSent.current = true;
    } catch (error) {
      // Catch any synchronous errors
      console.error('[ExtensionNotifier] Error sending message:', error);
    }
  }, [message]);

  // This component renders nothing
  return null;
}
