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
      borderRadius: '12px',
      color: 'var(--color-text)',
      fontSize: '12px',
      padding: '8px 12px',
    },
  }

  return (
    <div className="p-5 pb-24">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Progress</h1>
      <p className="mb-5 text-sm text-muted">Your training at a glance</p>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard icon={<Dumbbell size={20} />} label="Total Workouts" value={stats.totalWorkouts.toString()} color="var(--color-primary)" />
        <StatCard icon={<Flame size={20} />} label="Day Streak" value={stats.streak.toString()} color="var(--color-warning)" />
        <StatCard icon={<TrendingUp size={20} />} label="Total Volume" value={`${(stats.totalVolume / 1000).toFixed(1)}t`} color="var(--color-success)" />
        <StatCard icon={<Clock size={20} />} label="Total Time" value={`${Math.round(stats.totalDuration / 60)}h`} color="var(--color-primary)" />
      </div>

      {workouts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
            <TrendingUp size={36} className="text-muted" />
          </div>
          <p className="text-muted">Complete your first workout to see progress!</p>
        </div>
      ) : (
        <>
          {/* Weekly Volume Chart */}
          <div className="mb-4 rounded-2xl bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">Weekly Volume (kg)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyVolume}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="volume" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Frequency */}
          <div className="mb-4 rounded-2xl bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">Workouts Per Week</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyCount}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top exercises */}
          {topExercises.length > 0 && (
            <div className="rounded-2xl bg-surface p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">Top Exercises by Volume</h2>
              <div className="space-y-3">
                {topExercises.map((e, i) => {
                  const maxVol = topExercises[0].volume
                  return (
                    <div key={e.name}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-semibold">{i + 1}. {e.name}</span>
                        <span className="text-muted">{(e.volume / 1000).toFixed(1)}t</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
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
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-2" style={{ color }}>{icon}</div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-muted">{label}</div>
    </div>
  )
}
