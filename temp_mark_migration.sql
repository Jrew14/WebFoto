-- Clear old migration records and mark the new baseline as applied
DELETE FROM drizzle.__drizzle_migrations WHERE id = '0000_nostalgic_sabra';

INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at)
VALUES (
  '0001_lush_silverclaw',
  '5a20d4b1-0bcc-4dde-b65f-f4d2e2e58e99',
  EXTRACT(EPOCH FROM NOW())::bigint * 1000
)
ON CONFLICT (id) DO NOTHING;
