import { motion } from 'motion/react'
import type { GameSummary, Mode } from '../App'

interface ResultsProps {
  summary: GameSummary
  mode: Mode
  onPlayAgain: () => void
  onChangeSetup: () => void
}

function headline(ratio: number): string {
  if (ratio === 1) return 'Foutloos.'
  if (ratio >= 0.8) return 'Scherp oog.'
  if (ratio >= 0.5) return 'Het begint te komen.'
  return 'Nieuwe gezichten kosten tijd.'
}

export default function Results({ summary, mode, onPlayAgain, onChangeSetup }: ResultsProps) {
  const { score, correctCount, total, bestStreak, missed } = summary

  return (
    <div className="results">
      <p className="eyebrow">Rolletje ontwikkeld</p>
      <h1 className="results-headline">{headline(correctCount / total)}</h1>
      <motion.p
        className="results-score"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
      >
        {score} pt
      </motion.p>
      <p className="results-stats">
        Je noemde <strong>{correctCount}</strong> van <strong>{total}</strong>
        {bestStreak >= 2 && (
          <>
            {' '}
            · beste reeks <strong>🔥 ×{bestStreak}</strong>
          </>
        )}
      </p>

      {missed.length > 0 && (
        <section className="missed">
          <h2 className="missed-title">Nog een keer bekijken</h2>
          <ul className="missed-grid">
            {missed.map((person, i) => (
              <motion.li
                key={person.id}
                className="mini-print mini-print-labeled"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
              >
                <img src={person.url} alt="" />
                <span>{person.name}</span>
              </motion.li>
            ))}
          </ul>
        </section>
      )}

      <div className="results-actions">
        <button className="button button-start" onClick={onPlayAgain}>
          Opnieuw spelen · {mode === 'open' ? 'open antwoord' : 'meerkeuze'}
        </button>
        <button className="button button-ghost" onClick={onChangeSetup}>
          Modus of foto's wijzigen
        </button>
      </div>
    </div>
  )
}
