const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickCheck() {
  const email = 'kimberly.michela@mail.utoronto.ca';
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        email: true, 
        isPremium: true, 
        premiumCancelled: true,
        premiumExpiresAt: true
      }
    });
    
    console.log('=== CURRENT DATABASE VALUES ===');
    console.log(`Email: ${user.email}`);
    console.log(`isPremium: ${user.isPremium}`);
    console.log(`premiumCancelled: ${user.premiumCancelled}`);
    console.log(`premiumExpiresAt: ${user.premiumExpiresAt}`);
    
    console.log('\n=== WHAT THIS MEANS ===');
    if (user.premiumCancelled) {
      console.log('🔴 User is marked as CANCELLED');
      console.log('   Cancel button should be HIDDEN');
    } else {
      console.log('🟢 User is NOT cancelled');
      console.log('   Cancel button should be VISIBLE');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck(); 