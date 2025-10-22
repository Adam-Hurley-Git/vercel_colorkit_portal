# 🚀 VERCEL DEPLOYMENT CHECKLIST

Complete this checklist before and during deployment to ensure smooth deployment of ColorKit to Vercel.

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Code Preparation

- [ ] All code changes committed to Git
- [ ] No `.env.local` secrets in commits (use `.env.production` template)
- [ ] Run `npm run verify-build` or `pnpm verify-build` successfully
- [ ] Run `npm run lint` or `pnpm lint` with no errors
- [ ] Test app locally on `http://localhost:3000`

### 2. Environment Variables Ready

- [ ] Supabase URL and Anon Key copied
- [ ] Supabase Service Role Key copied (KEEP SECRET)
- [ ] Paddle API Key copied (KEEP SECRET)
- [ ] Paddle Client Token copied
- [ ] Paddle Webhook Secret copied (KEEP SECRET)
- [ ] Paddle environment set (`sandbox` or `production`)

### 3. Git Repository

- [ ] Repository created on GitHub
- [ ] Code pushed to `main` branch
- [ ] All files synced (check `git status`)

---

## 🔧 VERCEL DEPLOYMENT STEPS

### 1. Create Vercel Project

- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository
- [ ] Verify Next.js detected automatically
- [ ] Leave build settings as default

### 2. Configure Environment Variables

**In Vercel Dashboard → Settings → Environment Variables:**

Add these variables (Production environment):

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ⚠️ SECRET
- [ ] `NEXT_PUBLIC_PADDLE_ENV` = `sandbox`
- [ ] `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- [ ] `PADDLE_API_KEY` ⚠️ SECRET
- [ ] `PADDLE_NOTIFICATION_WEBHOOK_SECRET` ⚠️ SECRET
- [ ] `NEXT_PUBLIC_EXTENSION_ID` (leave empty for now)

**Enable:**

- [ ] "Automatically expose System Environment Variables" checkbox

### 3. Deploy

- [ ] Click "Deploy" button
- [ ] Wait for build to complete (check logs for errors)
- [ ] Note your deployment URL: `https://_________________.vercel.app`

---

## 🔌 EXTERNAL SERVICES CONFIGURATION

### 1. Supabase Setup

**Go to: Supabase Dashboard → Authentication → URL Configuration**

- [ ] Add to Redirect URLs:
  - `https://your-project.vercel.app`
  - `https://your-project.vercel.app/auth/callback`
  - `https://your-project.vercel.app/*`
- [ ] Set Site URL: `https://your-project.vercel.app`
- [ ] Click "Save"

### 2. Paddle Webhook Setup

**Go to: Paddle Dashboard → Developer Tools → Notifications**

- [ ] Update webhook endpoint: `https://your-project.vercel.app/api/webhook`
- [ ] Verify secret key matches `PADDLE_NOTIFICATION_WEBHOOK_SECRET`
- [ ] Test webhook (use Paddle's test tool)

### 3. Paddle Domain Approval

**Go to: Paddle → Checkout → Website Approval**

- [ ] Add domain: `https://your-project.vercel.app`
- [ ] Wait for approval (instant for sandbox)

**Go to: Paddle → Checkout → Checkout Settings**

- [ ] Set default payment link: `https://your-project.vercel.app`
- [ ] Click "Save"

---

## 🧩 CHROME EXTENSION SETUP

### 1. Load Extension

- [ ] Open Chrome → `chrome://extensions/`
- [ ] Enable Developer Mode
- [ ] Click "Load unpacked"
- [ ] Select `customise calendar 3` folder
- [ ] Copy Extension ID: `____________________________`

### 2. Update Extension Configuration

**Choose ONE of these approaches:**

**Option A: Use config.production.js (Recommended)**

- [ ] Open `config.production.js`
- [ ] Update `WEB_APP_URL` with your Vercel URL
- [ ] Update imports in these files to use `config.production.js`:
  - `background.js`
  - `popup/popup.js`
  - `lib/subscription-validator.js`
- [ ] Reload extension in Chrome

**Option B: Update config.js directly**

- [ ] Open `config.js`
- [ ] Change `WEB_APP_URL` to your Vercel URL
- [ ] Change `ENVIRONMENT` to `'production'`
- [ ] Change `DEBUG` to `false`
- [ ] Reload extension in Chrome

### 3. Add Extension ID to Vercel

- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Add `NEXT_PUBLIC_EXTENSION_ID` with your extension ID
- [ ] Environment: Production
- [ ] Save
- [ ] Go to Vercel → Deployments
- [ ] Click ⋯ → "Redeploy" on latest deployment

### 4. Update Supabase for Extension

**Go to: Supabase → Authentication → URL Configuration**

- [ ] Add to Redirect URLs:
  - `chrome-extension://<your-extension-id>/popup/popup.html`
  - `chrome-extension://<your-extension-id>/*`
- [ ] Click "Save"

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Build Verification

- [ ] No build errors in Vercel logs
- [ ] Deployment status: Ready
- [ ] Functions deployed successfully

### 2. App Health Check

- [ ] Visit `https://your-project.vercel.app`
- [ ] Page loads without errors
- [ ] Check browser console (F12) - no errors
- [ ] Styles load correctly
- [ ] Can navigate to `/signup`

### 3. Extension Connection Test

- [ ] Open Chrome extension popup
- [ ] Right-click popup → Inspect → Console
- [ ] Should see: `[ColorKit] Checking auth and subscription status...`
- [ ] Should show auth overlay (if not logged in)

### 4. Authentication Flow Test

- [ ] Click "Get Started" in extension
- [ ] Should open Vercel URL
- [ ] Complete signup
- [ ] Extension should receive AUTH_SUCCESS message
- [ ] Auth overlay should disappear

### 5. Subscription Test

- [ ] Complete checkout with Paddle test card (`4242 4242 4242 4242`)
- [ ] Check Vercel logs for webhook received
- [ ] Check Supabase for subscription data
- [ ] Extension should validate subscription
- [ ] Should show "7 days remaining" banner

---

## 🚨 TROUBLESHOOTING

### Build Fails

- [ ] Check Vercel build logs for error details
- [ ] Verify all dependencies in `package.json`
- [ ] Test build locally: `npm run build`
- [ ] Check Node version matches `.nvmrc`

### Environment Variables Not Working

- [ ] Verify variables are set in Vercel dashboard
- [ ] Check variable names match exactly (case-sensitive)
- [ ] Redeploy after adding variables
- [ ] Clear browser cache and hard refresh

### Extension Can't Connect

- [ ] Verify `NEXT_PUBLIC_EXTENSION_ID` set in Vercel
- [ ] Check extension manifest.json has Vercel URL
- [ ] Verify config points to correct Vercel URL
- [ ] Check CORS headers in browser network tab

### Webhook Not Firing

- [ ] Verify webhook URL matches Vercel deployment
- [ ] Check Paddle dashboard for webhook delivery logs
- [ ] Test webhook manually with Paddle's tool
- [ ] Check Vercel function logs for errors

### Supabase Auth Issues

- [ ] Verify redirect URLs include Vercel domain
- [ ] Check cookies are being set (browser dev tools)
- [ ] Verify Supabase URLs in environment variables
- [ ] Test auth flow in incognito window

---

## 📋 QUICK REFERENCE

**Vercel URL:** `https://_________________.vercel.app`
**Extension ID:** `_____________________________________`
**Git Repo:** `https://github.com/_______________/_______________`

---

## 🎯 SUCCESS CRITERIA

Deployment is complete when ALL of these are true:

- ✅ Vercel build succeeds
- ✅ App loads at Vercel URL
- ✅ Extension loads without errors
- ✅ "Get Started" opens Vercel URL
- ✅ Signup/login works
- ✅ Extension receives auth messages
- ✅ Subscription API returns correct status
- ✅ Paddle checkout works
- ✅ Webhook saves to Supabase
- ✅ Extension features work on Google Calendar

---

## 📚 NEXT STEPS

After successful deployment:

1. **Test thoroughly** - Follow VERCEL_TESTING_GUIDE.md
2. **Monitor logs** - Check Vercel function logs for errors
3. **Set up monitoring** - Consider adding error tracking
4. **Plan production migration** - Move from Paddle sandbox to production when ready

---

**Need Help?** Check:

- VERCEL_TESTING_GUIDE.md for detailed testing steps
- Vercel logs: Dashboard → Deployments → View Function Logs
- Paddle logs: Dashboard → Developer Tools → Event Logs
- Supabase logs: Dashboard → Logs
