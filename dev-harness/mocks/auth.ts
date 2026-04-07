// dev-harness/mocks/auth.ts
//
// Mocks @calcom/lib/auth for the dev harness.
// The real implementation uses a more complex hashing scheme tied to
// Cal.com's key format (cal_live_xxx). Here we use a simple SHA-256
// so that our seed API keys hash to predictable values.

import { createHash } from "crypto";

/**
 * Hashes a raw API key the same way the real @calcom/lib/auth does:
 * SHA-256 hex of the raw key string.
 */
export function hashAPIKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}
