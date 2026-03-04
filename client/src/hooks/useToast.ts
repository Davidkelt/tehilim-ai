import { useState, useEffect } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'achievement';
  duration: number;
}

type Listener = (toasts: ToastItem[]) => void;
const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];

function notify() {
  listeners.forEach(l => l([...toasts]));
}

let idCounter = 0;

export function showToast(
  message: string,
  type: ToastItem['type'] = 'success',
  duration: number = 3000
): void {
  const id = `toast-${++idCounter}`;
  toasts = [...toasts, { id, message, type, duration }];
  notify();

  setTimeout(() => {
    dismissToast(id);
  }, duration);
}

export function dismissToast(id: string): void {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    const listener: Listener = (t) => setItems(t);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return { toasts: items, showToast, dismissToast };
}
