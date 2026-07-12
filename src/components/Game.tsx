import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { GameSummary, Mode } from '../App'
import { isCorrectGuess } from '../lib/names'
import type { Person } from '../lib/quiz'
import { buildRounds, makeChoices, pointsFor } from '../lib/quiz'
import PhotoCard from './PhotoCard'

interface GameProps {
  people: Person[]
  mode: Mode
  onFinish: (summary: GameSummary) => void
}

type Outcome = 'correct' | 'wrong'
type Phase = 'guess' | 'reveal'

const NEXT_DELAY = { correct: 1400, wrong: 2600 }

export default function Game({ people, mode, onFinish }: GameProps) {
  const reducedMotion = useReducedMotion()
  const [rounds] = useState(() => buildRounds(people))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('guess')
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [guess, setGuess] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const stats = useRef({ score: 0, correctCount: 0, bestStreak: 0, missed: [] as Person[] })
  const nextTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  const person = rounds[index]
  const outcome: Outcome | undefined = outcomes[index]
  const choices = useMemo(
    () => (mode === 'choice' ? makeChoices(person, rounds) : []),
    [mode, person, rounds],
  )

  const resolve = (correct: boolean) => {
    if (phase !== 'guess') return
    const nextStreak = correct ? streak + 1 : 0
    if (correct) {
      stats.current.score += pointsFor(nextStreak)
      setScore(stats.current.score)
      stats.current.correctCount += 1
      stats.current.bestStreak = Math.max(stats.current.bestStreak, nextStreak)
    } else {
      stats.current.missed.push(person)
    }
    setStreak(nextStreak)
    setOutcomes((prev) => [...prev, correct ? 'correct' : 'wrong'])
    setPhase('reveal')
    nextTimer.current = setTimeout(next, NEXT_DELAY[correct ? 'correct' : 'wrong'])
  }

  const next = () => {
    clearTimeout(nextTimer.current)
    if (index + 1 >= rounds.length) {
      onFinish({ total: rounds.length, ...stats.current })
      return
    }
    setIndex(index + 1)
    setPhase('guess')
    setGuess('')
    setSelectedId(null)
  }

  useEffect(() => () => clearTimeout(nextTimer.current), [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (phase === 'reveal' && event.key === 'Enter') {
        next()
      } else if (phase === 'guess' && mode === 'choice' && /^[1-4]$/.test(event.key)) {
        const choice = choices[Number(event.key) - 1]
        if (choice) pick(choice)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (mode === 'open' && phase === 'guess') inputRef.current?.focus()
  }, [mode, phase, index])

  const pick = (choice: Person) => {
    setSelectedId(choice.id)
    resolve(choice.id === person.id)
  }

  return (
    <div className="game">
      <header className="hud">
        <span className="hud-brand">
          Face<span className="wordmark-flash">Flash</span>
        </span>
        <span className="hud-counter" aria-label={`Ronde ${index + 1} van ${rounds.length}`}>
          {String(index + 1).padStart(2, '0')}/{String(rounds.length).padStart(2, '0')}
        </span>
        <span className="hud-right">
          <AnimatePresence>
            {streak >= 2 && (
              <motion.span
                className="streak-chip"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                🔥 ×{streak}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="hud-score">{score} pt</span>
        </span>
      </header>

      <div className="stage">
        <AnimatePresence mode="wait">
          <PhotoCard
            key={person.id}
            person={person}
            revealed={phase === 'reveal'}
            outcome={outcome ?? null}
          />
        </AnimatePresence>
      </div>

      {mode === 'open' ? (
        <form
          className="answer-area"
          onSubmit={(event) => {
            event.preventDefault()
            if (guess.trim()) resolve(isCorrectGuess(guess, person.name))
          }}
        >
          <input
            ref={inputRef}
            className={`answer-input${outcome ? ` is-${outcome}` : ''}`}
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            placeholder="Typ de naam…"
            disabled={phase === 'reveal'}
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            aria-label="Jouw antwoord"
          />
          {phase === 'guess' ? (
            <div className="answer-actions">
              <button type="submit" className="button" disabled={!guess.trim()}>
                Flash 'm
              </button>
              <button type="button" className="link-button" onClick={() => resolve(false)}>
                Geen idee, laat maar zien
              </button>
            </div>
          ) : (
            <RevealHint outcome={outcome} onNext={next} />
          )}
        </form>
      ) : (
        <div className="answer-area">
          <div className="choices" role="group" aria-label="Wie is dit?">
            {choices.map((choice, i) => {
              const state =
                phase === 'reveal'
                  ? choice.id === person.id
                    ? ' is-correct'
                    : choice.id === selectedId
                      ? ' is-wrong'
                      : ' is-dimmed'
                  : ''
              return (
                <button
                  key={choice.id}
                  className={`choice${state}`}
                  onClick={() => pick(choice)}
                  disabled={phase === 'reveal'}
                >
                  <kbd>{i + 1}</kbd> {choice.name}
                </button>
              )
            })}
          </div>
          {phase === 'reveal' && <RevealHint outcome={outcome} onNext={next} />}
        </div>
      )}

      <ol className="filmstrip" aria-label="Voortgang">
        {rounds.map((round, i) => (
          <li
            key={round.id}
            className={`frame${i === index ? ' is-current' : ''}${outcomes[i] ? ` is-${outcomes[i]}` : ''}`}
          />
        ))}
      </ol>

      <AnimatePresence>
        {phase === 'reveal' && outcome === 'correct' && !reducedMotion && (
          <motion.div
            className="flash-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.95, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, times: [0, 0.15, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function RevealHint({ outcome, onNext }: { outcome: Outcome | undefined; onNext: () => void }) {
  return (
    <div className="reveal-hint">
      <span className={`verdict is-${outcome}`}>
        {outcome === 'correct' ? 'Goed zo!' : 'Deze keer niet'}
      </span>
      <button className="link-button" onClick={onNext}>
        Volgende (Enter) →
      </button>
    </div>
  )
}
