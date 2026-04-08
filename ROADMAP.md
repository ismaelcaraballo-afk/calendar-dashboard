# ROADMAP.md — Member 1: Database Layer

## Overview
Track progress for the Connected Apps Security Feature — Database layer.
All work is on branch `member-1/database`.

---

## ✅ Phase 0 — Setup (Done)
- [x] Read and understand `README.md`
- [x] Understand the full data flow and team layer map
- [x] Create working branch `member-1/database`
- [x] Create `CLAUDE.md`, `NOTES.md`, and `ROADMAP.md`

---

## 🔲 Phase 1 — Schema Work (Member 1 Core Deliverable)

### 1a. Write `schema.prisma`
- [x] Create `packages/prisma/schema.prisma` with the `Credential` model
- [x] Add `lastUsedAt DateTime?` field to the model
- [x] Confirm field name matches the column in `migration.sql` (`"lastUsedAt"`)
- [x] No `@map()` needed — cal.com uses camelCase column names on this table

### 1b. Generate Prisma Client
- [x] Run `npx prisma generate` from `packages/prisma/`
- [x] Confirm no errors in generation output (ignoring missing 3rd party generators)
- [x] Verify `@prisma/client` types include `lastUsedAt: Date | null`

### 1c. Validate the Migration File
- [x] Review `migration.sql` — confirm it matches the schema
- [x] Confirm `TIMESTAMP(3)` precision is correct (Prisma default for `DateTime`)
- [x] No changes needed to `migration.sql` (it's pre-written and correct)

---

## 🔲 Phase 2 — Verification

### 2a. Type Compatibility Check
- [x] Confirm `Credential.lastUsedAt` type (`Date | null`) matches
      `CredentialResponseDto.lastUsedAt` in `credential.dto.ts`
- [x] Confirm downstream service (`credentials.service.ts`) can access
      `credential.lastUsedAt` without TypeScript errors

### 2b. Handoff Readiness
- [x] Schema changes are committed and pushed to `member-1/database`
- [x] Member 2 can import the Prisma type for `Credential` to implement `getCredentialsForUser`
- [x] Member 3 can access `credential.userId` and `credential.lastUsedAt` for the DELETE flow

---

## 🔲 Phase 3 — Integration (Team-Wide)

> These are not Member 1's responsibility to implement, but track them for awareness.

| Task | Owner | Status |
|------|-------|--------|
| Implement `getCredentialsForUser()` | Member 2 | 🔲 TODO |
| Implement `revokeCredential()` + auth guard | Member 3 | 🔲 TODO |
| Implement `revokeGoogle()`, `revokeZoom()`, `revokeStripe()` | Member 4 | 🔲 TODO |
| Wire frontend to live tRPC endpoints | Member 5 | 🔲 TODO |
| Merge all branches → `main` | All | 🔲 TODO |

---

## 🔲 Phase 4 — Done Definition

Member 1 is complete when:
- [x] `schema.prisma` exists with `lastUsedAt DateTime?` on `Credential`
- [x] `npx prisma generate` runs cleanly
- [x] The generated client type `Credential.lastUsedAt` is `Date | null`
- [x] Changes are committed and pushed on `member-1/database`
- [x] No TypeScript errors in any file that imports the Prisma client

---

## Notes
- Stale threshold (30 days) lives in `credentials.service.ts` — not a DB concern
- `isStale` is a computed field, never stored in the database
- The migration SQL is pre-written — do not modify it
