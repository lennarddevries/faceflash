import { motion, useReducedMotion } from 'motion/react'
import type { Person } from '../lib/quiz'

interface PhotoCardProps {
  person: Person
  revealed: boolean
  outcome: 'correct' | 'wrong' | null
}

export default function PhotoCard({ person, revealed, outcome }: PhotoCardProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.figure
      className="print"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 60, rotate: -6, scale: 0.9 }}
      animate={
        outcome === 'wrong'
          ? { opacity: 1, y: 0, scale: 1, rotate: 0, x: reducedMotion ? 0 : [0, -12, 12, -7, 7, 0] }
          : { opacity: 1, y: 0, x: 0, rotate: -1.5, scale: 1 }
      }
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -80, rotate: 5, scale: 0.92 }}
      transition={
        outcome === 'wrong'
          ? { x: { duration: 0.45 } }
          : { type: 'spring', stiffness: 240, damping: 22 }
      }
    >
      <div className="print-photo">
        <img key={person.id} src={person.url} alt="A face to name" draggable={false} />
      </div>
      <figcaption className="print-caption">
        {revealed ? (
          <motion.span
            className={`caption-name is-${outcome}`}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.5, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: outcome === 'correct' ? -2 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            {person.name}
          </motion.span>
        ) : (
          <span className="caption-mystery">who is this?</span>
        )}
      </figcaption>
    </motion.figure>
  )
}
