alter table "public"."sales"
           add constraint "sales_purchasedProductId_fkey"
           foreign key ("purchasedProductId")
           references "public"."products"
           ("id") on update restrict on delete restrict;
