alter table "public"."subscriptions" add foreign key ("userId") references "public"."users"("id") on update restrict on delete restrict;
