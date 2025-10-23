'use client';

import { useEffect } from 'react';
import type { ExtensionMessage } from '@/utils/extension-messaging';

interface ExtensionNotifierProps {
  message: ExtensionMessage | null;
  enabled?: boolean;
}

/**
 * Client component that sends messages to Chrome extension
 * Must be used in client components only
 */
export function ExtensionNotifier({ message, enabled = true }: ExtensionNotifierProps) {
  useEffect(() => {
    if (!enabled || !message) return;

    const sendMessageToExtension = async () => {
      try {
        // Get extension ID from environment
        const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;

        if (!extensionId) {
          console.warn('[ExtensionNotifier] NEXT_PUBLIC_EXTENSION_ID not configured');
          return;
        }

        // Check if chrome.runtime is available
        if (typeof window === 'undefined' || !window.chrome?.runtime) {
          console.log('[ExtensionNotifier] Chrome runtime not available');
          return;
        }

        console.log('[ExtensionNotifier] Sending message to extension:', message.type);
        console.log('[ExtensionNotifier] Extension ID:', extensionId);

        // Send message to extension
        window.chrome.runtime.sendMessage(extensionId, message, (response) => {
          // Check for errors
          if (window.chrome.runtime.lastError) {
            console.warn(
              '[ExtensionNotifier] Extension not installed or not responding:',
              window.chrome.runtime.lastError.message,
            );
            return;
          }

          if (response) {
            console.log('[ExtensionNotifier] Extension response:', response);
          } else {
            console.log('[ExtensionNotifier] Message sent successfully (no response)');
          }
        });
      } catch (error) {
        console.error('[ExtensionNotifier] Error sending message:', error);
      }
    };

    // Send message after a brief delay to ensure page is fully loaded
    const timeoutId = setTimeout(sendMessageToExtension, 500);

    return () => clearTimeout(timeoutId);
  }, [message, enabled]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for sending messages to extension from any client component
 */
export function useSendExtensionMessage() {
  const sendMessage = (message: ExtensionMessage) => {
    try {
      const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;

      if (!extensionId) {
        console.warn('[useSendExtensionMessage] NEXT_PUBLIC_EXTENSION_ID not configured');
        return;
      }

      if (typeof window === 'undefined' || !window.chrome?.runtime) {
        console.log('[useSendExtensionMessage] Chrome runtime not available');
        return;
      }

      console.log('[useSendExtensionMessage] Sending message:', message.type);

      window.chrome.runtime.sendMessage(extensionId, message, (response) => {
        if (window.chrome.runtime.lastError) {
          console.warn('[useSendExtensionMessage] Error:', window.chrome.runtime.lastError.message);
          return;
        }

        if (response) {
          console.log('[useSendExtensionMessage] Response:', response);
        }
      });
    } catch (error) {
      console.error('[useSendExtensionMessage] Error:', error);
    }
  };

  return { sendMessage };
}
