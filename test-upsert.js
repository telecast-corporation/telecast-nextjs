const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'kimberlymchelaa@gmail.com';
  
  // First, let's check the current user status
  const currentUser = await prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
      isPremium: true,
      premiumExpiresAt: true,
      usedFreeTrial: true,
    }
  });
  
  console.log('Current user status:', currentUser);
  
  const premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.user.upsert({
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
  
  // Check the updated user status
  const updatedUser = await prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
      isPremium: true,
      premiumExpiresAt: true,
      usedFreeTrial: true,
    }
  });
  
  console.log('Updated user status:', updatedUser);
  console.log('Upserted user!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 