import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

// Firebase configuration — these are PUBLIC keys, safe to expose in client code
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Only initialize if config is provided
const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId;
const app = hasConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

export function isFirebaseConfigured(): boolean {
  return hasConfig;
}

export function getFirebaseAuth() {
  return auth;
}

// Check for redirect result on app init (needed for native Google sign-in)
if (auth && Capacitor.isNativePlatform()) {
  getRedirectResult(auth).catch(console.error);
}

// Google Sign-In — uses redirect on native (WebView can't do popups), popup on web
export async function signInWithGoogle(): Promise<User> {
  if (!auth) throw new Error('Firebase not configured');

  if (Capacitor.isNativePlatform()) {
    // Native WebView: popup doesn't work, use redirect
    await signInWithRedirect(auth, googleProvider);
    // After redirect, onAuthStateChanged will fire.
    // Return a placeholder — the redirect reloads the page.
    const result = await getRedirectResult(auth);
    if (result) return result.user;
    throw new Error('Redirect sign-in did not complete');
  }

  // Web browser: popup works fine
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Email/Password Sign Up
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error('Firebase not configured');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Email/Password Sign In
export async function signInWithEmail(email: string, password: string): Promise<User> {
  if (!auth) throw new Error('Firebase not configured');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Sign Out
export async function signOut(): Promise<void> {
  if (!auth) return;
  await firebaseSignOut(auth);
}

// Get current ID token for API calls
export async function getIdToken(): Promise<string | null> {
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
}

// Listen to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export type { User };
