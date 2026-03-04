import { useState, useEffect, useCallback } from 'react';
import {
  loadAchievements,
  checkAndUnlockAchievements,
  incrementAnalysisUsage,
  incrementDarkModeRead,
  incrementShareCount,
  incrementSearchCount,
  ACHIEVEMENT_DEFS,
  type AchievementsData,
} from '../lib/achievements';
import { showToast } from './useToast';

type Listener = (data: AchievementsData) => void;
const listeners = new Set<Listener>();
let current = loadAchievements();

function notify() {
  listeners.forEach(l => l(current));
}

function processNewAchievements(newIds: string[]) {
  for (const id of newIds) {
    const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
    if (def) {
      showToast(`${def.icon} ${def.title}`, 'achievement');
      // Fire confetti for achievements
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4a843', '#1e3a5f', '#ffffff', '#e8c36b'],
        });
      }).catch(() => {});
    }
  }
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementsData>(current);

  useEffect(() => {
    const listener: Listener = (a) => setAchievements({ ...a });
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const checkAchievements = useCallback(() => {
    const newIds = checkAndUnlockAchievements();
    if (newIds.length > 0) {
      current = loadAchievements();
      notify();
      processNewAchievements(newIds);
    }
  }, []);

  const recordAnalysisUse = useCallback(() => {
    incrementAnalysisUsage();
    current = loadAchievements();
    notify();
    checkAchievements();
  }, [checkAchievements]);

  const recordDarkModeRead = useCallback(() => {
    incrementDarkModeRead();
    current = loadAchievements();
    notify();
    checkAchievements();
  }, [checkAchievements]);

  const recordShare = useCallback(() => {
    incrementShareCount();
    current = loadAchievements();
    notify();
    checkAchievements();
  }, [checkAchievements]);

  const recordSearch = useCallback(() => {
    incrementSearchCount();
    current = loadAchievements();
    notify();
    checkAchievements();
  }, [checkAchievements]);

  return {
    achievements,
    checkAchievements,
    recordAnalysisUse,
    recordDarkModeRead,
    recordShare,
    recordSearch,
  };
}
