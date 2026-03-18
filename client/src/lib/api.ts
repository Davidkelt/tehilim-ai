export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function putJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface PsalmVerse {
  verse: number;
  text: string;
}

export interface PsalmChapter {
  chapter: number;
  verses: PsalmVerse[];
}

export interface PsalmsResponse {
  psalms: PsalmChapter[];
  total: number;
  cached: number;
}

export interface AnalysisKeyVerse {
  verse_number: number;
  text: string;
  explanation: string;
}

export interface AnalysisLesson {
  title: string;
  description: string;
}

export interface Analysis {
  summary: string;
  key_verses: AnalysisKeyVerse[];
  life_lessons: AnalysisLesson[];
  emotional_tone: string;
  historical_context: string;
}

export interface AnalysisResponse {
  chapter: number;
  age_group: string;
  analysis: Analysis;
  cached: boolean;
}

export interface DailyResponse {
  day_of_month: number;
  day_of_month_hebrew: string;
  month_name: string;
  chapters: number[];
  primary_chapter: number;
  psalm: PsalmChapter;
  highlighted_verse: PsalmVerse;
}

export interface SearchResult {
  chapter: number;
  matches: Array<{ verse: number; text: string }>;
}

export interface SearchResponse {
  results: SearchResult[];
  query?: string;
}

export interface MoodChapter {
  chapter: number;
  summary: string;
  key_verse?: { verse_number: number; text: string };
}

export interface MoodGroup {
  mood: string;
  emoji: string;
  chapters: MoodChapter[];
}

export interface MoodsResponse {
  moods: MoodGroup[];
}

export interface MoodDetailResponse {
  mood: string;
  emoji: string;
  chapters: MoodChapter[];
  total: number;
}

export type OccasionType = 'refua' | 'ilui_nishmat' | 'hatzlacha' | 'zivug' | 'shmira' | 'parnasa' | 'hodaya';

export interface DedicationEvent {
  id: string;
  occasion_type: OccasionType;
  name: string;
  parent_name: string | null;
  gender: string;
  dedication_text: string;
  creator_name: string | null;
  completed_chapters: number;
  participant_count: number;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
}

export interface DedicationChapterStatus {
  status: 'claimed' | 'completed';
  participant_name: string | null;
  participant_id: string;
}

export interface DedicationResponse {
  event: DedicationEvent;
  chapters: Record<number, DedicationChapterStatus>;
}

export interface DedicationProgressResponse {
  completed_chapters: number;
  participant_count: number;
  is_completed: boolean;
}

export interface CreateDedicationRequest {
  occasion_type: OccasionType;
  name: string;
  parent_name?: string;
  gender: 'male' | 'female';
  creator_name?: string;
}

export const api = {
  getAllPsalms: () => fetchJson<PsalmsResponse>('/psalms'),
  getPsalm: (chapter: number) => fetchJson<PsalmChapter>(`/psalms/${chapter}`),
  getAnalysis: (chapter: number, ageGroup: string) =>
    fetchJson<AnalysisResponse>(`/analysis/${chapter}?age_group=${ageGroup}`),
  getDaily: () => fetchJson<DailyResponse>('/daily'),
  search: (query: string) => fetchJson<SearchResponse>(`/search?q=${encodeURIComponent(query)}`),
  getMoods: () => fetchJson<MoodsResponse>('/moods'),
  getMoodDetail: (mood: string) => fetchJson<MoodDetailResponse>(`/moods/${encodeURIComponent(mood)}`),

  // Dedications
  createDedication: (data: CreateDedicationRequest) =>
    postJson<{ id: string; dedication_text: string }>('/dedications', data),
  getDedication: (id: string) =>
    fetchJson<DedicationResponse>(`/dedications/${id}`),
  getDedicationProgress: (id: string) =>
    fetchJson<DedicationProgressResponse>(`/dedications/${id}/progress`),
  claimChapter: (id: string, participant_id: string, participant_name?: string) =>
    postJson<{ chapter: number }>(`/dedications/${id}/claim`, { participant_id, participant_name }),
  completeChapter: (id: string, chapter: number, participant_id: string) =>
    putJson<DedicationProgressResponse>(`/dedications/${id}/chapters/${chapter}/complete`, { participant_id }),
};
