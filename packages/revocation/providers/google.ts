// Member 4: External Services — Google revocation
// When a Google credential is deleted, we must also tell Google
// to invalidate the token on their end.

export async function revokeGoogle(credential: { key: any }) {
  const accessToken = credential.key?.access_token;

  if (!accessToken) {
    console.warn("[revocation] revokeGoogle: no access_token found in key, skipping remote call");
    return;
  }

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`,
      { method: "POST" }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "(unreadable)");
      console.error(
        `[revocation] revokeGoogle: Google returned ${response.status} — ${body}`
      );
    }
  } catch (err) {
    // Network errors, DNS failures, etc. — log but don't throw.
    // The local credential row will still be deleted by the caller.
    console.error("[revocation] revokeGoogle: fetch failed:", err);
  }
}
