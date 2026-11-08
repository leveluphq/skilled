CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."code_submissions"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(), "userId" text NOT NULL, "lessonId" uuid NOT NULL, "language" text NOT NULL, "executionStatus" text NOT NULL, "codeRunnerToken" text NOT NULL, "stdout" text, "stderr" text, "time" text, "memory" numeric, "compileOutput" text, "message" text, "codeRunnerStatusId" integer, "codeRunnerStatusDescription" text, "environment" text NOT NULL DEFAULT 'JUDGE0', "code" text NOT NULL, "tests" text NOT NULL, "resultStatus" text, "results" jsonb, PRIMARY KEY ("id") , FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("codeRunnerToken"));
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updatedAt"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updatedAt" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_code_submissions_updatedAt"
BEFORE UPDATE ON "public"."code_submissions"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_code_submissions_updatedAt" ON "public"."code_submissions" 
IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
