CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."gift_cards"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(), "status" text NOT NULL, "type" text NOT NULL, "senderId" text, "receiverId" text, "redeemerId" text, "senderEmail" text, "receiverEmail" text, "giftNote" text, "productAccessDays" integer, "productName" text, "productDescription" text, "productType" text, "saleId" uuid, "stripeProductId" text, "creditAmountDollars" numeric, PRIMARY KEY ("id") , FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("redeemerId") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("saleId") REFERENCES "public"."sales"("id") ON UPDATE restrict ON DELETE restrict);
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
CREATE TRIGGER "set_public_gift_cards_updatedAt"
BEFORE UPDATE ON "public"."gift_cards"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_public_gift_cards_updatedAt" ON "public"."gift_cards" 
IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
