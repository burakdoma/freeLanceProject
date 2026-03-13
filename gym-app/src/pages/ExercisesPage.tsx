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
    <div className="p-5 pb-24">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Exercise Library</h1>
      <p className="mb-5 text-sm text-muted">{exercises.length} exercises across {groups.length} muscle groups</p>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
        <Search size={18} className="text-muted" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted/50"
        />
      </div>

      {/* Filter pills */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
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

      {/* Exercise list */}
      <div className="space-y-6">
        {grouped.map(({ group, exercises: exs }) => (
          <div key={group}>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-primary">
              {muscleGroupLabels[group]}
            </h2>
            <div className="space-y-2">
              {exs.map((ex) => (
                <div key={ex.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                  <button
                    onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <div className="text-left">
                      <div className="font-semibold">{ex.name}</div>
                      <div className="mt-0.5 text-xs text-muted">{ex.equipment}</div>
                    </div>
                    {expanded === ex.id ? (
                      <ChevronUp size={18} className="text-muted" />
                    ) : (
                      <ChevronDown size={18} className="text-muted" />
                    )}
                  </button>
                  {expanded === ex.id && (
                    <div className="border-t border-border px-4 pb-4 pt-3">
                      <p className="mb-3 text-sm leading-relaxed text-muted">{ex.description}</p>
                      {ex.secondaryMuscles.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-medium text-muted">Also targets:</span>
                          {ex.secondaryMuscles.map((m) => (
                            <span
                              key={m}
                              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
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
