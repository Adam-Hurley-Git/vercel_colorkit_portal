import { Inter } from 'next/font/google';
import '../styles/globals.css';
import '../styles/layout.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  title: 'ColorKit',
  description:
    'Transform your Google Calendar with custom day colors, task colors, and time blocks. Make your week instantly scannable with ColorKit for Google Calendar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={'min-h-full'}>
      <head>
        {/* Extension ID meta tag for extension bridge */}
        <meta name="extension-id" content={process.env.NEXT_PUBLIC_EXTENSION_ID || ''} />
      </head>
      <body className={inter.className}>
        {/* Extension Bridge Script */}
        <Script src="/extension-bridge.js" strategy="lazyOnload" />

        {children}
        <Toaster />
      </body>
    </html>
  );
}
