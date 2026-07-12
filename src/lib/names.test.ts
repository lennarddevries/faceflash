import { describe, expect, it } from 'vitest'
import { isCorrectGuess, nameFromFilename, normalizeName } from './names'

describe('nameFromFilename', () => {
  it('strips the extension and title-cases the name', () => {
    expect(nameFromFilename('maya-patel.jpg')).toBe('Maya Patel')
  })

  it('treats dashes, underscores and dots as spaces', () => {
    expect(nameFromFilename('emma_van_dijk.png')).toBe('Emma Van Dijk')
    expect(nameFromFilename('omar.haddad.webp')).toBe('Omar Haddad')
  })

  it('keeps names without separators intact', () => {
    expect(nameFromFilename('cher.svg')).toBe('Cher')
  })

  it('collapses repeated separators', () => {
    expect(nameFromFilename('liam--o_brien.jpeg')).toBe('Liam O Brien')
  })
})

describe('normalizeName', () => {
  it('lowercases and trims', () => {
    expect(normalizeName('  Maya Patel ')).toBe('maya patel')
  })

  it('strips diacritics', () => {
    expect(normalizeName('Zoé Laurent')).toBe('zoe laurent')
  })

  it('drops punctuation and collapses spaces', () => {
    expect(normalizeName("Liam  O'Brien")).toBe('liam o brien')
  })
})

describe('isCorrectGuess', () => {
  it('accepts an exact match', () => {
    expect(isCorrectGuess('Maya Patel', 'Maya Patel')).toBe(true)
  })

  it('ignores case, accents and punctuation', () => {
    expect(isCorrectGuess("liam o'brien", 'Liam O Brien')).toBe(true)
    expect(isCorrectGuess('zoe laurent', 'Zoé Laurent')).toBe(true)
  })

  it('forgives one typo in medium names', () => {
    expect(isCorrectGuess('maya patle', 'Maya Patel')).toBe(true)
  })

  it('forgives two typos in long names', () => {
    expect(isCorrectGuess('isabela rosi', 'Isabella Rossi')).toBe(true)
  })

  it('is strict on short names', () => {
    expect(isCorrectGuess('yuk', 'Yuki')).toBe(false)
  })

  it('rejects a different person', () => {
    expect(isCorrectGuess('Maya Patel', 'Noah Kim')).toBe(false)
    expect(isCorrectGuess('', 'Noah Kim')).toBe(false)
  })
})
