import { nameFromFilename } from './names'
import type { Person } from './quiz'

const modules = import.meta.glob('../assets/samples/*.{jpg,jpeg,png,svg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export const samplePeople: Person[] = Object.entries(modules).map(([path, url]) => {
  const filename = path.split('/').pop() ?? path
  return { id: `sample-${filename}`, name: nameFromFilename(filename), url }
})
