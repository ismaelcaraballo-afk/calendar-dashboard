-- Migration: add lastUsedAt to ApiKey
-- Tracking when each v1 API key was last used.
-- Mirrors the lastUsedAt pattern already applied to the Credential table.
--
-- Safe to run on production: purely additive, no backfill required.
-- Existing keys will show NULL (never recorded) until their next request.

ALTER TABLE "ApiKey" ADD COLUMN "lastUsedAt" TIMESTAMP(3);

CREATE INDEX "ApiKey_lastUsedAt_idx" ON "ApiKey"("lastUsedAt");
