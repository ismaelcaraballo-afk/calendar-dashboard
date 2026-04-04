// Member 4: External Services — Google revocation
// When a Google credential is deleted, we must also tell Google
// to invalidate the token on their end.

// TODO:
//   1. Extract the access_token from credential.key
//   2. POST to https://oauth2.googleapis.com/revoke?token=<access_token>
//   3. If Google returns an error, log it but don't throw
//      (we still want to delete the local credential even if Google fails)

export async function revokeGoogle(credential: { key: any }) {
  const token = credential?.key?.access_token;

  if (!token) {
    console.warn("[revocation][google] missing access_token; skipping remote revoke");
    return;
  }

  try {
    const res = await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`[revocation][google] revoke failed ${res.status}: ${body}`);
    }
  } catch (err) {
    console.warn("[revocation][google] error calling revoke endpoint", err);
  }
}
