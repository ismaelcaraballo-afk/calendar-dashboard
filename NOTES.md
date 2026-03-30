# NOTES.md — Working Notes

## 2026-03-29 — Project Initialization

### Project Understanding
- This repo is a **scaffold** for a multi-member team project, not a fork of the real
  cal.com repo. Each member implements their layer independently on their own branch.
- The real cal.com `Credential` table has many more fields than what's shown here.
  Our `schema.prisma` only needs to model the fields relevant to this feature.
- The SQL migration (`migration.sql`) is pre-written — our job is to make the
  Prisma schema match it, not the other way around.

### Schema Decisions
- `lastUsedAt DateTime?` — nullable because:
  1. Existing rows in production have no data for this field
  2. A credential that's never been used (just connected) also has no `lastUsedAt`
  3. Nullability is what signals "never used" to the API's stale-check logic

- Staleness threshold (`STALE_DAYS = 30`) is defined in `credentials.service.ts`
  by Member 2/3 — not in the DB. The DB stores raw timestamps only.

### Open Questions
- [ ] Does the real cal.com `Credential` model use `@map` for snake_case column names?
      If so, `lastUsedAt` may need `@map("last_used_at")` in schema.prisma.
- [ ] Should we add a DB-level index on `lastUsedAt` for future query performance?
      (Probably not necessary at this scope — note for future consideration.)
- [ ] Will `npx prisma generate` work without a live DB connection, or do we need
      `DATABASE_URL` set for generation only? (Generation should not require a live DB.)

### Blockers
- None yet.

---
<!-- Add new entries below with date headers -->
