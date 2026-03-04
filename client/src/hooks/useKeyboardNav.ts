import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardNav(chapter: number) {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't hijack if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowRight' && chapter < 150) {
        // RTL: right arrow goes to next chapter
        navigate(`/chapter/${chapter + 1}`);
      } else if (e.key === 'ArrowLeft' && chapter > 1) {
        // RTL: left arrow goes to previous chapter
        navigate(`/chapter/${chapter - 1}`);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapter, navigate]);
}
