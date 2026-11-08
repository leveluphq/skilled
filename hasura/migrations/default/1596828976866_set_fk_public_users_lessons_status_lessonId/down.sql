alter table "public"."users_lessons_status" drop constraint "users_lessons_status_lessonId_fkey",
          add constraint "users_lessons_status_lessonId_fkey"
          foreign key ("lessonId")
          references "public"."lessons"
          ("id")
          on update restrict
          on delete restrict;
