import { PHASES } from "../data/metaboPhases.js";

export const STORAGE_KEY = "metabo.startTime";
export const FAST_HISTORY_STORAGE_KEY = "metabo.fastHistory";
export const MIN_MAIN_FAST_DURATION_SECONDS = 12 * 3600;

export const FAST_SCORE_BANDS = [
  {
    key: "ignored",
    minSeconds: 0,
    maxSeconds: MIN_MAIN_FAST_DURATION_SECONDS,
    label: "Non comptabilisé",
    shortLabel: "< 12 h",
    tone: "muted",
    counted: false,
  },
  {
    key: "base",
    minSeconds: MIN_MAIN_FAST_DURATION_SECONDS,
    maxSeconds: 16 * 3600,
    label: "Base",
    shortLabel: "12–15 h",
    tone: "base",
    counted: true,
  },
  {
    key: "very-good",
    minSeconds: 16 * 3600,
    maxSeconds: 18 * 3600,
    label: "Très bon",
    shortLabel: "16–18 h",
    tone: "good",
    counted: true,
  },
  {
    key: "advanced",
    minSeconds: 18 * 3600,
    maxSeconds: 24 * 3600,
    label: "Avancé",
    shortLabel: "18–24 h",
    tone: "advanced",
    counted: true,
  },
  {
    key: "prudent",
    minSeconds: 24 * 3600,
    maxSeconds: Number.POSITIVE_INFINITY,
    label: "Prudent / ponctuel",
    shortLabel: "24 h+",
    tone: "caution",
    counted: true,
  },
];

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

export function validateFastEndTime(startTime, endTime, now = Date.now()) {
  const normalizedStart = Number(startTime);
  const normalizedEnd = Number(endTime);
  const normalizedNow = Number(now);

  if (!Number.isFinite(normalizedStart) || normalizedStart <= 0) {
    return {
      endTime: null,
      error: "Impossible de valider la fin du jeûne sans heure de départ valide.",
    };
  }

  if (!Number.isFinite(normalizedEnd)) {
    return {
      endTime: null,
      error: "Entrez une date et une heure de fin valides.",
    };
  }

  if (normalizedEnd > normalizedNow) {
    return {
      endTime: null,
      error: "L’heure de fin ne peut pas être dans le futur.",
    };
  }

  if (normalizedEnd <= normalizedStart) {
    return {
      endTime: null,
      error: "L’heure de fin doit être après le dernier repas enregistré.",
    };
  }

  return {
    endTime: normalizedEnd,
    error: "",
  };
}

export function buildCompletedFast(startTime, endTime = Date.now()) {
  const validation = validateFastEndTime(startTime, endTime, endTime);
  if (validation.error || !validation.endTime) {
    return null;
  }

  const normalizedStart = Number(startTime);
  const normalizedEnd = validation.endTime;
  const durationSeconds = Math.floor((normalizedEnd - normalizedStart) / 1000);
  if (durationSeconds <= 0) return null;

  return {
    id: `fast_${normalizedEnd}_${normalizedStart}`,
    startTime: normalizedStart,
    endTime: normalizedEnd,
    durationSeconds,
  };
}

export function getFastScore(durationSeconds) {
  const normalized = Number(durationSeconds);
  if (!Number.isFinite(normalized) || normalized < 0) {
    return FAST_SCORE_BANDS[0];
  }

  return FAST_SCORE_BANDS.find(
    band => normalized >= band.minSeconds && normalized < band.maxSeconds,
  ) || FAST_SCORE_BANDS[FAST_SCORE_BANDS.length - 1];
}

function buildRecentMainFastSummary(mainFasts, days, now) {
  const cutoff = now - days * 24 * 3600 * 1000;
  const recentFasts = mainFasts.filter(entry => Number(entry.endTime) >= cutoff);
  const averageDurationSeconds = recentFasts.length > 0
    ? Math.round(recentFasts.reduce((sum, entry) => sum + Number(entry.durationSeconds), 0) / recentFasts.length)
    : 0;

  return {
    days,
    count: recentFasts.length,
    averageDurationSeconds,
    fasts: recentFasts,
  };
}

export function summarizeFastHistory(history, now = Date.now()) {
  const safeHistory = Array.isArray(history)
    ? history.filter(entry => entry && Number.isFinite(Number(entry.durationSeconds)))
    : [];

  const mainFasts = safeHistory.filter(
    entry => Number(entry.durationSeconds) >= MIN_MAIN_FAST_DURATION_SECONDS,
  );
  const microFasts = safeHistory.filter(
    entry => Number(entry.durationSeconds) < MIN_MAIN_FAST_DURATION_SECONDS,
  );
  const latestMainFast = mainFasts[0] || null;
  const averageMainDurationSeconds = mainFasts.length > 0
    ? Math.round(mainFasts.reduce((sum, entry) => sum + Number(entry.durationSeconds), 0) / mainFasts.length)
    : 0;
  const last7Days = buildRecentMainFastSummary(mainFasts, 7, now);
  const last30Days = buildRecentMainFastSummary(mainFasts, 30, now);
  const bestRecentFast = last30Days.fasts.reduce((best, entry) => {
    if (!best || Number(entry.durationSeconds) > Number(best.durationSeconds)) return entry;
    return best;
  }, null);

  return {
    totalFasts: safeHistory.length,
    mainFastCount: mainFasts.length,
    microFastCount: microFasts.length,
    mainFasts,
    microFasts,
    latestMainFast,
    latestMainFastScore: latestMainFast ? getFastScore(latestMainFast.durationSeconds) : null,
    averageMainDurationSeconds,
    last7Days,
    last30Days,
    bestRecentFast,
    bestRecentFastScore: bestRecentFast ? getFastScore(bestRecentFast.durationSeconds) : null,
  };
}

export function findOverlappingFast(history, proposedStartTime) {
  const normalizedStart = Number(proposedStartTime);
  if (!Number.isFinite(normalizedStart)) return null;

  const safeHistory = Array.isArray(history) ? history : [];

  return safeHistory.find((entry) => {
    const entryStart = Number(entry?.startTime);
    const entryEnd = Number(entry?.endTime);
    if (!Number.isFinite(entryStart) || !Number.isFinite(entryEnd)) return false;
    return normalizedStart < entryEnd && normalizedStart >= entryStart;
  }) || null;
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
