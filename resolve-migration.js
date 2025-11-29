
const { Client } = require('pg');

// --- CONFIGURATION ---
const DATABASE_URL = "postgres://neondb_owner:npg_Weo52GpMCTYr@ep-green-silence-a4p23dst-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

// The names of the migrations that failed and were deleted.
const MIGRATIONS_TO_MARK_APPLIED = [
  '20250826225347_',
  '20250826225453_added_is_final'
];

// --- SCRIPT ---

async function resolveMigrations() {
  console.log('Connecting to the database...');
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Successfully connected to the database.');

    for (const migrationName of MIGRATIONS_TO_MARK_APPLIED) {
      console.log(`Processing migration "${migrationName}"...`);

      // 1. Check if the migration is already marked as applied
      const checkQuery = {
        text: 'SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1',
        values: [migrationName],
      };

      const checkResult = await client.query(checkQuery);

      if (checkResult.rowCount > 0) {
        console.log(`- Migration "${migrationName}" is already marked as applied. Skipping.`);
      } else {
        console.log(`- Migration "${migrationName}" not found. Marking as applied...`);

        // 2. If not, insert it.
        const migrationId = `${migrationName.slice(0, 14)}-${Date.now()}`.substring(0, 36);
        const insertQuery = {
          text: `
            INSERT INTO "_prisma_migrations" (
              id,
              checksum,
              finished_at,
              migration_name,
              logs,
              rolled_back_at,
              started_at,
              applied_steps_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
          `,
          values: [
            migrationId,          // id
            'placeholder_checksum', // checksum
            new Date(),             // finished_at
            migrationName,          // migration_name
            null,                   // logs
            null,                   // rolled_back_at
            new Date(),             // started_at
            1,                      // applied_steps_count
          ],
        };
        await client.query(insertQuery);
        console.log(`- ✅ Successfully marked migration "${migrationName}" as applied.`);
      }
    }

    console.log('\nAll specified migrations have been processed.');

  } catch (err) {
    console.error('\n❌ An error occurred during the script execution:');
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

resolveMigrations();
