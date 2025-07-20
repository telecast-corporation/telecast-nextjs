const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentState() {
  const email = 'kimberly.michela@mail.utoronto.ca';
  
  console.log(`Checking current state for: ${email}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true,
        email: true, 
        isPremium: true, 
        premiumCancelled: true,
        premiumExpiresAt: true,
        createdAt: true,
        updatedAt: true,
        usedFreeTrial: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n=== CURRENT USER STATE ===');
    console.log(JSON.stringify(user, null, 2));
    
    const now = new Date();
    const isExpired = user.premiumExpiresAt && user.premiumExpiresAt < now;
    const daysUntilExpiry = user.premiumExpiresAt ? 
      Math.floor((user.premiumExpiresAt - now) / (1000 * 60 * 60 * 24)) : 0;
    
    console.log('\n=== ANALYSIS ===');
    console.log(`Current time: ${now.toISOString()}`);
    console.log(`Premium expires: ${user.premiumExpiresAt?.toISOString()}`);
    console.log(`Is expired: ${isExpired}`);
    console.log(`Days until expiry: ${daysUntilExpiry}`);
    console.log(`Is premium: ${user.isPremium}`);
    console.log(`Premium cancelled: ${user.premiumCancelled}`);
    
    // Check what the UI should show
    console.log('\n=== UI EXPECTATIONS ===');
    
    // Based on the settings page logic
    const hasCancelledInCurrentPeriod = user.premiumCancelled && user.isPremium;
    
    console.log(`hasCancelledInCurrentPeriod: ${hasCancelledInCurrentPeriod}`);
    console.log(`Should show cancel button: ${!hasCancelledInCurrentPeriod}`);
    
    if (hasCancelledInCurrentPeriod) {
      console.log('❌ Cancel button should be HIDDEN (user cancelled)');
    } else {
      console.log('✅ Cancel button should be VISIBLE (user can cancel)');
    }
    
    // Check if this matches what you're seeing
    console.log('\n=== WHAT YOU SHOULD SEE ===');
    if (user.premiumCancelled) {
      console.log('🔴 In settings: Cancel button should be HIDDEN');
      console.log('🔴 In profile: Should show "Cancelled" status');
    } else {
      console.log('🟢 In settings: Cancel button should be VISIBLE');
      console.log('🟢 In profile: Should show "Active" status');
    }
    
  } catch (error) {
    console.error('❌ Error checking state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentState()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 