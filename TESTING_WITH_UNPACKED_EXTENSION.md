# Testing with Unpacked Extension - Critical Instructions

## The Problem with NEXT_PUBLIC_EXTENSION_ID

When testing with an unpacked/local extension, the extension ID **changes every time** you load it. This causes a timing issue with `NEXT_PUBLIC_EXTENSION_ID` because:

1. **NEXT_PUBLIC variables are compiled at BUILD time, not runtime**
2. When you update the environment variable and redeploy, the old build is still served until deployment completes
3. If testers visit the site during/before deployment, they get the old build with the old extension ID
4. The extension never receives unlock messages because the web app is sending to the wrong ID

---

## Correct Testing Procedure

### For the Developer (You)

1. **Get the new extension ID from tester:**
   - Tester loads unpacked extension in Chrome
   - Tester sends you the extension ID from `chrome://extensions`

2. **Update Vercel environment variable:**

   ```bash
   # Go to Vercel Dashboard → Project → Settings → Environment Variables
   # Update: NEXT_PUBLIC_EXTENSION_ID=<new-extension-id>
   ```

3. **Trigger redeployment:**
   - Make a small commit and push to trigger deployment
   - OR manually redeploy from Vercel dashboard

4. **Wait for deployment to complete (2-3 minutes):**
   - Check Vercel dashboard for "✅ Ready"
   - Verify deployment timestamp is after the environment variable change

5. **Tell tester deployment is ready:**
   - Give tester the EXACT deployment URL (e.g., `https://portal.calendarextension.com`)
   - Confirm deployment timestamp with tester

### For the Tester

1. **Load unpacked extension:**
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select extension folder
   - **Copy the extension ID** (shows under extension name)

2. **Send extension ID to developer**

3. **WAIT for developer to confirm deployment is ready**
   - Do NOT start testing until developer says "ready"
   - Developer will tell you when deployment is complete

4. **Hard refresh the web app:**

   ```
   Windows/Linux: Ctrl + Shift + R
   Mac: Cmd + Shift + R
   ```

   - This ensures you're loading the NEW build with the correct extension ID

5. **Check browser console (F12) on dashboard:**
   - Look for this message:
     ```
     🔔 [ExtensionNotifier] Attempting to send message to extension
        Message type: AUTH_SUCCESS
        Target Extension ID: <your-extension-id>
     ```
   - Verify the extension ID matches what you see in `chrome://extensions`
   - If IDs don't match → do another hard refresh

6. **Now start testing:**
   - Go through onboarding
   - Complete payment
   - Extension should unlock automatically

---

## Troubleshooting

### Issue: Extension not unlocking after payment

**Check browser console on dashboard page:**

If you see:

```
❌ [ExtensionNotifier] Extension not responding!
   Error: Could not establish connection. Receiving end does not exist.
   Extension ID used: abc123xyz
```

**Possible causes:**

1. **Wrong extension ID** (most common with unpacked extensions)
   - Compare the ID in console with `chrome://extensions`
   - If different → old build is cached
   - Solution: Hard refresh (Ctrl+Shift+R)

2. **Extension not installed**
   - Verify extension is enabled in `chrome://extensions`
   - Reload extension if needed

3. **Extension crashed**
   - Check `chrome://extensions` for errors
   - Click "Errors" button to see details
   - Try reloading extension

4. **Deployment timing issue**
   - Web app loaded before deployment finished
   - Solution: Wait for deployment + hard refresh

---

## Why This Only Happens with Unpacked Extensions

**Chrome Web Store extensions:**

- Have a FIXED extension ID that never changes
- You set `NEXT_PUBLIC_EXTENSION_ID` once
- It works for all users forever

**Unpacked/local extensions:**

- Get a NEW random ID every time they're loaded
- Requires updating environment variable each time
- Requires waiting for deployment before testing
- **This is why proper timing is critical**

---

## Production Deployment (Web Store)

Once you publish to Chrome Web Store:

1. The extension gets a permanent ID
2. Set `NEXT_PUBLIC_EXTENSION_ID` to that permanent ID
3. Deploy once
4. Works for all users automatically
5. No more timing issues!

---

## Quick Reference

### Developer Checklist

- [ ] Get extension ID from tester
- [ ] Update `NEXT_PUBLIC_EXTENSION_ID` in Vercel
- [ ] Redeploy and wait for completion
- [ ] Verify deployment timestamp
- [ ] Tell tester it's ready

### Tester Checklist

- [ ] Load unpacked extension
- [ ] Send extension ID to developer
- [ ] **WAIT** for "ready" confirmation
- [ ] Hard refresh web app (Ctrl+Shift+R)
- [ ] Check extension ID in console matches
- [ ] Start testing

---

## Debug Commands

**Check current deployment:**

```bash
cd "Documents/Backend 2.0/paddle-nextjs-starter-kit"
git log -1 --oneline  # Check latest commit
```

**Check Vercel deployment status:**

- Visit: https://vercel.com/dashboard
- Check deployment timestamp
- Verify "Ready" status

**Browser console check:**

```javascript
// On dashboard page, open console (F12) and look for:
// 🔔 [ExtensionNotifier] Attempting to send message to extension
//    Target Extension ID: <should-match-your-extension>
```
