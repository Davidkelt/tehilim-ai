import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function usePsalms() {
  return useQuery({
    queryKey: ['psalms'],
    queryFn: api.getAllPsalms,
    staleTime: Infinity,
  });
}

export function usePsalm(chapter: number) {
  return useQuery({
    queryKey: ['psalm', chapter],
    queryFn: () => api.getPsalm(chapter),
    staleTime: Infinity,
    enabled: chapter >= 1 && chapter <= 150,
  });
}

export function useDaily() {
  return useQuery({
    queryKey: ['daily'],
    queryFn: api.getDaily,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.search(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMoods() {
  return useQuery({
    queryKey: ['moods'],
    queryFn: api.getMoods,
    staleTime: Infinity,
  });
}

export function useMoodDetail(mood: string) {
  return useQuery({
    queryKey: ['mood', mood],
    queryFn: () => api.getMoodDetail(mood),
    enabled: mood.length > 0,
    staleTime: Infinity,
  });
}
