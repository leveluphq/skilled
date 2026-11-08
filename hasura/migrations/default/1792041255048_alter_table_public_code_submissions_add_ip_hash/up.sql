-- Rate limits on running code (runner/runLimits.ts): the run-code route counts a
-- learner's recent runs, by user when logged in and by a hashed IP address
-- when not. The hash is keyed with a server secret, so the column can't be
-- turned back into addresses without it, and no client role can read it.
alter table "public"."code_submissions" add column "ipHash" text null;
create index if not exists "code_submissions_userId_createdAt" on "public"."code_submissions" ("userId", "createdAt");
create index if not exists "code_submissions_ipHash_createdAt" on "public"."code_submissions" ("ipHash", "createdAt");
create index if not exists "code_submissions_createdAt" on "public"."code_submissions" ("createdAt");
