const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWebhookLogic() {
  const email = 'kimberlymchelaa@gmail.com';
  
  console.log('Testing webhook logic for email:', email);
  
  try {
    // Simulate the webhook logic for subscription creation
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
    
    console.log('Premium expires at:', premiumExpiresAt);
    
    const result = await prisma.user.upsert({
      where: { email },
      update: {
        isPremium: true,
        premiumExpiresAt,
        usedFreeTrial: true,
      },
      create: {
        email,
        name: email.split('@')[0],
        isPremium: true,
        premiumExpiresAt,
        usedFreeTrial: true,
      },
    });
    
    console.log('Webhook logic result:', result);
    
    // Check the updated user
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        isPremium: true,
        premiumExpiresAt: true,
        usedFreeTrial: true,
      }
    });
    
    console.log('Updated user after webhook:', updatedUser);
    
  } catch (error) {
    console.error('Error in webhook logic:', error);
  }
}

testWebhookLogic()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 