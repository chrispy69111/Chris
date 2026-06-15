import test from 'node:test'
import assert from 'node:assert/strict'

import {
  FAST_HISTORY_STORAGE_KEY,
  appendFastHistory,
  buildCompletedFast,
  findOverlappingFast,
  getFastScore,
  parseStoredFastHistory,
  readStoredFastHistory,
  summarizeFastHistory,
  syncStoredFastHistory,
  validateFastEndTime,
} from '../src/lib/metaboState.js'

test('buildCompletedFast returns a completed fasting entry', () => {
  const entry = buildCompletedFast(1000, 7000)

  assert.equal(entry.startTime, 1000)
  assert.equal(entry.endTime, 7000)
  assert.equal(entry.durationSeconds, 6)
  assert.match(entry.id, /^fast_\d+_1000$/)
})

test('validateFastEndTime rejects future or pre-start timestamps', () => {
  assert.equal(validateFastEndTime(5_000, 4_999, 10_000).error, 'L’heure de fin doit être après le dernier repas enregistré.')
  assert.equal(validateFastEndTime(5_000, 10_001, 10_000).error, 'L’heure de fin ne peut pas être dans le futur.')
  assert.deepEqual(validateFastEndTime(5_000, 7_000, 10_000), {
    endTime: 7_000,
    error: '',
  })
})

test('appendFastHistory prepends new entries and enforces the limit', () => {
  const older = { id: 'older', startTime: 1000, endTime: 4000, durationSeconds: 3 }
  const newer = { id: 'newer', startTime: 2000, endTime: 9000, durationSeconds: 7 }
  const latest = { id: 'latest', startTime: 3000, endTime: 15000, durationSeconds: 12 }

  const next = appendFastHistory([older, newer], latest, 2)

  assert.deepEqual(next, [latest, older])
})

test('parseStoredFastHistory keeps only valid entries', () => {
  const parsed = parseStoredFastHistory(JSON.stringify([
    { id: 'ok', startTime: 1000, endTime: 7000, durationSeconds: 6 },
    { id: 'future', startTime: 1000, endTime: 9999999999999, durationSeconds: 6 },
    { id: 'negative', startTime: 1000, endTime: 900, durationSeconds: -1 },
  ]), 10000)

  assert.deepEqual(parsed, [
    { id: 'ok', startTime: 1000, endTime: 7000, durationSeconds: 6 },
  ])
})

test('readStoredFastHistory clears malformed storage payloads', () => {
  const storage = {
    value: 'not-json',
    removedKey: null,
    getItem(key) {
      return key === FAST_HISTORY_STORAGE_KEY ? this.value : null
    },
    removeItem(key) {
      this.removedKey = key
      this.value = null
    },
  }

  const history = readStoredFastHistory(storage, 10000)

  assert.deepEqual(history, [])
  assert.equal(storage.removedKey, FAST_HISTORY_STORAGE_KEY)
})

test('getFastScore classifies the fasting score bands', () => {
  assert.equal(getFastScore(11 * 3600 + 59 * 60).key, 'ignored')
  assert.equal(getFastScore(12 * 3600).key, 'base')
  assert.equal(getFastScore(16 * 3600).key, 'very-good')
  assert.equal(getFastScore(18 * 3600).key, 'advanced')
  assert.equal(getFastScore(24 * 3600).key, 'prudent')
})

test('summarizeFastHistory separates main fasts from micro-fasts and computes recent windows', () => {
  const now = Date.parse('2026-06-12T12:00:00Z')
  const history = [
    { id: 'main-latest', startTime: now - (2 * 24 * 3600 * 1000) - (16 * 3600 * 1000), endTime: now - (2 * 24 * 3600 * 1000), durationSeconds: 16 * 3600 },
    { id: 'micro', startTime: now - (3 * 24 * 3600 * 1000) - (11 * 3600 * 1000), endTime: now - (3 * 24 * 3600 * 1000), durationSeconds: 11 * 3600 },
    { id: 'main-older', startTime: now - (10 * 24 * 3600 * 1000) - (13 * 3600 * 1000), endTime: now - (10 * 24 * 3600 * 1000), durationSeconds: 13 * 3600 },
    { id: 'main-best', startTime: now - (20 * 24 * 3600 * 1000) - (24 * 3600 * 1000), endTime: now - (20 * 24 * 3600 * 1000), durationSeconds: 24 * 3600 },
  ]

  const summary = summarizeFastHistory(history, now)

  assert.equal(summary.totalFasts, 4)
  assert.equal(summary.mainFastCount, 3)
  assert.equal(summary.microFastCount, 1)
  assert.equal(summary.latestMainFast.id, 'main-latest')
  assert.equal(summary.latestMainFastScore.key, 'very-good')
  assert.equal(summary.averageMainDurationSeconds, Math.round(((16 + 13 + 24) * 3600) / 3))
  assert.equal(summary.last7Days.count, 1)
  assert.equal(summary.last7Days.averageDurationSeconds, 16 * 3600)
  assert.equal(summary.last30Days.count, 3)
  assert.equal(summary.bestRecentFast.id, 'main-best')
  assert.equal(summary.bestRecentFastScore.key, 'prudent')
})

test('findOverlappingFast returns the conflicting previous fast', () => {
  const history = [
    { id: 'recent', startTime: 1000, endTime: 5000, durationSeconds: 4 },
    { id: 'older', startTime: 6000, endTime: 9000, durationSeconds: 3 },
  ]

  assert.equal(findOverlappingFast(history, 3000)?.id, 'recent')
  assert.equal(findOverlappingFast(history, 5000), null)
  assert.equal(findOverlappingFast(history, 9500), null)
})

test('syncStoredFastHistory writes entries and clears when empty', () => {
  const storage = {
    value: null,
    removedKey: null,
    setItem(key, value) {
      this.value = { key, value }
    },
    removeItem(key) {
      this.removedKey = key
      this.value = null
    },
  }

  syncStoredFastHistory([{ id: 'ok', startTime: 1000, endTime: 7000, durationSeconds: 6 }], storage)
  assert.equal(storage.value.key, FAST_HISTORY_STORAGE_KEY)
  assert.deepEqual(JSON.parse(storage.value.value), [
    { id: 'ok', startTime: 1000, endTime: 7000, durationSeconds: 6 },
  ])

  syncStoredFastHistory([], storage)
  assert.equal(storage.removedKey, FAST_HISTORY_STORAGE_KEY)
})
