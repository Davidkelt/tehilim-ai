const PARTICIPANT_ID_KEY = 'tehillim_participant_id';
const PARTICIPANT_NAME_KEY = 'tehillim_participant_name';

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getParticipantId(): string {
  let id = localStorage.getItem(PARTICIPANT_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(PARTICIPANT_ID_KEY, id);
  }
  return id;
}

export function getParticipantName(): string {
  return localStorage.getItem(PARTICIPANT_NAME_KEY) || '';
}

export function setParticipantName(name: string): void {
  localStorage.setItem(PARTICIPANT_NAME_KEY, name);
}
