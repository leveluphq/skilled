alter table "public"."gift_cards"
           add constraint "gift_cards_productId_fkey"
           foreign key ("productId")
           references "public"."products"
           ("id") on update restrict on delete restrict;
