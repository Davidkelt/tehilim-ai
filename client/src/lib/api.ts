export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
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

export const api = {
  getAllPsalms: () => fetchJson<PsalmsResponse>('/psalms'),
  getPsalm: (chapter: number) => fetchJson<PsalmChapter>(`/psalms/${chapter}`),
  getAnalysis: (chapter: number, ageGroup: string) =>
    fetchJson<AnalysisResponse>(`/analysis/${chapter}?age_group=${ageGroup}`),
  getDaily: () => fetchJson<DailyResponse>('/daily'),
  search: (query: string) => fetchJson<SearchResponse>(`/search?q=${encodeURIComponent(query)}`),
  getMoods: () => fetchJson<MoodsResponse>('/moods'),
  getMoodDetail: (mood: string) => fetchJson<MoodDetailResponse>(`/moods/${encodeURIComponent(mood)}`),
};
