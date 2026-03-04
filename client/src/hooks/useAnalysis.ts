import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useSettings } from './useSettings';

export function useAnalysis(chapter: number, enabled: boolean = false) {
  const { settings } = useSettings();

  return useQuery({
    queryKey: ['analysis', chapter, settings.ageGroup],
    queryFn: () => api.getAnalysis(chapter, settings.ageGroup),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: enabled && chapter >= 1 && chapter <= 150,
    retry: 1,
  });
}
