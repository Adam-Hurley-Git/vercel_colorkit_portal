import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Skip auth middleware for webhook routes - webhooks are server-to-server
  // Multiple webhook paths for backwards compatibility and testing
  const webhookPaths = [
    '/api/webhook', // App Router webhook
    '/api/paddle/webhook', // Dedicated Pages Router webhook (recommended)
    '/api/paddle-webhook', // Legacy Pages Router webhook
  ];

  if (webhookPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    console.log('[Middleware] ⏭️ Skipping auth check for webhook route:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhook* (Paddle webhooks - no auth required)
     * - api/paddle/* (Paddle-specific endpoints - no auth required)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhook|api/paddle/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
