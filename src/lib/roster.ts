import { nameFromFilename } from './names'
import type { Person } from './quiz'

const IMAGE_RE = /\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i

function isImageFile(file: File): boolean {
  if (file.name.startsWith('.')) return false
  return IMAGE_RE.test(file.name) || file.type.startsWith('image/')
}

/** Build the roster from picked files. One person per unique name; filename is the answer. */
export function filesToPeople(files: Iterable<File>): Person[] {
  const seen = new Set<string>()
  const people: Person[] = []
  for (const file of files) {
    if (!isImageFile(file)) continue
    const name = nameFromFilename(file.name)
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    people.push({ id: `p-${people.length}-${key}`, name, url: URL.createObjectURL(file) })
  }
  return people
}

export function releasePeople(people: readonly Person[]): void {
  for (const person of people) {
    if (person.url.startsWith('blob:')) URL.revokeObjectURL(person.url)
  }
}

function readAllEntries(directory: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = directory.createReader()
  return new Promise((resolve, reject) => {
    const entries: FileSystemEntry[] = []
    const readBatch = () => {
      reader.readEntries((batch) => {
        if (batch.length === 0) return resolve(entries)
        entries.push(...batch)
        readBatch()
      }, reject)
    }
    readBatch()
  })
}

function entryToFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject))
}

async function collectFiles(entry: FileSystemEntry, into: File[]): Promise<void> {
  if (entry.isFile) {
    into.push(await entryToFile(entry as FileSystemFileEntry))
  } else if (entry.isDirectory) {
    const children = await readAllEntries(entry as FileSystemDirectoryEntry)
    for (const child of children) await collectFiles(child, into)
  }
}

/** Extract files from a drop, walking dropped folders recursively. */
export async function filesFromDrop(dataTransfer: DataTransfer): Promise<File[]> {
  const entries = Array.from(dataTransfer.items)
    .map((item) => item.webkitGetAsEntry?.())
    .filter((entry): entry is FileSystemEntry => entry != null)
  if (entries.length === 0) return Array.from(dataTransfer.files)
  const files: File[] = []
  for (const entry of entries) await collectFiles(entry, files)
  return files
}
