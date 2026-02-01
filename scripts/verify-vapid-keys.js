#!/usr/bin/env node

/**
 * VAPID Key Verification Script
 *
 * This script helps diagnose VAPID key mismatches between:
 * 1. Extension config (config.production.js)
 * 2. Backend environment variables (Vercel)
 *
 * CRITICAL: If these don't match, push notifications will NEVER work!
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function computeVapidHash(publicKey) {
  if (!publicKey) return '';
  return crypto.createHash('sha256').update(publicKey.trim()).digest('hex').substring(0, 16);
}

async function main() {
  log('\n=== VAPID Key Verification Tool ===\n', 'bold');

  // Step 1: Read extension config
  log('Step 1: Reading Extension Config...', 'cyan');
  const extensionConfigPath = path.join(__dirname, '../../customise calendar 3/config.production.js');

  let extensionVapidKey = null;
  try {
    const configContent = fs.readFileSync(extensionConfigPath, 'utf-8');
    const match = configContent.match(/VAPID_PUBLIC_KEY:\s*['"]([^'"]+)['"]/);
    if (match) {
      extensionVapidKey = match[1];
      log(`✓ Extension VAPID_PUBLIC_KEY found`, 'green');
      log(`  Key preview: ${extensionVapidKey.substring(0, 20)}...`, 'blue');
      log(`  Key hash: ${computeVapidHash(extensionVapidKey)}`, 'blue');
    } else {
      log(`✗ Could not find VAPID_PUBLIC_KEY in extension config`, 'red');
    }
  } catch (error) {
    log(`✗ Error reading extension config: ${error.message}`, 'red');
  }

  // Step 2: Read backend environment variable
  log('\nStep 2: Reading Backend Environment Variable...', 'cyan');
  const backendVapidKey = process.env.VAPID_PUBLIC_KEY;

  if (backendVapidKey) {
    log(`✓ Backend VAPID_PUBLIC_KEY found`, 'green');
    log(`  Key preview: ${backendVapidKey.substring(0, 20)}...`, 'blue');
    log(`  Key hash: ${computeVapidHash(backendVapidKey)}`, 'blue');
  } else {
    log(`✗ VAPID_PUBLIC_KEY environment variable not set`, 'red');
    log(`  You need to set this in your Vercel Dashboard`, 'yellow');
  }

  // Step 3: Compare keys
  log('\nStep 3: Comparing Keys...', 'cyan');

  if (extensionVapidKey && backendVapidKey) {
    const trimmedExtension = extensionVapidKey.trim();
    const trimmedBackend = backendVapidKey.trim();

    if (trimmedExtension === trimmedBackend) {
      log('✓ KEYS MATCH! This is correct.', 'green');
    } else {
      log('✗ KEYS DO NOT MATCH! This is the problem!', 'red');
      log('\nExtension key:', 'yellow');
      log(`  ${trimmedExtension}`, 'yellow');
      log('\nBackend key:', 'yellow');
      log(`  ${trimmedBackend}`, 'yellow');
      log('\nTo fix this, you must:', 'magenta');
      log('  1. Choose which key to use (usually keep backend key)', 'magenta');
      log('  2. Update extension config.production.js with that key', 'magenta');
      log('  3. Rebuild and republish the extension', 'magenta');
    }
  } else if (!extensionVapidKey && !backendVapidKey) {
    log('✗ Neither extension nor backend has VAPID keys configured!', 'red');
  } else if (!extensionVapidKey) {
    log('✗ Extension is missing VAPID_PUBLIC_KEY', 'red');
  } else {
    log('✗ Backend is missing VAPID_PUBLIC_KEY environment variable', 'red');
  }

  // Step 4: Check for other required env vars
  log('\nStep 4: Checking Other Required Environment Variables...', 'cyan');

  const requiredVars = [
    'VAPID_PRIVATE_KEY',
    'VAPID_SUBJECT',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PADDLE_NOTIFICATION_WEBHOOK_SECRET',
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`✓ ${varName} is set`, 'green');
    } else {
      log(`✗ ${varName} is NOT set`, 'red');
    }
  }

  // Step 5: Instructions
  log('\n=== Next Steps ===', 'bold');
  log('\nTo fix VAPID key issues:', 'cyan');
  log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables', 'blue');
  log('2. Verify these are set:', 'blue');
  log('   - VAPID_PUBLIC_KEY', 'blue');
  log('   - VAPID_PRIVATE_KEY', 'blue');
  log('   - VAPID_SUBJECT (e.g., mailto:support@yourapp.com)', 'blue');
  log('3. Copy the VAPID_PUBLIC_KEY from Vercel', 'blue');
  log('4. Update customise calendar 3/config.production.js line 25', 'blue');
  log('5. Rebuild extension: cd "customise calendar 3" && npm run build', 'blue');
  log('6. Republish extension to Chrome Web Store', 'blue');
  log('\nAlternatively, generate NEW keys and update both:', 'cyan');
  log('1. Run: npx web-push generate-vapid-keys', 'blue');
  log('2. Set keys in both Vercel Dashboard AND extension config', 'blue');
  log('3. Clear old subscriptions in database', 'blue');

  log('\n');
}

main().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
