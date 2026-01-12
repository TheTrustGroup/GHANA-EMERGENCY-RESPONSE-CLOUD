/**
 * Quick Environment Variables Test
 * Run: npx tsx scripts/test-env-vars.ts
 * 
 * This script checks if all required environment variables are set
 */

const requiredVars = {
  // Mapbox
  'NEXT_PUBLIC_MAPBOX_TOKEN': 'Mapbox token for maps',
  
  // Pusher
  'PUSHER_APP_ID': 'Pusher app ID',
  'NEXT_PUBLIC_PUSHER_KEY': 'Pusher public key',
  'PUSHER_SECRET': 'Pusher secret',
  'NEXT_PUBLIC_PUSHER_CLUSTER': 'Pusher cluster',
  
  // AWS S3
  'AWS_ACCESS_KEY_ID': 'AWS access key ID',
  'AWS_SECRET_ACCESS_KEY': 'AWS secret access key',
  'AWS_REGION': 'AWS region',
  'AWS_S3_BUCKET': 'S3 bucket name',
};

const optionalVars = {
  'DATABASE_URL': 'Database connection string',
  'NEXTAUTH_SECRET': 'NextAuth secret',
  'NEXTAUTH_URL': 'NextAuth URL',
};

function checkEnvVars() {
  console.log('\n🔍 Checking Environment Variables...\n');
  
  let allGood = true;
  const missing: string[] = [];
  const present: string[] = [];
  
  // Check required vars
  for (const [varName, description] of Object.entries(requiredVars)) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      console.log(`❌ ${varName}`);
      console.log(`   Missing: ${description}`);
      missing.push(varName);
      allGood = false;
    } else {
      // Mask sensitive values
      const masked = varName.includes('SECRET') || varName.includes('KEY')
        ? `${value.substring(0, 8)}...`
        : value;
      console.log(`✅ ${varName} = ${masked}`);
      present.push(varName);
    }
  }
  
  // Check optional vars
  console.log('\n📋 Optional Variables:');
  for (const [varName, description] of Object.entries(optionalVars)) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      console.log(`⚠️  ${varName} - ${description} (not set)`);
    } else {
      console.log(`✅ ${varName} - Set`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ All required environment variables are set!');
    console.log('\nYou can now test the flows:');
    console.log('  1. Citizen reporting: http://localhost:3000/report');
    console.log('  2. Dispatcher center: http://localhost:3000/dispatch');
  } else {
    console.log(`❌ Missing ${missing.length} required variable(s):`);
    missing.forEach(v => console.log(`   - ${v}`));
    console.log('\n📖 See AWS_S3_SETUP.md for AWS S3 setup');
    console.log('📖 See GET_API_KEYS.md for other API keys');
  }
  console.log('='.repeat(50) + '\n');
  
  return allGood;
}

// Run check
checkEnvVars();
