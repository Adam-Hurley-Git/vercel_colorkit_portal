# ColorKit Legal & Compliance Technical Reference

**Last Updated:** 2025-10-28
**Document Purpose:** Technical reference for creating Terms & Conditions, Privacy Policy, and Refund Policy
**Product:** ColorKit for Google Calendar (Chrome Extension + Web Portal)

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Data Collection & Processing](#data-collection--processing)
3. [Third-Party Services & Data Sharing](#third-party-services--data-sharing)
4. [Payment Processing & Billing](#payment-processing--billing)
5. [User Rights & Data Management](#user-rights--data-management)
6. [Security & Data Protection](#security--data-protection)
7. [Browser Extension Permissions](#browser-extension-permissions)
8. [Cookies & Local Storage](#cookies--local-storage)
9. [International Considerations](#international-considerations)
10. [Service Architecture & Availability](#service-architecture--availability)

---

## Product Overview

### What ColorKit Is

ColorKit is a subscription-based SaaS product consisting of:

- **Chrome Browser Extension** - Customizes the Google Calendar interface with colors and visual enhancements
- **Web Portal** - Subscription management, authentication, and user account dashboard
- **Real-time Sync System** - Instant subscription status updates via Web Push API

### Product Name & Branding

- **Product Name:** ColorKit for Google Calendar
- **Company Name:** [Your Company Name]
- **Support Contact:** support@calendarextension.com
- **Website:** https://portal.calendarextension.com

### Service Model

- **Subscription Type:** Recurring subscription (monthly or annual)
- **Free Trial:** 7-day free trial for new users
- **Access Model:** Freemium (extension locks premium features without subscription)
- **Pricing:** Managed through Paddle Billing

---

## Data Collection & Processing

### 1. Personal Information Collected

#### A. During Account Creation (via Google OAuth)

- **Email address** - Primary identifier and communication channel
- **Google User ID** - External identifier (not stored, used only during OAuth)
- **Name** - May be collected via Google profile (if user grants permission)
- **Profile picture URL** - May be collected via Google profile (optional)

**Legal Basis:** Contractual necessity (to provide the service)
**Retention:** Until account deletion

#### B. During Payment (via Paddle)

**Note:** Paddle is our payment processor and handles all payment data. We do NOT store:

- Credit card numbers
- CVV codes
- Banking information
- Full billing addresses

**What we DO receive from Paddle:**

- **Customer ID** - Paddle's unique identifier (e.g., `ctm_01k8h2...`)
- **Email address** - Used to link payment to user account
- **Subscription status** - `active`, `trialing`, `canceled`, `past_due`, `paused`
- **Subscription ID** - Paddle's subscription identifier
- **Price ID** - Which plan the user purchased
- **Product ID** - Which product (ColorKit subscription)
- **Payment dates** - Transaction completion timestamps
- **Scheduled changes** - Upcoming plan changes or cancellations

**Legal Basis:** Contractual necessity (to manage subscription access)
**Retention:** Until subscription deletion + 7 years (for accounting/tax purposes)

#### C. Technical & Usage Data

**Browser Extension Data:**

- **Push notification endpoint** - Browser-generated URL for real-time updates (e.g., `https://fcm.googleapis.com/fcm/send/xyz...`)
- **Encryption keys** - Browser-generated keys for secure push notifications (p256dh, auth)
- **VAPID key hash** - To detect configuration changes
- **Installation timestamp** - When extension was installed
- **Last active timestamp** - Last time push notification was successfully delivered

**Web Portal Data:**

- **Session tokens** - JWT access and refresh tokens for authentication
- **Login timestamps** - When user last accessed dashboard
- **IP address** - Server logs only, not stored in database (Vercel logs, 30-day retention)
- **User agent** - Browser and OS information (Vercel logs only)

**Calendar Data - IMPORTANT:**

- ColorKit extension **DOES NOT** read, access, or transmit your calendar events
- All calendar customization happens **locally in your browser**
- We have **NO access** to your Google Calendar content
- Extension only modifies the visual appearance of Google Calendar's interface

**Legal Basis:** Legitimate interest (service functionality and support)
**Retention:** Push endpoints until unregistered; session tokens 7 days; logs 30 days

#### D. User Agreement Records

We store records of policy acceptances:

- **Terms & Conditions acceptance** - Boolean + timestamp
- **Privacy Policy acceptance** - Boolean + timestamp
- **Refund Policy acceptance** - Boolean + timestamp
- **Recurring billing agreement** - Boolean + timestamp
- **Right of withdrawal acknowledgment** - Boolean + timestamp

**Legal Basis:** Legal obligation (proof of consent)
**Retention:** Until account deletion + 7 years (legal compliance)

### 2. Data NOT Collected

To be clear, we do NOT collect:

- Calendar events, titles, descriptions, or attendees
- Google Calendar settings or preferences
- Calendar names or colors (set by you in Google Calendar)
- Photos, files, or attachments from calendar
- Contacts or contact information from calendar
- Location data or geolocation
- Biometric data
- Health or medical information
- Financial account information (handled by Paddle)
- Browsing history outside of calendar.google.com
- Data from other websites or services
- Voice or video recordings
- Messages or communications

### 3. How Data is Used

#### Primary Uses:

1. **Service Delivery** - Authenticate users and enable extension features
2. **Subscription Management** - Track subscription status and send unlock/lock signals
3. **Payment Processing** - Process payments via Paddle
4. **Communication** - Send transactional emails (payment confirmations, subscription changes)
5. **Support** - Respond to user inquiries and troubleshoot issues
6. **Security** - Detect and prevent fraud, abuse, and unauthorized access

#### Secondary Uses:

- **Product Improvement** - Analyze aggregate usage patterns (e.g., "% of users using feature X")
- **Legal Compliance** - Comply with legal obligations, court orders, or regulations

#### What We DON'T Do:

- **No selling of data** to third parties or data brokers
- **No advertising** or marketing profiling
- **No cross-service tracking** beyond what's needed for ColorKit
- **No AI training** on your data
- **No third-party analytics** (no Google Analytics, Meta Pixel, etc.)

---

## Third-Party Services & Data Sharing

### 1. Paddle Billing (Payment Processor)

**Service:** Subscription billing and payment processing
**Location:** UK-based, GDPR compliant
**Data Shared:** Email address, subscription selections
**Data They Collect:** Payment details (credit card, billing address, etc.)
**Purpose:** Process payments and manage subscriptions
**Privacy Policy:** https://www.paddle.com/legal/privacy

**Key Points:**

- Paddle is our **Merchant of Record** (they handle all payment compliance)
- Paddle is **PCI DSS Level 1** certified
- Payment data is processed by Paddle, never touches our servers
- Paddle handles **SCA (Strong Customer Authentication)** for EU users
- Paddle manages **sales tax/VAT** collection globally

### 2. Supabase (Database & Authentication)

**Service:** PostgreSQL database and authentication provider
**Location:** AWS data centers (configurable region)
**Data Stored:** User accounts, subscription status, push subscriptions, user agreements
**Data Shared:** Email (during Google OAuth)
**Purpose:** Store application data and authenticate users
**Privacy Policy:** https://supabase.com/privacy

**Key Points:**

- **SOC 2 Type II** certified
- **GDPR compliant**
- Database uses **Row-Level Security (RLS)** - users can only access their own data
- **Encryption at rest** and **in transit** (TLS 1.3)
- Backups retained for **7 days**

### 3. Vercel (Web Hosting)

**Service:** Serverless web application hosting
**Location:** Global CDN (closest to user)
**Data Processed:** HTTP requests, IP addresses (in logs)
**Purpose:** Host web portal and API endpoints
**Privacy Policy:** https://vercel.com/legal/privacy-policy

**Key Points:**

- **ISO 27001** certified
- **SOC 2** certified
- Access logs retained for **30 days**
- **GDPR compliant**
- Automatic **DDoS protection**

### 4. Google OAuth (Authentication)

**Service:** "Sign in with Google" authentication
**Location:** Google's global infrastructure
**Data Shared:** We request email, profile (name, picture)
**Purpose:** User authentication without passwords
**Privacy Policy:** https://policies.google.com/privacy

**Key Points:**

- We use **Google OAuth 2.0**
- Users can revoke access anytime via Google Account settings
- We do **NOT** request access to Google Calendar data
- We do **NOT** request Google Drive, Gmail, or other Google services

### 5. Chrome Web Push Service (Google FCM)

**Service:** Browser push notifications via Google's infrastructure
**Location:** Google's global infrastructure
**Data Shared:** Push notification endpoint (auto-generated by browser)
**Purpose:** Real-time subscription status updates
**Privacy Policy:** https://policies.google.com/privacy

**Key Points:**

- Uses **Web Push API standard** (not Firebase Cloud Messaging SDK)
- Push messages are **encrypted end-to-end** using browser-generated keys
- We authenticate using **VAPID protocol** (Voluntary Application Server Identification)
- Google cannot read push message contents (encrypted)
- **Free and unlimited** (no third-party service fee)

### 6. Chrome Web Store (Distribution)

**Service:** Extension distribution platform
**Location:** Google infrastructure
**Data Shared:** Extension metadata, reviews (if user posts)
**Purpose:** Distribute and update extension
**Privacy Policy:** https://policies.google.com/privacy

---

## Payment Processing & Billing

### Subscription Model

**Billing Provider:** Paddle Billing
**Merchant of Record:** Paddle.com Market Limited (UK company)

### Payment Methods Accepted

- Credit cards (Visa, Mastercard, Amex, Discover)
- Debit cards
- Apple Pay
- Google Pay
- PayPal
- Bank transfers (for certain regions)

### Subscription Plans

1. **Monthly Plan** - Recurring monthly billing
2. **Annual Plan** - Recurring annual billing (discounted)
3. **Free Trial** - 7 days for new users (requires payment method)

### Price IDs (for reference)

- **With trial:** `pri_01k81t07rfhatra9vs6zf8831c` (new users)
- **No trial:** `pri_01k8m1wyqcebmvsvsc7pwvy69j` (returning/resubscribing users)

### Billing Cycle

- **Charges processed by Paddle** on renewal date
- **Email receipts** sent automatically by Paddle
- **Failed payments** - Paddle retries automatically (grace period maintained)
- **Grace period status:** `past_due` (users retain access while Paddle retries)

### Automatic Renewal

- All subscriptions **auto-renew** by default
- Users can **cancel anytime** before next billing date
- **No refunds** for partial months/years (see Refund Policy)
- Cancellation takes effect at **end of current billing period**

### Tax Handling

- **Paddle calculates and collects all taxes** (VAT, GST, sales tax)
- Tax rates vary by jurisdiction
- **Tax compliance** handled by Paddle (Merchant of Record model)
- Receipts include tax breakdown

### Currency

- Paddle supports **140+ currencies**
- Prices displayed in user's local currency
- Currency conversion handled by Paddle

### Payment Security

- Paddle is **PCI DSS Level 1** compliant
- **3D Secure / SCA** for European customers
- **Fraud detection** by Paddle's system
- We **never** see or store card details

### Subscription Status Changes

- **Activation** - Instant unlock via Web Push notification (< 1 minute)
- **Cancellation** - Instant lock via Web Push notification
- **Expiration** - Access removed at end of paid period
- **Reactivation** - Instant unlock upon successful payment

---

## User Rights & Data Management

### Data Subject Rights (GDPR/CCPA)

Users have the following rights:

#### 1. Right of Access

- Users can **view all their data** via dashboard
- Users can **request data export** via email to support@calendarextension.com
- We provide data in **JSON or CSV format** within 30 days

**What's Included:**

- User account information
- Subscription history
- Payment records (limited - full records from Paddle)
- Policy acceptance records
- Technical data (push subscriptions)

#### 2. Right to Rectification

- Users can **update email** via dashboard
- Users can **update profile** via Google Account
- Contact support@calendarextension.com for corrections

#### 3. Right to Erasure ("Right to be Forgotten")

- Users can **delete account** via dashboard or support email
- **Immediate deletion:** User profile, session tokens, push subscriptions
- **Retained for legal compliance (7 years):** Payment records, user agreements
- **Third-party deletion:** We notify Paddle to anonymize customer record

**What happens:**

- Extension immediately locks (subscription inactive)
- Push subscriptions deleted
- Session tokens invalidated
- Database records marked as deleted
- Email removed from active systems

**What's retained:**

- Anonymized transaction records (legal requirement for 7 years)
- Aggregated analytics (no personal identifiers)

#### 4. Right to Data Portability

- Users can **export subscription data**
- Format: JSON or CSV
- Delivered via email within 30 days

#### 5. Right to Restrict Processing

- Users can request we **stop processing data** (except storage)
- Contact support@calendarextension.com

#### 6. Right to Object

- Users can object to data processing for **legitimate interests**
- We will cease unless we have **compelling legitimate grounds**

#### 7. Right to Withdraw Consent

- Users can **revoke Google OAuth** via Google Account settings
- Users can **uninstall extension** to stop browser data collection
- Users can **cancel subscription** to stop billing

### Data Retention Policy

| Data Type            | Retention Period                      | Reason               |
| -------------------- | ------------------------------------- | -------------------- |
| User account         | Until deletion                        | Service provision    |
| Session tokens       | 7 days                                | Security             |
| Push subscriptions   | Until unregistered or account deleted | Real-time updates    |
| Subscription records | Until deletion + 7 years              | Legal/tax compliance |
| Payment records      | Until deletion + 7 years              | Legal/tax compliance |
| User agreements      | Until deletion + 7 years              | Legal compliance     |
| Server logs          | 30 days                               | Security/debugging   |
| Database backups     | 7 days                                | Disaster recovery    |

### Account Deletion Process

1. User initiates deletion (dashboard or email)
2. We send confirmation email with **14-day cancellation window**
3. After 14 days:
   - User account marked as deleted
   - Extension immediately locks
   - Push subscriptions removed
   - Email removed from active systems
   - Paddle notified to anonymize customer
4. Retained for 7 years (anonymized):
   - Transaction IDs
   - Subscription start/end dates
   - Payment amounts
   - Tax records

---

## Security & Data Protection

### Data Encryption

**In Transit:**

- **TLS 1.3** for all HTTPS connections
- **HTTPS-only** (no HTTP fallback)
- **Certificate pinning** on extension (validates server identity)

**At Rest:**

- **AES-256 encryption** (Supabase default)
- Database backups encrypted
- Push notification payloads encrypted (browser-level)

**End-to-End Encryption:**

- **Web Push messages** encrypted with browser-generated keys
- Keys never leave user's device
- We cannot read push notification contents (only browser can decrypt)

### Authentication Security

**Google OAuth:**

- Industry-standard OAuth 2.0
- No passwords stored (delegated to Google)
- Tokens have expiration (1 hour for access, 7 days for refresh)
- Refresh token rotation on renewal

**Session Management:**

- **HTTP-only cookies** (not accessible to JavaScript)
- **SameSite=Lax** (CSRF protection)
- **Secure flag** (HTTPS only)
- Session invalidated on logout

**API Security:**

- **Bearer token authentication** for extension
- **Row-Level Security** (users can't access others' data)
- **Rate limiting** on API endpoints
- **CORS restrictions** (only whitelisted domains)

### Access Controls

**Internal Access:**

- **Role-based access control (RBAC)**
- **Principle of least privilege**
- **Audit logs** for admin actions
- **No direct database access** for staff (only via admin panel)

**Database Security:**

- **Row-Level Security (RLS)** policies enforce data isolation
- **Service Role key** restricted to server-side only (never exposed to client)
- **Connection pooling** with connection limits
- **SQL injection prevention** (parameterized queries)

### Vulnerability Management

**Security Practices:**

- **Dependency scanning** (automated via GitHub Dependabot)
- **Code review** for all changes
- **Security headers** (CSP, X-Frame-Options, etc.)
- **Input validation** on all user inputs
- **Output encoding** to prevent XSS

**Incident Response:**

- Security issues reported to: security@calendarextension.com
- **Response time:** Within 48 hours
- **Notification:** Users notified within 72 hours if data breach occurs (GDPR requirement)

### Third-Party Security

All third-party services are:

- **SOC 2 Type II** or **ISO 27001** certified
- **GDPR compliant**
- **Penetration tested** regularly
- **Encrypted data transmission** (TLS)

---

## Browser Extension Permissions

### Chrome Extension Manifest v3

ColorKit requests the following Chrome permissions:

#### 1. `storage`

**What it does:** Store user preferences and subscription status locally
**Data stored:** Subscription active flag, feature settings, session tokens
**Accessible by:** Only this extension
**Location:** Local browser storage (not synced to cloud)

#### 2. `tabs`

**What it does:** Query and send messages to Google Calendar tabs
**Use case:** Broadcast subscription status updates to open calendar pages
**Does NOT:** Read tab URLs, history, or content outside calendar.google.com

#### 3. `cookies`

**What it does:** Read Supabase session cookies
**Use case:** Maintain login state between web portal and extension
**Does NOT:** Track browsing or advertising

#### 4. `notifications`

**What it does:** Receive Web Push notifications
**Use case:** Get instant subscription status updates (unlock/lock)
**Does NOT:** Show spam or advertising notifications

#### 5. `alarms`

**What it does:** Schedule periodic subscription validation
**Use case:** Daily backup check (fallback if push fails)
**Frequency:** Once every 3 days at 4:00 AM local time

### Host Permissions

Extension can access:

#### 1. `https://calendar.google.com/*`

**Purpose:** Inject customization styles (colors, UI modifications)
**Access level:** Read and modify calendar page DOM (visual only)
**Does NOT:** Read calendar events or data

#### 2. `https://*.supabase.co/*`

**Purpose:** Authenticate user and check subscription status
**Access level:** Make API requests to our backend
**Does NOT:** Access your Supabase account (if you have one)

#### 3. `https://portal.calendarextension.com/*`

**Purpose:** Communicate with web portal
**Access level:** Send/receive subscription status messages
**Does NOT:** Track browsing

#### 4. Development domains (localhost, vercel.app)

**Purpose:** Testing and development only
**Removed in production builds:** No (but inactive unless you're on localhost)

### What Extension CANNOT Do

To be clear, ColorKit extension **CANNOT:**

- Read your calendar events, titles, or descriptions
- Access your Google account data (Drive, Gmail, Photos, etc.)
- Track your browsing history
- Monitor other websites
- Take screenshots
- Record your screen or keyboard
- Access your microphone or camera
- Read your contacts
- Access your location
- Modify websites other than calendar.google.com

### Data Collected by Extension

**Local browser storage only:**

- Subscription active status (boolean)
- Feature preferences (e.g., "day coloring enabled")
- Session tokens (for API authentication)
- Push subscription endpoint

**Never leaves your device:**

- Your calendar customization preferences
- Local extension state

---

## Cookies & Local Storage

### First-Party Cookies (Web Portal)

| Cookie Name        | Purpose             | Duration | Type      |
| ------------------ | ------------------- | -------- | --------- |
| `sb-access-token`  | User authentication | 1 hour   | Essential |
| `sb-refresh-token` | Session renewal     | 7 days   | Essential |

**Properties:**

- **HttpOnly** (not accessible to JavaScript)
- **Secure** (HTTPS only)
- **SameSite=Lax** (CSRF protection)
- **Path=/** (site-wide)

### Extension Local Storage (Chrome)

**Stored data:**

- `authenticated` (boolean)
- `supabaseSession` (access & refresh tokens)
- `subscriptionActive` (boolean)
- `subscriptionStatus` (object with details)
- `pushSubscription` (Web Push endpoint)
- Feature preferences (e.g., `dayColoringEnabled`)

**Accessible by:** Only ColorKit extension
**Not synced to Google account** (local only)
**Deleted when:** Extension uninstalled or manually cleared

### Third-Party Cookies

**We do NOT use:**

- Google Analytics cookies
- Facebook Pixel
- Advertising cookies
- Cross-site tracking cookies
- Social media cookies (except during Google OAuth flow)

**Paddle may set cookies** during checkout:

- See Paddle's cookie policy: https://www.paddle.com/legal/cookie-policy
- Used for fraud prevention and payment processing

---

## International Considerations

### GDPR Compliance (European Union)

**Data Controller:** [Your Company Name and Address]
**Data Protection Officer:** [DPO Email] (if required)

**Legal Basis for Processing:**

- **Contractual necessity** - To provide ColorKit service
- **Legitimate interest** - Service improvement and security
- **Legal obligation** - Tax and accounting records
- **Consent** - Marketing communications (if applicable)

**Data Transfers:**

- Supabase (US-based) - **EU Standard Contractual Clauses (SCCs)**
- Paddle (UK-based) - **Adequacy decision** (UK GDPR)
- Vercel (US-based) - **EU Standard Contractual Clauses (SCCs)**

**User Rights:** See "User Rights & Data Management" section above

**Data Breach Notification:**

- **Supervisory authority notified** within 72 hours
- **Users notified** within 72 hours if high risk

**Data Protection Impact Assessment (DPIA):**

- Conducted for high-risk processing activities
- Available upon request

### CCPA Compliance (California, USA)

**Business Name:** [Your Company Name]
**Categories of Personal Information Collected:**

- Identifiers (email, customer ID)
- Commercial information (subscription history)
- Internet activity (push subscription endpoints, IP logs)

**Purpose of Collection:**

- Service delivery
- Payment processing
- Customer support

**Third Parties with Access:**

- Paddle (payment processing)
- Supabase (data storage)
- Vercel (hosting)

**Sale of Personal Information:**

- We do **NOT** sell personal information
- We do **NOT** share for cross-context behavioral advertising

**Consumer Rights:**

- **Right to know** - Request disclosure of data collected
- **Right to delete** - Request deletion of data
- **Right to opt-out** - (Not applicable - we don't sell data)
- **Right to non-discrimination** - No penalty for exercising rights

**Shine the Light Law:**

- We do not disclose personal information to third parties for marketing purposes

### UK GDPR (United Kingdom)

Same as EU GDPR with UK-specific supervisory authority:

- **ICO (Information Commissioner's Office)** is supervisory authority
- Data transfers from EU to UK covered by **adequacy decision**

### Other Jurisdictions

**Canada (PIPEDA):**

- Consent obtained for collection and use
- Users can access and correct data
- Safeguards in place for data protection

**Australia (Privacy Act):**

- Australian Privacy Principles (APPs) compliance
- Overseas data transfers disclosed
- Users can access and correct data

**Brazil (LGPD):**

- Similar to GDPR
- Users can request deletion and correction
- Data transfers documented

---

## Service Architecture & Availability

### Hosting Infrastructure

**Web Portal:**

- Hosted on **Vercel** (serverless)
- **Global CDN** (low latency worldwide)
- **Automatic scaling** (handles traffic spikes)
- **99.9% uptime SLA** (Vercel commitment)

**Database:**

- Hosted on **Supabase** (managed PostgreSQL)
- **AWS infrastructure** (configurable region)
- **Automated backups** (daily, 7-day retention)
- **Point-in-time recovery** (last 7 days)

**Extension:**

- Distributed via **Chrome Web Store**
- No server required (runs locally)
- Works offline (after initial authentication)

### Service Availability

**Uptime Target:** 99.9% (excluding maintenance)

**Maintenance Windows:**

- Scheduled maintenance announced 7 days in advance
- Typical duration: < 1 hour
- Conducted during low-traffic hours (2-4 AM UTC)

**Monitoring:**

- **Uptime monitoring** (24/7 automated checks)
- **Error tracking** (Vercel logs)
- **Performance monitoring** (API response times)

**Incident Response:**

- **Critical incidents** resolved within 4 hours
- **High-priority** resolved within 24 hours
- **Status page** (if implemented) for real-time updates

### Data Backups

**Frequency:** Daily (automated)
**Retention:** 7 days
**Location:** Same region as primary database
**Encryption:** AES-256
**Restoration Time:** < 24 hours (if needed)

**What's Backed Up:**

- User accounts
- Subscription records
- Payment history
- User agreements

**Not Backed Up:**

- Session tokens (temporary)
- Server logs (separate retention)

### Disaster Recovery

**Recovery Time Objective (RTO):** 4 hours
**Recovery Point Objective (RPO):** 24 hours (max data loss)

**Disaster Scenarios:**

- **Database failure** → Restore from backup
- **Hosting provider outage** → Failover to backup region (if configured)
- **Extension malfunction** → Rollback to previous version via Chrome Web Store

---

## Changelog

### Version 1.0 (2025-10-28)

- Initial legal technical reference document created
- Comprehensive data collection documentation
- Third-party service audit
- Extension permissions detailed
- GDPR/CCPA compliance mapped

---

## Document Usage

This document is intended to support the creation of:

1. **Privacy Policy** - Use sections on data collection, third-party services, user rights
2. **Terms & Conditions** - Use sections on service model, architecture, availability
3. **Refund Policy** - Use sections on payment processing, subscription management
4. **Cookie Policy** - Use sections on cookies and local storage

### Key Points for Privacy Policy:

- We collect minimal personal data (email, subscription status)
- We do NOT read calendar events or data
- Payment data handled by Paddle (PCI compliant)
- Users have full rights (access, delete, export)
- GDPR and CCPA compliant

### Key Points for Terms of Service:

- Subscription-based service (recurring billing)
- Extension modifies calendar visual appearance only
- No guarantee of 100% uptime (best effort 99.9%)
- Users must comply with Google's Terms of Service
- Cancellation anytime (prorated refunds per refund policy)

### Key Points for Refund Policy:

- Managed through Paddle Billing
- Free trial period (7 days for new users)
- Cancellation anytime (access until end of billing period)
- Refund terms set by Paddle's policies
- Contact support@calendarextension.com for refund requests

---

## Contact Information

**For legal inquiries:**
legal@calendarextension.com

**For privacy inquiries:**
privacy@calendarextension.com

**For general support:**
support@calendarextension.com

**For security reports:**
security@calendarextension.com

**Data Protection Officer** (if required by GDPR):
dpo@calendarextension.com

---

**End of Document**
