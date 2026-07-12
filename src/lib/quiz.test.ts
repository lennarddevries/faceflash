import { describe, expect, it } from 'vitest'
import type { Person } from './quiz'
import { buildRounds, makeChoices, pointsFor } from './quiz'

const people: Person[] = [
  'Maya Patel',
  'Noah Kim',
  'Zoé Laurent',
  'Liam O Brien',
  'Amara Okafor',
  'Felix Berg',
].map((name, i) => ({ id: String(i), name, url: `blob:${i}` }))

describe('buildRounds', () => {
  it('includes every person exactly once', () => {
    const rounds = buildRounds(people)
    expect(rounds.map((p) => p.id).sort()).toEqual(people.map((p) => p.id).sort())
  })

  it('does not mutate the input', () => {
    const before = [...people]
    buildRounds(people)
    expect(people).toEqual(before)
  })
})

describe('makeChoices', () => {
  it('returns four distinct people including the answer', () => {
    const answer = people[2]
    const choices = makeChoices(answer, people)
    expect(choices).toHaveLength(4)
    expect(new Set(choices.map((p) => p.id)).size).toBe(4)
    expect(choices.some((p) => p.id === answer.id)).toBe(true)
  })

  it('shrinks gracefully when there are fewer people than choices', () => {
    const small = people.slice(0, 3)
    const choices = makeChoices(small[0], small)
    expect(choices).toHaveLength(3)
    expect(choices.some((p) => p.id === small[0].id)).toBe(true)
  })
})

describe('pointsFor', () => {
  it('awards base points on the first correct answer', () => {
    expect(pointsFor(1)).toBe(100)
  })

  it('adds a growing streak bonus', () => {
    expect(pointsFor(2)).toBe(125)
    expect(pointsFor(3)).toBe(150)
  })

  it('caps the bonus', () => {
    expect(pointsFor(10)).toBe(200)
  })
})
