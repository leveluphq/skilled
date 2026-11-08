CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."upgrade_event_log"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(), "userId" text NOT NULL, "saleId" uuid, "giftCardId" uuid, "type" text NOT NULL, "productType" text NOT NULL, "productAccessDays" integer, "productName" text NOT NULL, "productDescription" text NOT NULL, "note" text, "detailsObject" jsonb, PRIMARY KEY ("id") , FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("saleId") REFERENCES "public"."sales"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("giftCardId") REFERENCES "public"."gift_cards"("id") ON UPDATE restrict ON DELETE restrict);
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
CREATE TRIGGER "set_public_upgrade_event_log_updatedAt"
BEFORE UPDATE ON "public"."upgrade_event_log"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_upgrade_event_log_updatedAt" ON "public"."upgrade_event_log" 
IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
