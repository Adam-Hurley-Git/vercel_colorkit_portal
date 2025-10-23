'use client';

import { useEffect, useRef } from 'react';

interface ExtensionNotifierProps {
  message: Record<string, unknown> | null;
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
    if (!extensionId) {
      console.warn('[ExtensionNotifier] NEXT_PUBLIC_EXTENSION_ID not configured - skipping extension notification');
      return;
    }

    // Check if chrome.runtime is available (only in Chrome/Edge browsers)
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
      console.log('[ExtensionNotifier] chrome.runtime not available - user may be using non-Chrome browser');
      return;
    }

    console.log('[ExtensionNotifier] Sending message to extension:', message.type);
    console.log('[ExtensionNotifier] Extension ID:', extensionId);

    try {
      chrome.runtime.sendMessage(extensionId, message, (response) => {
        // Check for errors
        if (chrome.runtime.lastError) {
          // This is normal if extension isn't installed - don't treat as error
          console.log(
            '[ExtensionNotifier] Extension not installed or not responding:',
            chrome.runtime.lastError.message,
          );
        } else {
          console.log('[ExtensionNotifier] ✅ Extension response:', response);
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
