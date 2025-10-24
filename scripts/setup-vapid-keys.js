#!/usr/bin/env node

/**
 * VAPID Key Setup Script
 *
 * Generates new VAPID keys and provides instructions for configuring
 * both the extension and backend with matching keys.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

async function main() {
  log('\n=== VAPID Key Setup Wizard ===\n', 'bold');

  log('This script will help you generate and configure VAPID keys for push notifications.\n', 'cyan');

  // Check if we should generate new keys or use existing
  const answer = await question('Do you want to generate NEW VAPID keys? (y/n): ');

  if (answer.toLowerCase() !== 'y') {
    log('\nCancelled. Use verify-vapid-keys.js to check your current configuration.', 'yellow');
    return;
  }

  // Generate new keys
  log('\nGenerating new VAPID keys...', 'cyan');

  let publicKey, privateKey;

  try {
    const output = execSync('npx web-push generate-vapid-keys --json', {
      encoding: 'utf-8',
    });

    const keys = JSON.parse(output);
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;

    log('✓ Keys generated successfully!', 'green');
  } catch (error) {
    log('✗ Error generating keys. Make sure web-push is installed:', 'red');
    log('  npm install web-push', 'yellow');
    process.exit(1);
  }

  // Display keys
  log('\n=== Your New VAPID Keys ===', 'bold');
  log('\nPublic Key:', 'cyan');
  log(publicKey, 'green');
  log('\nPrivate Key:', 'cyan');
  log(privateKey, 'green');

  // Instructions for Vercel
  log('\n=== Step 1: Configure Vercel Environment Variables ===', 'bold');
  log('\n1. Go to: https://vercel.com/dashboard', 'blue');
  log('2. Select your project (paddle-nextjs-starter-kit)', 'blue');
  log('3. Go to: Settings → Environment Variables', 'blue');
  log('4. Add/Update these variables for ALL environments (Production, Preview, Development):\n', 'blue');

  log('   Variable Name: VAPID_PUBLIC_KEY', 'yellow');
  log(`   Value: ${publicKey}\n`, 'green');

  log('   Variable Name: VAPID_PRIVATE_KEY', 'yellow');
  log(`   Value: ${privateKey}\n`, 'green');

  log('   Variable Name: VAPID_SUBJECT', 'yellow');
  log('   Value: mailto:support@calendarextension.com', 'green');
  log('   (or your actual support email)\n', 'blue');

  // Instructions for Extension
  log('\n=== Step 2: Update Extension Configuration ===', 'bold');

  const extensionConfigPath = path.join(__dirname, '../../customise calendar 3/config.production.js');

  log('\n1. Open file: customise calendar 3/config.production.js', 'blue');
  log('2. Find line 25 (VAPID_PUBLIC_KEY)', 'blue');
  log('3. Replace the value with:\n', 'blue');

  log(`   VAPID_PUBLIC_KEY: '${publicKey}',`, 'green');

  // Offer to update automatically
  const updateConfig = await question('\nDo you want me to update the extension config automatically? (y/n): ');

  if (updateConfig.toLowerCase() === 'y') {
    try {
      let configContent = fs.readFileSync(extensionConfigPath, 'utf-8');

      // Replace VAPID_PUBLIC_KEY value
      configContent = configContent.replace(/VAPID_PUBLIC_KEY:\s*['"]([^'"]+)['"]/, `VAPID_PUBLIC_KEY: '${publicKey}'`);

      fs.writeFileSync(extensionConfigPath, configContent, 'utf-8');

      log('✓ Extension config updated!', 'green');
    } catch (error) {
      log(`✗ Could not update config automatically: ${error.message}`, 'red');
      log('Please update manually.', 'yellow');
    }
  }

  // Instructions for rebuilding extension
  log('\n=== Step 3: Rebuild and Republish Extension ===', 'bold');
  log('\n1. Build the extension:', 'blue');
  log('   cd "customise calendar 3"', 'yellow');
  log('   npm run build', 'yellow');
  log('\n2. Test locally:', 'blue');
  log('   - Go to chrome://extensions', 'yellow');
  log('   - Enable Developer mode', 'yellow');
  log('   - Click "Load unpacked" and select the extension directory', 'yellow');
  log('\n3. Republish to Chrome Web Store:', 'blue');
  log('   - Package the extension as .zip', 'yellow');
  log('   - Upload to Chrome Web Store Developer Dashboard', 'yellow');

  // Instructions for database cleanup
  log('\n=== Step 4: Clean Old Subscriptions (IMPORTANT!) ===', 'bold');
  log('\nOld push subscriptions created with the old VAPID keys will NOT work.', 'yellow');
  log('You have two options:\n', 'cyan');

  log('Option 1: Let them expire naturally', 'blue');
  log('  - Backend will auto-delete mismatched subscriptions on next push', 'blue');
  log('  - Users will re-register when they open extension', 'blue');

  log('\nOption 2: Manually delete all subscriptions (recommended)', 'blue');
  log('  - Go to Supabase Dashboard → SQL Editor', 'blue');
  log('  - Run: DELETE FROM push_subscriptions;', 'blue');
  log('  - All users will re-register automatically', 'blue');

  // Final checklist
  log('\n=== Final Checklist ===', 'bold');
  log('□ Set VAPID keys in Vercel Dashboard', 'yellow');
  log('□ Update extension config.production.js', 'yellow');
  log('□ Rebuild extension', 'yellow');
  log('□ Test locally', 'yellow');
  log('□ Republish to Chrome Web Store', 'yellow');
  log('□ Clean old push subscriptions', 'yellow');
  log('□ Test end-to-end push notification flow', 'yellow');

  log('\nOnce complete, run: node scripts/verify-vapid-keys.js to verify setup\n', 'cyan');
}

main().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
