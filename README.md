# ColorKit for Google Calendar - Web Portal

The web portal for ColorKit, a subscription-based Chrome extension that enhances Google Calendar with custom colors and visual customization.

## Overview

This Next.js application serves as the web portal for ColorKit, handling:

- **User Authentication** - Supabase Auth with Google OAuth
- **Subscription Management** - Paddle Billing integration
- **Extension Communication** - Real-time status updates via Web Push API
- **User Dashboard** - Account and subscription management

## Stack

- **Framework:** [Next.js 15.5.9](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Payments:** [Paddle Billing](https://www.paddle.com/billing) (Merchant of Record)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Styling:** [Tailwind CSS 4.x](https://tailwindcss.com/)
- **Push Notifications:** Web Push API (VAPID)
- **Hosting:** [Vercel](https://vercel.com/)

## Features

### For Users

- Google OAuth sign-in
- 7-day free trial for new users
- Subscription management (monthly/annual plans)
- Payment history and invoices (via Paddle)
- Account settings and data management

### For Extension

- `/api/extension/validate` - Subscription status validation
- `/api/extension/register-push` - Web Push subscription registration
- `/api/extension/subscription-status` - Push registration status check
- Real-time subscription updates via Web Push notifications

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── extension/            # Extension-specific endpoints
│   │   └── webhook/              # Paddle webhook handler
│   ├── auth/callback/            # OAuth callback
│   ├── checkout/                 # Checkout flow
│   ├── dashboard/                # User dashboard
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   └── onboarding/               # New user onboarding
├── components/                   # React components
├── lib/                          # Utility libraries
└── utils/
    ├── paddle/                   # Paddle integration
    └── supabase/                 # Supabase clients
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Paddle
PADDLE_API_KEY=your-paddle-api-key
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your-client-token
NEXT_PUBLIC_PADDLE_ENV=sandbox  # or production

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:support@yourdomain.com

# Extension
NEXT_PUBLIC_EXTENSION_ID=your-chrome-extension-id
```

## Development

### Prerequisites

- Node.js >= 20
- pnpm (recommended)

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Database Migrations

Apply Supabase migrations from `supabase/migrations/`:

```bash
supabase db push
```

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Paddle Webhook

Configure webhook URL in Paddle Dashboard:
- URL: `https://your-domain.com/api/webhook`
- Events: All subscription and customer events

## Related Documentation

- [SYSTEM_ARCHITECTURE_COMPLETE.md](./SYSTEM_ARCHITECTURE_COMPLETE.md) - Full technical architecture
- [LEGAL_TECHNICAL_REFERENCE.md](./LEGAL_TECHNICAL_REFERENCE.md) - Legal and compliance details
- [FAIL_OPEN_ARCHITECTURE.md](./FAIL_OPEN_ARCHITECTURE.md) - Subscription validation design
- [Main Extension/CLAUDE.md](../Main%20Extension/CLAUDE.md) - Extension documentation

## Support

- Email: support@calendarextension.com
- Website: https://portal.calendarextension.com
