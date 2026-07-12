export interface Person {
  id: string
  name: string
  url: string
}

export const CHOICE_COUNT = 4
const BASE_POINTS = 100
const STREAK_BONUS = 25
const MAX_BONUS = 100

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Every person once, in random order. */
export function buildRounds(people: readonly Person[]): Person[] {
  return shuffle(people)
}

/** The answer plus random decoys, shuffled. Shrinks below CHOICE_COUNT for tiny rosters. */
export function makeChoices(answer: Person, pool: readonly Person[]): Person[] {
  const decoys = shuffle(pool.filter((p) => p.id !== answer.id)).slice(0, CHOICE_COUNT - 1)
  return shuffle([answer, ...decoys])
}

/** Points for a correct answer given the current streak (1 = first in a row). */
export function pointsFor(streak: number): number {
  return BASE_POINTS + Math.min((streak - 1) * STREAK_BONUS, MAX_BONUS)
}
