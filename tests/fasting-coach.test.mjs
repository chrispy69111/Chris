import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildFastingCoach,
  getCoachBand,
} from '../src/lib/fastingCoach.js'

test('getCoachBand returns expected prudence bands at key boundaries', () => {
  assert.equal(getCoachBand(0).id, 'steady')
  assert.equal(getCoachBand(7.99).id, 'steady')
  assert.equal(getCoachBand(8).id, 'focus')
  assert.equal(getCoachBand(15.99).id, 'focus')
  assert.equal(getCoachBand(16).id, 'light')
  assert.equal(getCoachBand(23.99).id, 'light')
  assert.equal(getCoachBand(24).id, 'caution')
  assert.equal(getCoachBand(48).id, 'caution')
})

test('buildFastingCoach returns hydration-first advice for the first hours', () => {
  const coach = buildFastingCoach(3)

  assert.equal(coach.bandId, 'steady')
  assert.equal(coach.proof.label, 'Solide')
  assert.match(coach.headline, /hydrate/i)
  assert.equal(coach.actions[0].title, 'Hydratation')
  assert.match(coach.actions[0].text, /eau/i)
  assert.equal(coach.actions[1].title, 'Mouvement léger')
  assert.equal(coach.safety.length, 0)
})

test('buildFastingCoach recommends light-to-moderate effort in the mid fast window', () => {
  const coach = buildFastingCoach(12)

  assert.equal(coach.bandId, 'focus')
  assert.equal(coach.proof.label, 'Solide')
  assert.equal(coach.actions[1].title, 'Effort modéré')
  assert.match(coach.actions[1].text, /modéré/i)
  assert.match(coach.actions[1].text, /évitez l[’\']intense|évitez l'intense/i)
})

test('buildFastingCoach shifts to caution after 16 hours with symptom stop signals', () => {
  const coach = buildFastingCoach(18)

  assert.equal(coach.bandId, 'light')
  assert.equal(coach.proof.label, 'Probable')
  assert.equal(coach.actions[1].title, 'Bouger léger')
  assert.ok(coach.safety.some((item) => /vertige|palpitation|confusion/i.test(item)))
})

test('buildFastingCoach becomes safety-first after 24 hours', () => {
  const coach = buildFastingCoach(30)

  assert.equal(coach.bandId, 'caution')
  assert.equal(coach.proof.label, 'Prudence')
  assert.match(coach.headline, /prudence/i)
  assert.equal(coach.actions[0].title, 'Hydratation et repos')
  assert.ok(coach.safety.some((item) => /médical|professionnel/i.test(item)))
})

test('buildFastingCoach returns null without a valid elapsed hour count', () => {
  assert.equal(buildFastingCoach(null), null)
  assert.equal(buildFastingCoach(Number.NaN), null)
  assert.equal(buildFastingCoach(-1), null)
})
