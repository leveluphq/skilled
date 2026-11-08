ALTER TABLE "public"."users" ADD COLUMN "hasFreeAccess" bool;
ALTER TABLE "public"."users" ALTER COLUMN "hasFreeAccess" DROP NOT NULL;
ALTER TABLE "public"."users" ALTER COLUMN "hasFreeAccess" SET DEFAULT false;
