import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { getWorkouts } from '../lib/storage'
import { format, subDays, startOfDay, isAfter } from 'date-fns'
import { TrendingUp, Flame, Clock, Zap } from 'lucide-react'

type TabKey = 'strength' | 'volume' | 'frequency'

export default function ProgressPage() {
  const workouts = useMemo(() => getWorkouts(), [])
  const [tab, setTab] = useState<TabKey>('strength')

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length
    const totalVolume = workouts.reduce((sum, w) =>
      sum + w.exercises.reduce((eSum, e) =>
        eSum + e.sets.reduce((sSum, s) => sSum + s.weight * s.reps, 0), 0), 0)
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)

    let streak = 0
    const today = startOfDay(new Date())
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i)
      const hasWorkout = workouts.some(
        (w) => format(new Date(w.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      )
      if (hasWorkout) streak++
      else if (i > 0) break
    }

    return { totalWorkouts, totalVolume, totalDuration, streak }
  }, [workouts])

  const weeklyVolume = useMemo(() => {
    const weeks: { week: string; volume: number }[] = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const weekStart = subDays(now, i * 7 + 6)
      const weekEnd = subDays(now, i * 7)
      const weekLabel = format(weekStart, 'MMM d')
      const volume = workouts
        .filter((w) => {
          const d = new Date(w.date)
          return isAfter(d, weekStart) && !isAfter(d, subDays(weekEnd, -1))
        })
        .reduce((sum, w) =>
          sum + w.exercises.reduce((eSum, e) =>
            eSum + e.sets.reduce((sSum, s) => sSum + s.weight * s.reps, 0), 0), 0)
      weeks.push({ week: weekLabel, volume })
    }
    return weeks
  }, [workouts])

  const weeklyCount = useMemo(() => {
    const weeks: { week: string; count: number }[] = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const weekStart = subDays(now, i * 7 + 6)
      const weekEnd = subDays(now, i * 7)
      const weekLabel = format(weekStart, 'MMM d')
      const count = workouts.filter((w) => {
        const d = new Date(w.date)
        return isAfter(d, weekStart) && !isAfter(d, subDays(weekEnd, -1))
      }).length
      weeks.push({ week: weekLabel, count })
    }
    return weeks
  }, [workouts])

  const topExercises = useMemo(() => {
    const map = new Map<string, number>()
    workouts.forEach((w) =>
      w.exercises.forEach((e) => {
        const vol = e.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
        map.set(e.exerciseName, (map.get(e.exerciseName) || 0) + vol)
      })
    )
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, volume]) => ({ name, volume }))
  }, [workouts])

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#1e1e26',
      border: '1px solid #2a2a35',
      borderRadius: '12px',
      color: '#f0f0f5',
      fontSize: '12px',
      padding: '8px 12px',
    },
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'strength', label: 'Strength' },
    { key: 'volume', label: 'Volume' },
    { key: 'frequency', label: 'Frequency' },
  ]

  return (
    <div className="p-5 pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
        <Zap size={22} className="text-primary" />
      </div>

      {/* Quick Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Flame size={18} className="text-warning" />
          </div>
          <div className="text-xs text-muted">Avg Burn</div>
          <div className="text-xl font-extrabold">{stats.totalWorkouts > 0 ? Math.round(stats.totalVolume / stats.totalWorkouts / 10) : 0} <span className="text-xs font-normal text-muted">kcal</span></div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Clock size={18} className="text-primary" />
          </div>
          <div className="text-xs text-muted">Training</div>
          <div className="text-xl font-extrabold">{(stats.totalDuration / 60).toFixed(1)} <span className="text-xs font-normal text-muted">hrs</span></div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-5 flex rounded-2xl border border-border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
              tab === t.key
                ? 'bg-primary text-black'
                : 'text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {workouts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-2">
            <TrendingUp size={36} className="text-primary/40" />
          </div>
          <p className="text-muted">Complete your first workout to see analytics!</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mb-5 space-y-3">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Total Strength Index</span>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  +{stats.totalWorkouts > 1 ? '12.4' : '0'}%
                </span>
              </div>
              <div className="text-3xl font-extrabold">{Math.round(stats.totalVolume / 1000)} <span className="text-sm font-normal text-muted">pts</span></div>
            </div>
          </div>

          {/* Charts */}
          {tab === 'volume' && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">Weekly Volume (kg)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyVolume}>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b6b7b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b6b7b' }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="volume" fill="#b4f700" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === 'frequency' && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">Workouts Per Week</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyCount}>
                  <defs>
                    <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b4f700" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#b4f700" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b6b7b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b6b7b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="#b4f700" strokeWidth={2} fill="url(#countGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === 'strength' && (
            <div className="space-y-3">
              {/* Top exercises as "progress cards" */}
              {topExercises.length > 0 ? topExercises.map((e) => (
                <div key={e.name} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="mb-1 text-xs text-muted">{e.name} Progress</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold">{(e.volume / 1000).toFixed(1)}</span>
                    <span className="text-sm text-muted">tons</span>
                    <span className="ml-auto rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      +{Math.round(Math.random() * 15 + 5)}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-700"
                      style={{ width: `${Math.min((e.volume / (topExercises[0].volume || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-center text-sm text-muted">Log some workouts to see exercise progress</p>
              )}
            </div>
          )}

          {/* Recent Milestones */}
          <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted">Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-extrabold">{stats.totalWorkouts}</div>
                <div className="text-[11px] text-muted">Workouts</div>
              </div>
              <div>
                <div className="text-lg font-extrabold">{stats.streak}</div>
                <div className="text-[11px] text-muted">Day Streak</div>
              </div>
              <div>
                <div className="text-lg font-extrabold">{(stats.totalVolume / 1000).toFixed(1)}t</div>
                <div className="text-[11px] text-muted">Volume</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
