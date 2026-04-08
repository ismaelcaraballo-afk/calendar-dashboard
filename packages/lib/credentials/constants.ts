// Shared credential constants — used by both REST v1 and API v2 services.
// Single source of truth so isStale means the same thing everywhere.

/** Days without use before a credential is considered stale. */
export const STALE_THRESHOLD_DAYS = 30;
