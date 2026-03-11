import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { exercises, muscleGroupLabels } from '../data/exercises'
import type { Exercise, MuscleGroup } from '../types'

interface Props {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

const groups = Object.keys(muscleGroupLabels).filter(
  (g) => g !== 'full_body' && g !== 'cardio'
) as MuscleGroup[]

export default function ExercisePicker({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all')

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchGroup = filter === 'all' || e.muscleGroup === filter
    return matchSearch && matchGroup
  })

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-surface-2)] p-4">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-[var(--color-surface)] px-3 py-2">
          <Search size={18} className="text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
            autoFocus
          />
        </div>
        <button onClick={onClose} className="p-2 text-[var(--color-text-muted)]">
          <X size={22} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto p-3 pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
          }`}
        >
          All
        </button>
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === g
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
            }`}
          >
            {muscleGroupLabels[g]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[var(--color-text-muted)]">No exercises found</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="w-full rounded-lg bg-[var(--color-surface)] p-3 text-left transition-colors hover:bg-[var(--color-surface-2)]"
              >
                <div className="font-medium">{ex.name}</div>
                <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {muscleGroupLabels[ex.muscleGroup]} &middot; {ex.equipment}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
