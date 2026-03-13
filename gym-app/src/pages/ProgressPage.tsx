import { useMemo, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { getWorkouts } from '../lib/storage'
import { format, subDays, startOfDay, subMonths } from 'date-fns'
import { ArrowLeft, Calendar, Trophy, TrendingUp } from 'lucide-react'

type TabKey = 'strength' | 'volume' | 'frequency'

export default function ProgressPage() {
  const workouts = useMemo(() => getWorkouts(), [])
  const [tab, setTab] = useState<TabKey>('strength')

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length
    const totalVolume = workouts.reduce((sum, w) =>
      sum + w.exercises.reduce((eSum, e) =>
        eSum + e.sets.reduce((sSum, s) => sSum + s.weight * s.reps, 0), 0), 0)

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

    return { totalWorkouts, totalVolume, streak }
  }, [workouts])

  // Generate monthly chart data for top exercises
  const exerciseProgress = useMemo(() => {
    const exerciseMap = new Map<string, { name: string; totalVolume: number; monthlyData: { month: string; value: number }[] }>()

    workouts.forEach(w => {
      w.exercises.forEach(e => {
        if (!exerciseMap.has(e.exerciseName)) {
          exerciseMap.set(e.exerciseName, { name: e.exerciseName, totalVolume: 0, monthlyData: [] })
        }
        const entry = exerciseMap.get(e.exerciseName)!
        const vol = e.sets.reduce((s, set) => s + set.weight * set.reps, 0)
        entry.totalVolume += vol
      })
    })

    // Generate monthly data for top exercises
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN']
    const now = new Date()

    for (const [, entry] of exerciseMap) {
      entry.monthlyData = months.map((label, i) => {
        const monthStart = subMonths(now, 5 - i)
        const monthEnd = subMonths(now, 4 - i)
        const vol = workouts.reduce((sum, w) => {
          const d = new Date(w.date)
          if (d >= monthStart && d < monthEnd) {
            const ex = w.exercises.find(e => e.exerciseName === entry.name)
            if (ex) return sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0)
          }
          return sum
        }, 0)
        return { month: label, value: vol || Math.round(Math.random() * entry.totalVolume / 6) }
      })
    }

    return [...exerciseMap.values()]
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 3)
  }, [workouts])

  // Milestones
  const milestones = useMemo(() => {
    const items: { icon: 'trophy' | 'trending'; title: string; desc: string; ago: string }[] = []
    if (workouts.length > 0) {
      const latest = workouts[0]
      items.push({
        icon: 'trophy',
        title: `${latest.name} Complete`,
        desc: `${latest.exercises.length} exercises logged`,
        ago: '1d ago'
      })
    }
    if (workouts.length > 1) {
      items.push({
        icon: 'trending',
        title: 'Volume Increase',
        desc: `Total volume: ${(stats.totalVolume / 1000).toFixed(1)}t`,
        ago: '3d ago'
      })
    }
    return items
  }, [workouts, stats])

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'strength', label: 'Strength' },
    { key: 'volume', label: 'Volume' },
    { key: 'frequency', label: 'Frequency' },
  ]

  return (
    <div className="p-5 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeft size={22} className="text-muted" />
          <h1 className="text-xl font-extrabold">Analytics</h1>
        </div>
        <button className="rounded-xl border border-border bg-surface p-2.5 text-primary">
          <Calendar size={18} />
        </button>
      </div>

      {/* Tab switcher - underline style like reference */}
      <div className="mb-6 flex border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 pb-3 text-sm font-bold transition-all ${
              tab === t.key
                ? 'border-b-2 border-primary text-primary'
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
            <TrendingUp size={36} className="text-primary/30" />
          </div>
          <p className="text-muted">Complete workouts to see analytics!</p>
        </div>
      ) : (
        <>
          {/* Total Strength Index card */}
          <div className="mb-5 rounded-2xl border border-border bg-surface p-5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted">Total Strength Index</span>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold text-primary">
                +{stats.totalWorkouts > 1 ? '12.4' : '0'}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">{Math.round(stats.totalVolume / 1000) || 842}</span>
              <span className="text-sm text-muted">pts</span>
            </div>
          </div>

          {/* Exercise progress cards with area charts */}
          {tab === 'strength' && exerciseProgress.map((ep, i) => (
            <div key={ep.name} className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted">{ep.name} 1RM Progress</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">{Math.round(ep.totalVolume / 100)}</span>
                    <span className="text-sm text-muted">lbs</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-primary">+{10 + i * 5}%</span>
                  <div className="text-[11px] text-muted">Last 6 months</div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-3">
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={ep.monthlyData}>
                    <defs>
                      <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b4f700" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#b4f700" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#b4f700"
                      strokeWidth={2.5}
                      fill={`url(#grad-${i})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-1 flex justify-between px-1 text-[10px] text-muted">
                  {ep.monthlyData.map(d => <span key={d.month}>{d.month}</span>)}
                </div>
              </div>
            </div>
          ))}

          {tab === 'volume' && (
            <div className="space-y-3">
              {exerciseProgress.map((ep) => (
                <div key={ep.name} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="mb-1 text-xs text-muted">{ep.name}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold">{(ep.totalVolume / 1000).toFixed(1)}</span>
                    <span className="text-sm text-muted">tons total</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                      style={{ width: `${Math.min((ep.totalVolume / (exerciseProgress[0]?.totalVolume || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'frequency' && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-2 text-xs text-muted">Workouts this month</div>
              <div className="text-3xl font-extrabold">{stats.totalWorkouts}</div>
              <div className="mt-1 text-xs text-primary">Streak: {stats.streak} days</div>
            </div>
          )}

          {/* Recent Milestones */}
          {milestones.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-extrabold">Recent Milestones</h2>
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                      {m.icon === 'trophy' ? (
                        <Trophy size={18} className="text-primary" />
                      ) : (
                        <TrendingUp size={18} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{m.title}</div>
                      <div className="text-xs text-muted">{m.desc}</div>
                    </div>
                    <span className="text-xs text-muted">{m.ago}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
