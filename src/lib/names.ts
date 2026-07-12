/** Turn a filename like "emma_van_dijk.png" into "Emma Van Dijk". */
export function nameFromFilename(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, '')
  return stem
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Canonical form used to compare guesses: lowercase, no accents, no punctuation. */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const insertOrDelete = Math.min(prev[j], prev[j - 1]) + 1
      const substitute = diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      diagonal = prev[j]
      prev[j] = Math.min(insertOrDelete, substitute)
    }
  }
  return prev[b.length]
}

/** Typos forgiven, scaled to name length: none under 5 chars, one up to 8, two beyond. */
function tolerance(length: number): number {
  if (length < 5) return 0
  if (length <= 8) return 1
  return 2
}

export function isCorrectGuess(guess: string, answer: string): boolean {
  const normalizedGuess = normalizeName(guess)
  const normalizedAnswer = normalizeName(answer)
  if (!normalizedGuess) return false
  return levenshtein(normalizedGuess, normalizedAnswer) <= tolerance(normalizedAnswer.length)
}
