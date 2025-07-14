const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugUser() {
  const email = 'kimberlymchelaa@gmail.com';
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        isPremium: true,
        premiumExpiresAt: true,
        usedFreeTrial: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    console.log('Current user status:', user);
    
    if (user) {
      console.log('Is Premium:', user.isPremium);
      console.log('Premium Expires:', user.premiumExpiresAt);
      console.log('Used Free Trial:', user.usedFreeTrial);
      
      if (user.premiumExpiresAt) {
        const now = new Date();
        const expiresAt = new Date(user.premiumExpiresAt);
        const isExpired = expiresAt < now;
        
        console.log('Current time:', now);
        console.log('Expires at:', expiresAt);
        console.log('Is expired:', isExpired);
        
        if (isExpired && user.isPremium) {
          console.log('⚠️  WARNING: User is marked as premium but subscription has expired!');
        }
      }
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 