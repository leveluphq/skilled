ALTER TABLE ONLY "public"."gift_cards" ALTER COLUMN "code" SET DEFAULT gen_random_uuid();
