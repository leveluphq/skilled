alter table "public"."users" drop constraint "users_activeLessonId_fkey",
             add constraint "users_activeLessonId_fkey"
             foreign key ("activeLessonId")
             references "public"."lessons"
             ("id") on update restrict on delete set null;
