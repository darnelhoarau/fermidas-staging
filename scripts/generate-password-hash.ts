#!/usr/bin/env node
/**
 * Generate a bcrypt password hash for database testing
 * Usage: npm run generate-password-hash <password>
 * Example: npm run generate-password-hash mypassword123
 */

import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('Error: Password is required');
  console.log('Usage: npm run generate-password-hash <password>');
  console.log('Example: npm run generate-password-hash mypassword123');
  process.exit(1);
}

async function generateHash() {
  try {
    // Use the same salt rounds as in the registration route (10)
    const hash = await bcrypt.hash(password, 10);

    console.log('\n✅ Password hash generated successfully!\n');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\n📋 SQL to update user password:');
    console.log(
      `UPDATE users SET password = '${hash}' WHERE email = 'your-email@example.com';\n`
    );
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

generateHash();
