import * as React from 'react';
import dynamic from 'next/dynamic';
import { useUpdateUserLessonNotesMutation } from 'types/generated/client';
import { useDebouncedCallback } from 'use-debounce';

const NOTES_PLACEHOLDER = 'A scratch pad to takes notes for this lesson...';

const CodeMirrorWrapper = dynamic(() => import('./CodeMirrorWrapper'), {
  ssr: false,
});

interface Props {
  userId?: string;
  lessonId?: string;
  savedNotes?: string | null;
}

const UserNotes: React.FC<Props> = ({ userId, lessonId, savedNotes }) => {
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    const defaultNotes = savedNotes && savedNotes.trim() ? savedNotes.trim() : notes;
    setNotes(defaultNotes);
  }, [userId, lessonId, savedNotes]);

  const [upsertUserLessonNotes] = useUpdateUserLessonNotesMutation();
  const saveCallback = React.useCallback(
    (newNotesValue: string) => {
      if (userId && lessonId) {
        upsertUserLessonNotes({
          variables: {
            userId,
            lessonId,
            notes: newNotesValue,
          },
        });
      }
    },
    [userId, lessonId],
  );
  const [updateNotes] = useDebouncedCallback(saveCallback, 500);

  return (
    <CodeMirrorWrapper
      placeholder={NOTES_PLACEHOLDER}
      onChange={(_editor, _data, value) => {
        if (value !== notes) {
          updateNotes(value);
        }
        setNotes(value);
      }}
      value={notes}
      mode={null}
    />
  );
};

export default UserNotes;
