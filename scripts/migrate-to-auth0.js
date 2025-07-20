#!/usr/bin/env node

/**
 * Migration script to help transition from NextAuth to Auth0
 * Run this script after setting up Auth0 to migrate existing users
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateToAuth0() {
  console.log('🚀 Starting migration to Auth0...\n');

  try {
    // 1. Check existing users
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isPremium: true,
        premiumExpiresAt: true,
        usedFreeTrial: true,
        createdAt: true,
      },
    });

    console.log(`📊 Found ${existingUsers.length} existing users`);

    if (existingUsers.length === 0) {
      console.log('✅ No existing users to migrate');
      return;
    }

    // 2. Display migration plan
    console.log('\n📋 Migration Plan:');
    console.log('1. Users will need to sign up again through Auth0');
    console.log('2. Premium status and trial information will need to be manually transferred');
    console.log('3. Podcasts and episodes will be linked to new Auth0 user IDs');
    console.log('4. Old user accounts can be cleaned up after migration');

    // 3. Show existing user data
    console.log('\n👥 Existing Users:');
    existingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - Premium: ${user.isPremium}`);
    });

    // 4. Generate Auth0 management script
    console.log('\n🔧 Next Steps:');
    console.log('1. Set up Auth0 application and social connections');
    console.log('2. Configure Auth0 rules for premium features');
    console.log('3. Update environment variables');
    console.log('4. Test authentication flow');
    console.log('5. Manually transfer premium status for existing users');

    // 5. Create Auth0 rules template
    console.log('\n📝 Auth0 Rules Template:');
    console.log(`
// Add this rule in Auth0 Dashboard > Rules
function (user, context, callback) {
  // Check if user has premium status in your database
  // This is a placeholder - implement your own logic
  const namespace = 'https://telecast.com';
  
  context.idToken[namespace + '/premium'] = false;
  context.idToken[namespace + '/premium_expires_at'] = null;
  context.idToken[namespace + '/used_free_trial'] = false;
  
  // You can add more custom claims here
  context.idToken[namespace + '/user_id'] = user.user_id;
  
  callback(null, user, context);
}
    `);

    console.log('\n✅ Migration plan generated successfully!');
    console.log('📚 See AUTH0_SETUP.md for detailed setup instructions');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToAuth0();
}

module.exports = { migrateToAuth0 }; 