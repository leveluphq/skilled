INSERT INTO code_drafts ("userId", "lessonId", "code")
SELECT "userId", "lessonId", "savedCode"
FROM users_lessons_status;
