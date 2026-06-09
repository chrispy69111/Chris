import { PHASES } from "../data/metaboPhases.js";

export const STORAGE_KEY = "metabo.startTime";
export const FAST_HISTORY_STORAGE_KEY = "metabo.fastHistory";

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

function normalizeFastHistoryEntry(entry, now = Date.now()) {
  if (!entry || typeof entry !== "object") return null;

  const id = typeof entry.id === "string" && entry.id ? entry.id : null;
  const startTime = Number(entry.startTime);
  const endTime = Number(entry.endTime);
  const durationSeconds = Number(entry.durationSeconds);

  if (!id) return null;
  if (!Number.isFinite(startTime) || startTime <= 0 || startTime > now) return null;
  if (!Number.isFinite(endTime) || endTime <= 0 || endTime > now) return null;
  if (endTime <= startTime) return null;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;

  const expectedDuration = Math.floor((endTime - startTime) / 1000);
  if (durationSeconds !== expectedDuration) return null;

  return { id, startTime, endTime, durationSeconds };
}

export function buildCompletedFast(startTime, endTime = Date.now()) {
  const normalizedStart = Number(startTime);
  const normalizedEnd = Number(endTime);

  if (!Number.isFinite(normalizedStart) || !Number.isFinite(normalizedEnd) || normalizedEnd <= normalizedStart) {
    return null;
  }

  const durationSeconds = Math.floor((normalizedEnd - normalizedStart) / 1000);
  if (durationSeconds <= 0) return null;

  return {
    id: `fast_${normalizedEnd}_${normalizedStart}`,
    startTime: normalizedStart,
    endTime: normalizedEnd,
    durationSeconds,
  };
}

export function appendFastHistory(history, entry, limit = 10) {
  if (!entry) return Array.isArray(history) ? history : [];

  const safeHistory = Array.isArray(history) ? history : [];
  const next = [entry, ...safeHistory.filter(item => item.id !== entry.id)];
  return next.slice(0, limit);
}

export function parseStoredFastHistory(raw, now = Date.now()) {
  if (!raw) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed)) return null;

  return parsed
    .map(entry => normalizeFastHistoryEntry(entry, now))
    .filter(Boolean);
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

export function readStoredFastHistory(storage = globalThis?.window?.localStorage, now = Date.now()) {
  if (!storage) return [];

  const raw = storage.getItem(FAST_HISTORY_STORAGE_KEY);
  const parsed = parseStoredFastHistory(raw, now);

  if (raw && parsed === null) {
    storage.removeItem(FAST_HISTORY_STORAGE_KEY);
    return [];
  }

  return parsed || [];
}

export function syncStoredStartTime(startTime, storage = globalThis?.window?.localStorage) {
  if (!storage) return;

  if (startTime) {
    storage.setItem(STORAGE_KEY, String(startTime));
    return;
  }

  storage.removeItem(STORAGE_KEY);
}

export function syncStoredFastHistory(history, storage = globalThis?.window?.localStorage) {
  if (!storage) return;

  if (Array.isArray(history) && history.length > 0) {
    storage.setItem(FAST_HISTORY_STORAGE_KEY, JSON.stringify(history));
    return;
  }

  storage.removeItem(FAST_HISTORY_STORAGE_KEY);
}
