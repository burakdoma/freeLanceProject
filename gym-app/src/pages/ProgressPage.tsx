import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getWorkouts } from '../lib/storage'
import { format, subDays, startOfDay, isAfter } from 'date-fns'
import { TrendingUp, Flame, Dumbbell, Clock } from 'lucide-react'

export default function ProgressPage() {
  const workouts = useMemo(() => getWorkouts(), [])

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length
    const totalVolume = workouts.reduce((sum, w) =>
      sum + w.exercises.reduce((eSum, e) =>
        eSum + e.sets.reduce((sSum, s) => sSum + s.weight * s.reps, 0), 0), 0)
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)

    // Streak calculation
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

  // Volume per week (last 8 weeks)
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

  // Workouts per week
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

  // Top exercises by total volume
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
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-surface-2)',
      borderRadius: '8px',
      color: 'var(--color-text)',
      fontSize: '12px',
    },
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="mb-4 text-2xl font-bold">Progress</h1>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard icon={<Dumbbell size={20} />} label="Total Workouts" value={stats.totalWorkouts.toString()} color="var(--color-primary-light)" />
        <StatCard icon={<Flame size={20} />} label="Day Streak" value={stats.streak.toString()} color="var(--color-warning)" />
        <StatCard icon={<TrendingUp size={20} />} label="Total Volume" value={`${(stats.totalVolume / 1000).toFixed(1)}t`} color="var(--color-success)" />
        <StatCard icon={<Clock size={20} />} label="Total Time" value={`${Math.round(stats.totalDuration / 60)}h`} color="var(--color-accent)" />
      </div>

      {workouts.length === 0 ? (
        <div className="py-12 text-center">
          <TrendingUp size={48} className="mx-auto mb-3 text-[var(--color-surface-2)]" />
          <p className="text-[var(--color-text-muted)]">Complete your first workout to see progress!</p>
        </div>
      ) : (
        <>
          {/* Weekly Volume Chart */}
          <div className="mb-6 rounded-xl bg-[var(--color-surface)] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">Weekly Volume (kg)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyVolume}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="volume" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Frequency */}
          <div className="mb-6 rounded-xl bg-[var(--color-surface)] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">Workouts Per Week</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyCount}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top exercises */}
          {topExercises.length > 0 && (
            <div className="rounded-xl bg-[var(--color-surface)] p-4">
              <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)]">Top Exercises by Volume</h2>
              <div className="space-y-2">
                {topExercises.map((e, i) => {
                  const maxVol = topExercises[0].volume
                  return (
                    <div key={e.name}>
                      <div className="mb-0.5 flex justify-between text-xs">
                        <span className="font-medium">{i + 1}. {e.name}</span>
                        <span className="text-[var(--color-text-muted)]">{(e.volume / 1000).toFixed(1)}t</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-primary)]"
                          style={{ width: `${(e.volume / maxVol) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface)] p-4">
      <div className="mb-2" style={{ color }}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-[var(--color-text-muted)]">{label}</div>
    </div>
  )
}
