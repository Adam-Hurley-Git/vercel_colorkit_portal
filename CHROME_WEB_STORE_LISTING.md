# Chrome Web Store Listing - ColorKit for Google Calendar

**Extension ID**: `lamedhochcanagcfjgcdlcljpoecocjk`
**Version**: 0.0.2
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
Transform Google Calendar with custom day colors, task colors, and time blocks. Make your busy calendar easier to scan at a glance.
```

**131/132 characters**

### Detailed Description

```
ColorKit enhances Google Calendar with powerful visual customization:

🎨 CUSTOM DAY COLORS
• Color-code weekdays, weekends, and specific dates
• Set custom colors for holidays and special events
• Make important dates stand out instantly

✅ TASK COLORING (Premium)
• Auto-color tasks based on their Google Task list
• Manually color individual tasks
• Custom quick-access color palette

⏰ TIME BLOCKING (Premium)
• Define time blocks for different activities
• Visual background colors for focused work periods
• Recurring schedules (daily, weekdays, weekends)

All customizations are applied locally in your browser - fast, private, and secure.

Premium features require a subscription through our web portal.
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
ColorKit enhances Google Calendar's visual appearance by allowing users to customize day colors, task colors, and time blocks. All customizations are applied locally in the browser to make busy calendars easier to scan at a glance.
```

**231/1000 characters**

---

## Permission Justifications

### Required Permissions

#### `identity`

```
Required for Google OAuth authentication to enable the optional Google Tasks integration feature. Users can connect their Google Tasks to automatically color-code tasks in Google Calendar based on their task list. Authentication is performed using Google's standard OAuth 2.0 flow.
```

**196/1000 characters**

**What it does:**

- Enables "Sign in with Google" for Google Tasks API access
- Read-only access to user's task lists
- OAuth token management

**User Control:**

- Optional - only used if user enables task list coloring feature
- Can be revoked at any time from Google Account settings

---

#### `storage`

```
Required to save user preferences (day colors, task colors, time block schedules, feature toggles) and sync these settings across the user's Chrome browsers using chrome.storage.sync. Also stores authentication session data and subscription status in chrome.storage.local for premium feature access.
```

**276/1000 characters**

**What it does:**

- Saves color preferences for days, tasks, and time blocks
- Syncs settings across user's Chrome browsers
- Stores authentication tokens and subscription status
- Caches task-to-list mappings for performance

**Data Stored:**

- `chrome.storage.sync`: User preferences (day colors, task colors, time blocks, feature toggles)
- `chrome.storage.local`: Auth tokens, subscription status, task list metadata, cached mappings

**User Control:**

- All settings can be cleared from extension settings
- Data is stored locally on user's device
- Clearing extension data removes all stored information

---

#### `tabs`

```
Required to detect when users open or switch to Google Calendar tabs, send real-time updates to apply color customizations when settings change, and open external links (web portal, support pages) in new tabs. Uses chrome.tabs.query(), chrome.tabs.sendMessage(), chrome.tabs.create(), and tab event listeners.
```

**322/1000 characters**

**What it does:**

- `chrome.tabs.query()` - Find open Google Calendar tabs to apply color updates
- `chrome.tabs.sendMessage()` - Send color preference updates to calendar tabs
- `chrome.tabs.create()` - Open web portal, feedback forms, and help pages
- `chrome.tabs.onActivated/onRemoved/onUpdated` - Detect when user switches to calendar tab (for smart task list syncing)

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
Required to inject color customizations into Google Calendar pages and apply user's chosen day colors, task colors, and time blocks to the calendar interface.
```

**What it does:**

- Inject CSS to apply custom day background colors
- Add color indicators to tasks based on user preferences
- Render time blocking overlays on calendar grid
- Inject settings toolbar in calendar interface

**Scope:**

- Only runs on Google Calendar pages
- Does not access calendar event data or personal information
- Only modifies visual presentation

---

### `https://*.supabase.co/*`

```
Required to communicate with our authentication backend (Supabase) for secure user login, session token refresh, and storing user preferences in our database.
```

**What it does:**

- User authentication via Supabase Auth
- Session token refresh (JWT tokens expire after 1 hour)
- Store user preferences in cloud database (optional sync)

**Data Transmitted:**

- Authentication: Email, session tokens
- Preferences: Color settings, feature toggles (only if user enables cloud sync)

**Security:**

- All connections over HTTPS
- Tokens stored securely in `chrome.storage.local`
- Uses industry-standard JWT authentication

---

### `https://portal.calendarextension.com/*`

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

### `https://www.googleapis.com/auth/tasks.readonly`

```
Read-only access to Google Tasks
```

**What it does:**

- Read user's task lists
- Read tasks within each list
- Map tasks to task lists for auto-coloring

**What it DOES NOT do:**

- Create, modify, or delete tasks
- Access calendar events
- Access any other Google data

**User Control:**

- Optional - only requested if user enables task list coloring
- Can be revoked at any time from Google Account settings
- Extension continues working without this permission (day coloring, time blocking remain available)

---

## Remote Code

**Are you using remote code?**

```
❌ No, I am not using Remote code
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
**Description**: Transform your Google Calendar with custom colors for days, tasks, and time blocks

### Screenshot 2

**Title**: Custom Day Colors
**Description**: Set different colors for weekdays, weekends, and special dates

### Screenshot 3

**Title**: Task List Coloring (Premium)
**Description**: Auto-color tasks based on their Google Task list

### Screenshot 4

**Title**: Time Blocking (Premium)
**Description**: Define time blocks for focused work periods

### Screenshot 5

**Title**: Settings Panel
**Description**: Easy-to-use settings for all customization options

---

## Privacy Policy URL

```
https://portal.calendarextension.com/privacy
```

## Terms of Service URL

```
https://portal.calendarextension.com/terms
```

## Support URL

```
https://www.calendarextension.com/help
```

---

## Version History

### Version 0.0.2 (Current - January 2025)

**Changes:**

- Removed unused `cookies` permission (Chrome Web Store compliance)
- Removed unused `notifications` permission (using Web Push API instead)
- Added minimum Chrome version 121 requirement
- Improved OAuth state management (storage as source of truth)
- Added custom inline colors support for task modal
- Enhanced OAuth button UX with loading states and specific error messages
- Added subscription update broadcasting system
- Removed Chrome < 121 fallback code
- Bug fixes: Removed broken Chrome update notice, cleaned up dead code

### Version 0.0.1 (December 2024)

**Initial Release:**

- Custom day coloring (weekdays, weekends, specific dates)
- Task coloring with auto-coloring based on task lists (premium)
- Time blocking feature (premium)
- Subscription management with fail-open architecture
- Web Push notifications for real-time subscription updates

---

## Developer Information

**Developer Name**: ColorKit
**Contact Email**: support@calendarextension.com
**Website**: https://www.calendarextension.com

---

## Common Review Questions

### Q: Why do you need the `tabs` permission?

**A**: Required to:

1. Find open Google Calendar tabs to send color preference updates
2. Open external links (web portal, support pages) in new tabs
3. Detect when user switches to calendar tab for smart task list syncing

We only query for `https://calendar.google.com/*` tabs and use the permission solely for inter-component communication, not for reading tab content.

### Q: Why do you need access to `*.supabase.co`?

**A**: Supabase is our authentication and database backend. We use it for:

1. User authentication (Supabase Auth)
2. Session token refresh (JWT tokens expire after 1 hour)
3. Storing user preferences in cloud database

All connections are over HTTPS with industry-standard JWT authentication.

### Q: What data do you collect?

**A**: We collect minimal data necessary for the extension to function:

- **Authentication**: Email address, session tokens
- **Preferences**: Color settings, feature toggles (stored locally and optionally synced to cloud)
- **Subscription**: Subscription status, payment information (via Paddle, not stored by us)
- **Usage**: Anonymous feature usage for improving the extension

See our Privacy Policy for full details: https://portal.calendarextension.com/privacy

### Q: Can users use the extension without a subscription?

**A**: Yes! Free features include:

- Custom day coloring (weekdays, weekends, specific dates)
- All visual customization without task integration

Premium features (task coloring, time blocking) require a subscription.

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

**Status**: ✅ Ready for Chrome Web Store submission
