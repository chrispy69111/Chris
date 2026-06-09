import test from 'node:test'
import assert from 'node:assert/strict'

import {
  FAST_HISTORY_STORAGE_KEY,
  appendFastHistory,
  buildCompletedFast,
  parseStoredFastHistory,
  readStoredFastHistory,
  syncStoredFastHistory,
} from '../src/lib/metaboState.js'

test('buildCompletedFast returns a completed fasting entry', () => {
  const entry = buildCompletedFast(1000, 7000)

  assert.equal(entry.startTime, 1000)
  assert.equal(entry.endTime, 7000)
  assert.equal(entry.durationSeconds, 6)
  assert.match(entry.id, /^fast_\d+_1000$/)
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
