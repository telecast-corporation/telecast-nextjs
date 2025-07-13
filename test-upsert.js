const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'kimberlymchelaa@gmail.com';
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
  console.log('Upserted user!');
}

main().then(() => process.exit()); 