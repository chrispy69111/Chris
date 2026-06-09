import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getPhase,
  formatDuration,
  parseStoredStartTime,
  calculateElapsedSeconds,
} from '../src/lib/metaboState.js'

test('getPhase returns expected phase ids at key boundaries', () => {
  assert.equal(getPhase(0).id, 'digestion')
  assert.equal(getPhase(4).id, 'postabsorptive')
  assert.equal(getPhase(12).id, 'transition')
  assert.equal(getPhase(18).id, 'fat')
  assert.equal(getPhase(24).id, 'ketosis')
  assert.equal(getPhase(60).id, 'extended')
})

test('formatDuration splits seconds into h m s', () => {
  assert.deepEqual(formatDuration(3661), { h: 1, m: 1, s: 1 })
})

test('parseStoredStartTime accepts a valid past timestamp', () => {
  assert.equal(parseStoredStartTime('1000', 2000), 1000)
})

test('parseStoredStartTime rejects invalid, future, or empty values', () => {
  assert.equal(parseStoredStartTime(null, 2000), null)
  assert.equal(parseStoredStartTime('abc', 2000), null)
  assert.equal(parseStoredStartTime('-1', 2000), null)
  assert.equal(parseStoredStartTime('3000', 2000), null)
})

test('calculateElapsedSeconds returns zero when start time is missing', () => {
  assert.equal(calculateElapsedSeconds(null, 5000), 0)
})

test('calculateElapsedSeconds returns clamped positive elapsed time', () => {
  assert.equal(calculateElapsedSeconds(1000, 5000), 4)
  assert.equal(calculateElapsedSeconds(6000, 5000), 0)
})
