ALTER TABLE "public"."users_lessons_status" ADD COLUMN "userCode" text;
ALTER TABLE "public"."users_lessons_status" ALTER COLUMN "userCode" DROP NOT NULL;
