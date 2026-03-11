import { useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { exercises, muscleGroupLabels } from '../data/exercises'
import type { MuscleGroup } from '../types'

const groups = Object.keys(muscleGroupLabels).filter(
  (g) => g !== 'full_body' && g !== 'cardio'
) as MuscleGroup[]

export default function ExercisesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchGroup = filter === 'all' || e.muscleGroup === filter
    return matchSearch && matchGroup
  })

  const grouped = filter === 'all'
    ? groups.reduce((acc, g) => {
        const exs = filtered.filter((e) => e.muscleGroup === g)
        if (exs.length > 0) acc.push({ group: g, exercises: exs })
        return acc
      }, [] as { group: MuscleGroup; exercises: typeof exercises }[])
    : [{ group: filter as MuscleGroup, exercises: filtered }]

  return (
    <div className="p-4 pb-20">
      <h1 className="mb-4 text-2xl font-bold">Exercise Library</h1>

      <div className="mb-3 flex items-center gap-2 rounded-lg bg-[var(--color-surface)] px-3 py-2">
        <Search size={18} className="text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
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

      <div className="space-y-4">
        {grouped.map(({ group, exercises: exs }) => (
          <div key={group}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-primary-light)]">
              {muscleGroupLabels[group]}
            </h2>
            <div className="space-y-2">
              {exs.map((ex) => (
                <div key={ex.id} className="rounded-xl bg-[var(--color-surface)] overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
                    className="flex w-full items-center justify-between p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{ex.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{ex.equipment}</div>
                    </div>
                    {expanded === ex.id ? (
                      <ChevronUp size={18} className="text-[var(--color-text-muted)]" />
                    ) : (
                      <ChevronDown size={18} className="text-[var(--color-text-muted)]" />
                    )}
                  </button>
                  {expanded === ex.id && (
                    <div className="border-t border-[var(--color-surface-2)] px-3 pb-3 pt-2">
                      <p className="mb-2 text-sm text-[var(--color-text-muted)]">{ex.description}</p>
                      {ex.secondaryMuscles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-[var(--color-text-muted)]">Also targets:</span>
                          {ex.secondaryMuscles.map((m) => (
                            <span
                              key={m}
                              className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
                            >
                              {muscleGroupLabels[m]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
