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
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted/50"
            autoFocus
          />
        </div>
        <button onClick={onClose} className="rounded-xl border border-border bg-surface p-2.5 text-muted">
          <X size={22} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto p-4 pb-2 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-primary text-black'
              : 'border border-border bg-surface text-muted'
          }`}
        >
          All
        </button>
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === g
                ? 'bg-primary text-black'
                : 'border border-border bg-surface text-muted'
            }`}
          >
            {muscleGroupLabels[g]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted">No exercises found</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((ex) => (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="w-full rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary active:scale-[0.99]"
              >
                <div className="font-semibold">{ex.name}</div>
                <div className="mt-0.5 text-xs text-muted">
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
