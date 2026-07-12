import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Person } from './lib/quiz'
import { releasePeople } from './lib/roster'
import Landing from './components/Landing'
import Game from './components/Game'
import Results from './components/Results'

export type Mode = 'open' | 'choice'

export interface GameSummary {
  score: number
  correctCount: number
  total: number
  bestStreak: number
  missed: Person[]
}

type Screen = 'landing' | 'game' | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [people, setPeople] = useState<Person[]>([])
  const [mode, setMode] = useState<Mode>('choice')
  const [summary, setSummary] = useState<GameSummary | null>(null)
  const [gameKey, setGameKey] = useState(0)

  const replaceRoster = (next: Person[]) => {
    releasePeople(people)
    setPeople(next)
  }

  const start = (chosenMode: Mode) => {
    setMode(chosenMode)
    setGameKey((k) => k + 1)
    setScreen('game')
  }

  const finish = (result: GameSummary) => {
    setSummary(result)
    setScreen('results')
  }

  const playAgain = () => {
    setGameKey((k) => k + 1)
    setScreen('game')
  }

  return (
    <div className="studio">
      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <ScreenShell key="landing">
            <Landing people={people} onRosterChange={replaceRoster} onStart={start} />
          </ScreenShell>
        )}
        {screen === 'game' && (
          <ScreenShell key={`game-${gameKey}`}>
            <Game people={people} mode={mode} onFinish={finish} />
          </ScreenShell>
        )}
        {screen === 'results' && summary && (
          <ScreenShell key="results">
            <Results
              summary={summary}
              mode={mode}
              onPlayAgain={playAgain}
              onChangeSetup={() => setScreen('landing')}
            />
          </ScreenShell>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      className="screen"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  )
}
