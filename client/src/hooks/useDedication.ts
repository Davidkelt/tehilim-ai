import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CreateDedicationRequest } from '../lib/api';
import { getParticipantId, getParticipantName } from '../lib/participant';

export function useDedication(id: string | undefined) {
  return useQuery({
    queryKey: ['dedication', id],
    queryFn: () => api.getDedication(id!),
    enabled: !!id,
  });
}

export function useDedicationProgress(id: string | undefined) {
  return useQuery({
    queryKey: ['dedication-progress', id],
    queryFn: () => api.getDedicationProgress(id!),
    enabled: !!id,
    refetchInterval: 15000,
  });
}

export function useCreateDedication() {
  return useMutation({
    mutationFn: (data: CreateDedicationRequest) => api.createDedication(data),
  });
}

export function useClaimChapter(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const participantId = getParticipantId();
      const participantName = getParticipantName();
      return api.claimChapter(eventId, participantId, participantName || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dedication', eventId] });
      queryClient.invalidateQueries({ queryKey: ['dedication-progress', eventId] });
    },
  });
}

export function useCompleteChapter(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chapter: number) => {
      const participantId = getParticipantId();
      return api.completeChapter(eventId, chapter, participantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dedication', eventId] });
      queryClient.invalidateQueries({ queryKey: ['dedication-progress', eventId] });
    },
  });
}
