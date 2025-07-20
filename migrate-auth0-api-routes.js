#!/usr/bin/env node

/**
 * Migration script to update all API routes from NextAuth to Auth0
 * 
 * This script will:
 * 1. Replace NextAuth imports with Auth0 imports
 * 2. Update session handling to use Auth0
 * 3. Update user authentication patterns
 */

const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  'src/app/api/broadcast/quick/route.ts',
  'src/app/api/podcast/reference/route.ts',
  'src/app/api/podcast/episode/route.ts',
  'src/app/api/podcast/finalize/route.ts',
  'src/app/api/podcast/file/route.ts',
  'src/app/api/podcast/[id]/episode/route.ts',
  'src/app/api/broadcast/platforms/route.ts',
  'src/app/api/podcast/[id]/file/route.ts',
  'src/app/api/podcasts/[id]/route.ts',
  'src/app/api/search/internal/route.ts',
  'src/app/api/podcast/temp-files/[episodeId]/route.ts',
  'src/app/api/payment/cancel-subscription/route.ts',
  'src/app/api/auth/change-password/route.ts',
  'src/app/api/episode/[id]/check-ownership/route.ts',
  'src/app/api/episode/route.ts',
  'src/app/api/auth/verify-email/route.ts',
  'src/app/api/auth/podcast-platforms/[platform]/disconnect/route.ts',
  'src/app/api/auth/podcast-platforms/remember/route.ts',
  'src/app/api/auth/podcast-platforms/spotify/callback/route.ts',
  'src/app/api/auth/podcast-platforms/google/callback/route.ts',
  'src/app/api/auth/podcast-platforms/status/route.ts',
  'src/app/api/auth/podcast-platforms/apple/callback/route.ts',
  'src/app/api/auth/start-free-trial/route.ts',
];

// Migration patterns
const patterns = [
  // Replace NextAuth imports
  {
    from: "import { getServerSession } from 'next-auth';",
    to: "import { getUserFromRequest } from '@/lib/auth0-user';"
  },
  {
    from: "import { getServerSession } from \"next-auth\";",
    to: "import { getUserFromRequest } from '@/lib/auth0-user';"
  },
  {
    from: "import { authOptions } from '@/lib/auth';",
    to: "// authOptions removed - using Auth0"
  },
  {
    from: "import { authOptions } from \"@/lib/auth\";",
    to: "// authOptions removed - using Auth0"
  },
  
  // Replace session handling
  {
    from: "const session = await getServerSession(authOptions);",
    to: "const user = await getUserFromRequest(request as any);"
  },
  {
    from: "const session = await getServerSession(authOptions);",
    to: "const user = await getUserFromRequest(request as any);"
  },
  
  // Replace user access patterns
  {
    from: "if (!session?.user?.email) {",
    to: "if (!user) {"
  },
  {
    from: "session.user.email",
    to: "user.email"
  },
  {
    from: "session.user",
    to: "user"
  },
  
  // Replace user lookup patterns
  {
    from: "const user = await prisma.user.findUnique({\n      where: { email: session.user.email },\n    });",
    to: "// User already available from Auth0"
  },
  {
    from: "const user = await prisma.user.findUnique({\n      where: { email: session.user.email },\n    });\n\n    if (!user || !user.email) {",
    to: "if (!user.email) {"
  }
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  patterns.forEach(pattern => {
    if (content.includes(pattern.from)) {
      content = content.replace(new RegExp(pattern.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), pattern.to);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🔄 Starting Auth0 API routes migration...\n');
  
  let updatedCount = 0;
  let totalCount = filesToUpdate.length;

  filesToUpdate.forEach(filePath => {
    if (updateFile(filePath)) {
      updatedCount++;
    }
  });

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Total files: ${totalCount}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped: ${totalCount - updatedCount}`);
  
  console.log(`\n🎯 Next Steps:`);
  console.log(`   1. Review the updated files for any manual adjustments needed`);
  console.log(`   2. Test your API routes to ensure they work with Auth0`);
  console.log(`   3. Remove the old @/lib/auth file if no longer needed`);
  console.log(`   4. Update any remaining NextAuth references manually`);
  
  console.log(`\n⚠️  Important Notes:`);
  console.log(`   - Some files may need manual review and adjustment`);
  console.log(`   - Test each API route after migration`);
  console.log(`   - Check for any custom logic that needs updating`);
}

if (require.main === module) {
  main();
}

module.exports = { updateFile, patterns }; 