import { PHASES } from "../data/metaboPhases.js";

export const STORAGE_KEY = "metabo.startTime";

export function getPhase(hours) {
  return PHASES.find(p => hours >= p.start && hours < p.end) || PHASES[PHASES.length - 1];
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

export function nowLocal() {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export function parseStoredStartTime(raw, now = Date.now()) {
  if (!raw) return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > now) {
    return null;
  }

  return parsed;
}

export function calculateElapsedSeconds(startTime, now = Date.now()) {
  if (!startTime) return 0;
  return Math.max(0, Math.floor((now - startTime) / 1000));
}

export function readStoredStartTime(storage = globalThis?.window?.localStorage, now = Date.now()) {
  if (!storage) return null;

  const raw = storage.getItem(STORAGE_KEY);
  const parsed = parseStoredStartTime(raw, now);

  if (raw && parsed === null) {
    storage.removeItem(STORAGE_KEY);
  }

  return parsed;
}

export function syncStoredStartTime(startTime, storage = globalThis?.window?.localStorage) {
  if (!storage) return;

  if (startTime) {
    storage.setItem(STORAGE_KEY, String(startTime));
    return;
  }

  storage.removeItem(STORAGE_KEY);
}
