import * as React from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;
type Listener = (event: MouseEvent | TouchEvent) => void;

const useOnOutsideClick = (ref: React.RefObject<HTMLElement>, handler: Handler) => {
  React.useEffect(() => {
    const listener: Listener = event => {
      if (!ref || !ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export default useOnOutsideClick;
