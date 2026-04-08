// Member 4: External Services — Google revocation
// When a Google credential is deleted, we must also tell Google
// to invalidate the token on their end.

export async function revokeGoogle(credential: { key: any }) {
  const token = credential?.key?.access_token;

  if (!token) {
    console.warn("[revocation][google] missing access_token; skipping remote revoke");
    return;
  }

  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      console.error(`[revocation][google] revoke failed ${res.status}: ${body}`);
    }
  } catch (err) {
    // Network errors, DNS failures, etc. — log but don't throw.
    // The local credential row will still be deleted by the caller.
    console.error("[revocation][google] error calling revoke endpoint:", err);
  }
}
