import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { Mode } from '../App'
import type { Person } from '../lib/quiz'
import { filesFromDrop, filesToPeople } from '../lib/roster'
import { samplePeople } from '../lib/samples'

interface LandingProps {
  people: Person[]
  onRosterChange: (people: Person[]) => void
  onStart: (mode: Mode) => void
}

export default function Landing({ people, onRosterChange, onStart }: LandingProps) {
  const [mode, setMode] = useState<Mode>('choice')
  const [dragOver, setDragOver] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const folderInput = useRef<HTMLInputElement>(null)
  const filesInput = useRef<HTMLInputElement>(null)

  const loadFiles = (files: File[]) => {
    const roster = filesToPeople(files)
    if (roster.length < 2) {
      setLoadError('That folder needs at least two photos with names as filenames.')
      return
    }
    setLoadError(null)
    onRosterChange(roster)
  }

  const onDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    loadFiles(await filesFromDrop(event.dataTransfer))
  }

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) loadFiles(Array.from(event.target.files))
    event.target.value = ''
  }

  const hasRoster = people.length >= 2

  return (
    <div className="landing">
      <header className="hero">
        <p className="eyebrow">A name-to-face game</p>
        <h1 className="wordmark">
          Face<span className="wordmark-flash">Flash</span>
        </h1>
        <p className="tagline">How fast can you put a name to a face?</p>
      </header>

      <input
        ref={folderInput}
        type="file"
        multiple
        onChange={onPick}
        className="visually-hidden"
        // @ts-expect-error non-standard folder-picker attribute
        webkitdirectory=""
      />
      <input
        ref={filesInput}
        type="file"
        multiple
        accept="image/*"
        onChange={onPick}
        className="visually-hidden"
      />

      {!hasRoster ? (
        <div
          className={`dropzone${dragOver ? ' is-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <p className="dropzone-title">Drop a folder of faces</p>
          <p className="dropzone-hint">
            Each filename becomes the answer — <code>maya-patel.jpg</code> is Maya Patel.
          </p>
          <div className="dropzone-actions">
            <button className="button" onClick={() => folderInput.current?.click()}>
              Choose a folder
            </button>
            <button className="button button-ghost" onClick={() => filesInput.current?.click()}>
              Pick photos
            </button>
          </div>
          <button className="link-button" onClick={() => onRosterChange(samplePeople)}>
            No photos handy? Play the sample cast →
          </button>
          {loadError && <p className="load-error">{loadError}</p>}
        </div>
      ) : (
        <div className="setup">
          <div className="roster-strip" aria-label={`${people.length} faces loaded`}>
            {people.slice(0, 8).map((person, i) => (
              <motion.div
                key={person.id}
                className="mini-print"
                initial={{ opacity: 0, y: 18, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: (i % 2 === 0 ? -1 : 1) * (2 + (i % 3)) }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
              >
                <img src={person.url} alt="" />
              </motion.div>
            ))}
            {people.length > 8 && <span className="roster-more">+{people.length - 8}</span>}
          </div>
          <p className="roster-count">
            <strong>{people.length} faces</strong> ready ·{' '}
            <button className="link-button" onClick={() => onRosterChange([])}>
              swap photos
            </button>
          </p>

          <div className="mode-picker" role="radiogroup" aria-label="Game mode">
            <button
              role="radio"
              aria-checked={mode === 'choice'}
              className={`mode-card${mode === 'choice' ? ' is-selected' : ''}`}
              onClick={() => setMode('choice')}
            >
              <span className="mode-name">Multiple choice</span>
              <span className="mode-blurb">Pick from four. Warm up while faces are new.</span>
            </button>
            <button
              role="radio"
              aria-checked={mode === 'open'}
              className={`mode-card${mode === 'open' ? ' is-selected' : ''}`}
              onClick={() => setMode('open')}
            >
              <span className="mode-name">Open answer</span>
              <span className="mode-blurb">Type each name. One typo forgiven.</span>
            </button>
          </div>

          <button className="button button-start" onClick={() => onStart(mode)}>
            Start — {people.length} rounds
          </button>
        </div>
      )}
    </div>
  )
}
