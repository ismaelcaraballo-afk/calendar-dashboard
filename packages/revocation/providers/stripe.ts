// Member 4: External Services — Stripe revocation
// Stripe doesn't have a token revocation endpoint — the credential
// is an API key, not an OAuth token.
// Disconnecting means removing it locally only.

export async function revokeStripe(credential: { key: any }) {
  // No external HTTP call needed for Stripe.
  // Removing the credential row in the DB is sufficient to
  // disconnect the integration — the key simply stops being used.
  console.log("[revocation] revokeStripe: Stripe credential disconnected (local only, no HTTP call)");
}
