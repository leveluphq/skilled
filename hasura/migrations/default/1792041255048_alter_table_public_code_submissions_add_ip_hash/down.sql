drop index if exists "public"."code_submissions_createdAt";
drop index if exists "public"."code_submissions_ipHash_createdAt";
drop index if exists "public"."code_submissions_userId_createdAt";
alter table "public"."code_submissions" drop column "ipHash";
