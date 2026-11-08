alter table "public"."products"
           add constraint "products_associatedProductId_fkey"
           foreign key ("associatedProductId")
           references "public"."products"
           ("id") on update restrict on delete restrict;
