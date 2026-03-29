// Member 4: External Services — Stripe revocation
// Stripe doesn't have a token revocation endpoint — the credential
// is an API key, not an OAuth token.
// Disconnecting means removing it locally only.

// TODO:
//   1. Log that Stripe was disconnected
//   2. No external HTTP call needed for Stripe
//   3. Return cleanly

export async function revokeStripe(credential: { key: any }) {
  throw new Error("TODO: Member 4 — implement revokeStripe (local only, no HTTP call)");
}
