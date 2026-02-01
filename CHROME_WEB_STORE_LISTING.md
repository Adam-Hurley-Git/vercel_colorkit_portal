# Chrome Web Store Listing - ColorKit for Google Calendar

**Extension ID**: `lamedhochcanagcfjgcdlcljpoecocjk`
**Version**: 0.0.5
**Status**: Ready for Submission
**Last Updated**: January 2025

---

## Extension Details

### Name

```
ColorKit for Google Calendar
```

### Short Description (132 characters max)

```
Transform Google Calendar with custom day colors, event colors, and time blocks. Make your busy calendar easier to scan at a glance.
```

**131/132 characters**

### Detailed Description

```
ColorKit enhances Google Calendar with powerful visual customization:

🎨 CUSTOM DAY COLORS
• Color-code weekdays, weekends, and specific dates
• Set custom colors for holidays and special events
• Make important dates stand out instantly

🎯 EVENT COLORING
• Customize event background colors
• Add text color and borders (Premium)
• Apply colors to all recurring event instances
• Set default colors per calendar (Premium)

⏰ TIME BLOCKING
• Define time blocks for different activities
• Visual background colors for focused work periods
• Weekly recurring schedules (free)
• Date-specific blocks for special days (Premium)

All customizations are applied locally in your browser - fast, private, and secure.

Premium features available with a subscription. Start with a 7-day free trial!
```

### Category

```
Productivity
```

### Language

```
English (United States)
```

---

## Privacy Page

### Single Purpose Description

```
ColorKit enhances Google Calendar's visual appearance by allowing users to customize day colors, event colors, and time blocks. All customizations are applied locally in the browser to make busy calendars easier to scan at a glance.
```

**232/1000 characters**

---

## Permission Justifications

### Required Permissions

#### `identity`

```
Required for Google OAuth authentication to enable the optional Calendar Colors feature. Users can authorize read-only access to their Google Calendar to enable automatic calendar-based event coloring. Authentication is performed using Google's standard OAuth 2.0 flow.
```

**264/1000 characters**

**What it does:**

- Enables "Sign in with Google" for Google Calendar API access
- Read-only access to calendar list and colors
- OAuth token management

**User Control:**

- Optional - only used if user enables calendar colors feature
- Can be revoked at any time from Google Account settings

---

#### `storage`

```
Required to save user preferences (day colors, event colors, time block schedules, feature toggles) and sync these settings across the user's Chrome browsers using chrome.storage.sync. Also stores authentication session data and subscription status in chrome.storage.local for premium feature access.
```

**277/1000 characters**

**What it does:**

- Saves color preferences for days, events, and time blocks
- Syncs settings across user's Chrome browsers
- Stores authentication tokens and subscription status
- Caches event colors for performance

**Data Stored:**

- `chrome.storage.sync`: User preferences (day colors, event colors, time blocks, feature toggles)
- `chrome.storage.local`: Auth tokens, subscription status, event color mappings

**User Control:**

- All settings can be cleared from extension settings
- Data is stored locally on user's device
- Clearing extension data removes all stored information

---

#### `tabs`

```
Required to detect when users open or switch to Google Calendar tabs, send real-time updates to apply color customizations when settings change, and open external links (web portal, support pages) in new tabs. Uses chrome.tabs.query(), chrome.tabs.sendMessage(), and chrome.tabs.create().
```

**303/1000 characters**

**What it does:**

- `chrome.tabs.query()` - Find open Google Calendar tabs to apply color updates
- `chrome.tabs.sendMessage()` - Send color preference updates to calendar tabs
- `chrome.tabs.create()` - Open web portal, feedback forms, and help pages

**Scope:**

- Only queries for `https://calendar.google.com/*` tabs
- Cannot read or modify tab content without explicit host permission
- Used purely for inter-component communication

---

#### `alarms`

```
Required to schedule periodic subscription validation checks (every 3 days) to ensure premium features remain accessible to paying subscribers. The alarm triggers background validation that refreshes subscription status from the backend without requiring user interaction.
```

**258/1000 characters**

**What it does:**

- Schedules periodic subscription validation (every 3 days at 4 AM)
- Ensures premium features remain accessible to paying subscribers
- Backup validation mechanism (primary validation is via Web Push notifications)

**Frequency:**

- Once every 3 days
- Does not wake device or impact battery

---

## Host Permission Justifications

### `https://calendar.google.com/*`

```
Required to inject color customizations into Google Calendar pages and apply user's chosen day colors, event colors, and time blocks to the calendar interface.
```

**What it does:**

- Inject CSS to apply custom day background colors
- Add color customization to calendar events
- Render time blocking overlays on calendar grid
- Inject color picker into Google Calendar's color menu

**Scope:**

- Only runs on Google Calendar pages
- Does not modify calendar event data
- Only modifies visual presentation

---

### `https://*.supabase.co/*`

```
Required to communicate with our authentication backend (Supabase) for secure user login, session token refresh, and subscription status validation.
```

**What it does:**

- User authentication via Supabase Auth
- Session token refresh (JWT tokens expire after 1 hour)
- Subscription status validation

**Data Transmitted:**

- Authentication: Email, session tokens
- Subscription: Status validation only

**Security:**

- All connections over HTTPS
- Tokens stored securely in `chrome.storage.local`
- Uses industry-standard JWT authentication

---

### `https://portal.calendarcolorkit.com/*`

```
Required to communicate with our production web portal for user authentication, subscription management, payment processing, and account settings synchronization.
```

**What it does:**

- User authentication and account management
- Subscription status validation (fail-open design - preserves access during errors)
- Web Push notification registration for real-time subscription updates
- Communication between extension and web portal via `chrome.runtime.sendMessage()`

**API Endpoints Used:**

- `/api/extension/validate` - Validates subscription status
- `/api/extension/register-push` - Registers for Web Push notifications
- `/api/extension/subscription-status` - Checks subscription status

**Security:**

- All connections over HTTPS
- Bearer token authentication
- Fail-open design prevents false lockouts

---

## OAuth Scopes

### `https://www.googleapis.com/auth/calendar.readonly`

```
Read-only access to Google Calendar
```

**What it does:**

- Read user's calendar list
- Read calendar colors for auto-coloring events
- Identify which calendar an event belongs to

**What it DOES NOT do:**

- Create, modify, or delete events
- Access event details, titles, or descriptions
- Access any other Google data

**User Control:**

- Optional - only requested if user enables calendar colors feature
- Can be revoked at any time from Google Account settings
- Extension continues working without this permission (day coloring, event coloring, time blocking remain available)

---

## Remote Code

**Are you using remote code?**

```
No, I am not using Remote code
```

**Explanation:**

- All extension code is bundled locally in the extension package
- API calls to backend services are only for data exchange (authentication, subscription validation)
- No remote JavaScript is fetched or executed
- No CDN imports at runtime
- No `eval()` or similar dynamic code execution

---

## Minimum Chrome Version

**Minimum Version**: Chrome 121 (Released January 2024)

**Reason:**

- Uses silent Web Push API (`userVisibleOnly: false`)
- Requires Chrome 121+ for background push notifications without showing visible notifications
- 95%+ of Chrome users are on version 121 or higher

---

## Screenshots

### Primary Screenshot

**Title**: Colorful Calendar Overview
**Description**: Transform your Google Calendar with custom colors for days, events, and time blocks

### Screenshot 2

**Title**: Custom Day Colors
**Description**: Set different colors for weekdays, weekends, and special dates

### Screenshot 3

**Title**: Event Coloring
**Description**: Customize event colors with background, text, and border options

### Screenshot 4

**Title**: Time Blocking
**Description**: Define time blocks for focused work periods

### Screenshot 5

**Title**: Settings Panel
**Description**: Easy-to-use settings for all customization options

---

## Privacy Policy URL

```
https://portal.calendarcolorkit.com/privacy
```

## Terms of Service URL

```
https://portal.calendarcolorkit.com/terms
```

## Support URL

```
https://www.calendarcolorkit.com/help
```

---

## Version History

### Version 0.0.5 (Current - January 2025)

**Changes:**

- Event coloring feature with background, text, and border colors
- Recurring event color support (apply to all or single instance)
- Per-calendar default colors (premium)
- Color templates for quick styling (premium)
- Improved color picker UI

### Version 0.0.2 (January 2025)

**Changes:**

- Removed unused `cookies` permission (Chrome Web Store compliance)
- Removed unused `notifications` permission (using Web Push API instead)
- Added minimum Chrome version 121 requirement
- Improved OAuth state management
- Added subscription update broadcasting system

### Version 0.0.1 (December 2024)

**Initial Release:**

- Custom day coloring (weekdays, weekends, specific dates)
- Time blocking feature
- Subscription management with fail-open architecture
- Web Push notifications for real-time subscription updates

---

## Developer Information

**Developer Name**: ColorKit
**Contact Email**: adam@calendarcolorkit.com
**Website**: https://www.calendarcolorkit.com

---

## Common Review Questions

### Q: Why do you need the `tabs` permission?

**A**: Required to:

1. Find open Google Calendar tabs to send color preference updates
2. Open external links (web portal, support pages) in new tabs
3. Broadcast subscription status changes to calendar tabs

We only query for `https://calendar.google.com/*` tabs and use the permission solely for inter-component communication, not for reading tab content.

### Q: Why do you need access to `*.supabase.co`?

**A**: Supabase is our authentication and database backend. We use it for:

1. User authentication (Supabase Auth)
2. Session token refresh (JWT tokens expire after 1 hour)
3. Subscription status validation

All connections are over HTTPS with industry-standard JWT authentication.

### Q: What data do you collect?

**A**: We collect minimal data necessary for the extension to function:

- **Authentication**: Email address, session tokens
- **Preferences**: Color settings, feature toggles (stored locally and optionally synced via Chrome)
- **Subscription**: Subscription status (via Paddle, payment data not stored by us)

See our Privacy Policy for full details: https://portal.calendarcolorkit.com/privacy

### Q: Can users use the extension without a subscription?

**A**: Yes! Free features include:

- Custom day coloring (weekdays and weekends)
- Weekly recurring time blocks
- Event background colors

Premium features (date-specific colors, event text/border colors, templates) require a subscription with a 7-day free trial.

### Q: How do you handle subscription validation failures?

**A**: We use a **fail-open architecture**:

- Only locks users when subscription is **confirmed inactive**
- Preserves access during temporary failures (API errors, network issues)
- Automatically refreshes expired tokens
- Never locks paying users during system failures

See `FAIL_OPEN_ARCHITECTURE.md` for technical details.

---

## Testing Checklist Before Submission

- [x] All permissions are used and justified
- [x] No unused permissions in manifest
- [x] Privacy policy is accurate and accessible
- [x] Screenshots are up-to-date
- [x] Extension description is clear and accurate
- [x] Remote code usage is correctly declared (No)
- [x] OAuth scopes are minimal and justified
- [x] Minimum Chrome version is set correctly
- [x] All API endpoints are production URLs (no localhost/staging)
- [x] Extension works correctly when loaded unpacked
- [x] No console errors in production mode

---

**Status**: Ready for Chrome Web Store submission
