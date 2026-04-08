# 🛡️ Credentials API - Write & Auth Layer

**Workstream Owner:** Member 3 (Pedro)
**Path:** `apps/api/v2/src/modules/credentials/`

## 🔴 The Problem This Solves (The "Stuck User" Bug)
When a user clicks "Disconnect" on an app like Google Calendar in their dashboard, the system historically attempted to do two things synchronously:
1. Tell the Provider (Google) to revoke the token.
2. Delete the credential from the local Cal.com Database.

**The hazard:** If Google's servers were down or the user's refresh token had already expired natively, Step 1 threw a 500/401 error. Because of this, Step 2 was entirely cancelled. The user was permanently "stuck" with a broken integration in their dashboard that they could never delete.

## 🟢 The Strategic Fix: Graceful Force-Deletes

To ensure a true enterprise-grade security posture, the `DELETE /api/v2/credentials/:id` endpoint in this module has been upgraded with **Graceful Degradation**. 

Our implementation flow is now:
1. **Strict Ownership (RBAC)**: We verify that the user clicking delete is explicitly permitted to delete this token (they own it!).
2. **Provider Revocation (`try`/`catch`)**: We ask Member 4's code to tell Google/Zoom to revoke the token.
3. **Graceful Force-Delete**: If Google fails to respond or throws an error, we **catch and swallow** that specific external error. We log it internally, but we prioritize the user intent and execute the database deletion unconditionally. The user gets instant feedback and never gets trapped.
4. **Immutable Audit Logging**: We emit an Audit Log stating `[AUDIT_LOG_EMITTED]: User X successfully revoked and deleted credential Y at Time Z`. This proves to enterprise IT teams who touched what and when.

This protects Cal.com's user experience regardless of upstream dependency downtime.
