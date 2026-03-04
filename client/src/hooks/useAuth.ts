import { useState, useEffect, useCallback } from 'react';
import {
  onAuthChange,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getIdToken,
  isFirebaseConfigured,
  type User,
} from '../lib/firebase';
import { API_BASE } from '../lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
}

type Listener = (state: AuthState) => void;
const listeners = new Set<Listener>();
let currentState: AuthState = {
  user: null,
  loading: true,
  isConfigured: isFirebaseConfigured(),
};

function notify() {
  listeners.forEach(l => l(currentState));
}

// Initialize auth listener once
let initialized = false;
function initAuth() {
  if (initialized) return;
  initialized = true;

  if (!isFirebaseConfigured()) {
    currentState = { user: null, loading: false, isConfigured: false };
    notify();
    return;
  }

  onAuthChange((user) => {
    currentState = { user, loading: false, isConfigured: true };
    notify();

    // Sync local data to server when user logs in
    if (user) {
      syncLocalDataToServer().catch(console.error);
    }
  });
}

// Sync local localStorage data to the server
async function syncLocalDataToServer() {
  const token = await getIdToken();
  if (!token) return;

  const streaksData = localStorage.getItem('tehillim-streaks');
  const favoritesData = localStorage.getItem('tehillim-favorites');
  const settingsData = localStorage.getItem('tehillim-settings');
  const achievementsData = localStorage.getItem('tehillim-achievements');

  try {
    const res = await fetch(`${API_BASE}/user/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        streaks: streaksData ? JSON.parse(streaksData) : null,
        favorites: favoritesData ? JSON.parse(favoritesData) : null,
        settings: settingsData ? JSON.parse(settingsData) : null,
        achievements: achievementsData ? JSON.parse(achievementsData) : null,
      }),
    });

    if (res.ok) {
      const serverData = await res.json();
      // If server has newer/merged data, update localStorage
      if (serverData.streaks) {
        localStorage.setItem('tehillim-streaks', JSON.stringify(serverData.streaks));
      }
      if (serverData.favorites) {
        localStorage.setItem('tehillim-favorites', JSON.stringify(serverData.favorites));
      }
      if (serverData.settings) {
        localStorage.setItem('tehillim-settings', JSON.stringify(serverData.settings));
      }
      if (serverData.achievements) {
        localStorage.setItem('tehillim-achievements', JSON.stringify(serverData.achievements));
      }
    }
  } catch (err) {
    console.error('Failed to sync data:', err);
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(currentState);

  useEffect(() => {
    initAuth();
    const listener: Listener = (s) => setState({ ...s });
    listeners.add(listener);
    // Ensure we have current state
    setState({ ...currentState });
    return () => { listeners.delete(listener); };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      throw err;
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      throw err;
    }
  }, []);

  const registerWithEmail = useCallback(async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
    } catch (err: any) {
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    isConfigured: state.isConfigured,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
  };
}
