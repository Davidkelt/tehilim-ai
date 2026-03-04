import { useState, useEffect, useCallback } from 'react';
import type { AgeGroup } from '../lib/constants';

const SETTINGS_KEY = 'tehillim-settings';

export interface AppSettings {
  darkMode: boolean;
  showNikud: boolean;
  fontSize: number;
  ageGroup: AgeGroup;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  showNikud: true,
  fontSize: 24,
  ageGroup: 'adults',
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {}
  return defaultSettings;
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Global listeners for settings changes
type Listener = (settings: AppSettings) => void;
const listeners = new Set<Listener>();
let currentSettings = loadSettings();

function notify() {
  listeners.forEach(l => l(currentSettings));
}

export function useSettings() {
  const [settings, setLocalSettings] = useState<AppSettings>(currentSettings);

  useEffect(() => {
    const listener: Listener = (s) => setLocalSettings({ ...s });
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    currentSettings = { ...currentSettings, ...partial };
    saveSettings(currentSettings);
    notify();
  }, []);

  return { settings, updateSettings };
}
