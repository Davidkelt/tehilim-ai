import { useState, useEffect, useCallback } from 'react';
import { loadStreaks, saveStreaks, recordRead, type StreaksData, type ReadResult } from '../lib/streaks';

type Listener = (data: StreaksData) => void;
const listeners = new Set<Listener>();
let current = loadStreaks();

function notify() {
  listeners.forEach(l => l(current));
}

export function useStreaks() {
  const [streaks, setStreaks] = useState<StreaksData>(current);

  useEffect(() => {
    const listener: Listener = (s) => setStreaks({ ...s });
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const recordChapterRead = useCallback((chapter: number): ReadResult => {
    const result = recordRead(chapter);
    current = loadStreaks();
    notify();
    return result;
  }, []);

  const refresh = useCallback(() => {
    current = loadStreaks();
    notify();
  }, []);

  return { streaks, recordChapterRead, refresh };
}
