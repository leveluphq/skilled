-- The new code runner (src/services/server/runner):
--   compileOutputDecoded  readable compiler output
--   diagnostics           compile errors placed on the learner's own lines
--   runnerVersion         the runtime that produced the result; null for the
--                         old runner, whose results have a different shape
alter table "public"."code_submissions" add column "compileOutputDecoded" text null;
alter table "public"."code_submissions" add column "diagnostics" jsonb null;
alter table "public"."code_submissions" add column "runnerVersion" text null;
