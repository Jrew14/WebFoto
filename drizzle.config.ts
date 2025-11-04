import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ['profiles', 'events', 'photos', 'purchases', 'bookmarks'],
  verbose: true,
  strict: true,
} satisfies Config;
