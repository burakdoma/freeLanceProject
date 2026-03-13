import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Flame, Timer, Play, Dumbbell } from 'lucide-react'
import { getWorkouts } from '../lib/storage'
import { getCustomPlans } from '../lib/storage'
import { defaultPlans } from '../data/plans'
import { format, startOfDay, subDays } from 'date-fns'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DashboardPage() {
  const navigate = useNavigate()
  const workouts = useMemo(() => getWorkouts(), [])

  const stats = useMemo(() => {
    const totalDuration = workouts.reduce((s, w) => s + w.duration, 0)
    const totalVolume = workouts.reduce((sum, w) =>
      sum + w.exercises.reduce((eSum, e) =>
        eSum + e.sets.reduce((sSum, s) => sSum + s.weight * s.reps, 0), 0), 0)
    const avgBurn = workouts.length > 0 ? Math.round(totalVolume / workouts.length / 10) : 0
    return { totalDuration, totalVolume, avgBurn }
  }, [workouts])

  // Weekly consistency - which days this week had workouts
  const weeklyData = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = startOfDay(subDays(today, mondayOffset))

    return DAYS.map((label, i) => {
      const day = subDays(monday, -i)
      const dayStr = format(day, 'yyyy-MM-dd')
      const count = workouts.filter(w => format(new Date(w.date), 'yyyy-MM-dd') === dayStr).length
      const isToday = format(today, 'yyyy-MM-dd') === dayStr
      return { label, count, isToday }
    })
  }, [workouts])

  // Calorie ring data (simulated from volume)
  const consumed = Math.round(stats.totalVolume / 100) || 1800
  const goal = 2500
  const remaining = Math.max(0, goal - consumed)
  const ringPercent = Math.min((consumed / goal) * 100, 100)

  // Get a plan for "Today's Routine"
  const allPlans = [...defaultPlans, ...useMemo(() => getCustomPlans(), [])]
  const todayPlan = allPlans[0]
  const todayDay = todayPlan?.days[new Date().getDay() % todayPlan.days.length]

  return (
    <div className="p-5 pb-28">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-lg font-bold text-primary">
            U
          </div>
          <div>
            <div className="text-xs text-muted">Welcome back,</div>
            <div className="font-bold">User</div>
          </div>
        </div>
        <button className="relative rounded-xl bg-surface p-2.5 text-primary">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Flame size={12} /> Avg Burn
          </div>
          <div className="text-2xl font-extrabold">{stats.avgBurn} <span className="text-sm font-normal text-muted">kcal</span></div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Timer size={12} /> Training
          </div>
          <div className="text-2xl font-extrabold">{(stats.totalDuration / 60).toFixed(1)} <span className="text-sm font-normal text-muted">hrs</span></div>
        </div>
      </div>

      {/* Calorie Ring */}
      <div className="mb-5 rounded-2xl border border-border bg-surface p-6">
        <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 192 192">
            <circle cx="96" cy="96" r="84" fill="none" stroke="#1e1e26" strokeWidth="12" />
            <circle
              cx="96"
              cy="96"
              r="84"
              fill="none"
              stroke="#b4f700"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 84}`}
              strokeDashoffset={`${2 * Math.PI * 84 * (1 - ringPercent / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center">
            <div className="text-4xl font-extrabold">{consumed.toLocaleString()}</div>
            <div className="text-sm text-muted">of {goal.toLocaleString()} kcal</div>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-8">
          <div className="text-center">
            <div className="text-xs text-muted">Consumed</div>
            <div className="text-lg font-extrabold">{consumed.toLocaleString()}</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <div className="text-xs text-muted">Remaining</div>
            <div className="text-lg font-extrabold">{remaining}</div>
          </div>
        </div>
      </div>

      {/* Today's Routine */}
      {todayPlan && todayDay && (
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Today's Routine</h2>
            <button onClick={() => navigate('/plans')} className="text-xs font-semibold text-primary">View Plan</button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {/* Workout image placeholder */}
            <div className="relative h-40 bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center">
              <Dumbbell size={48} className="text-primary/30" />
              <div className="absolute bottom-3 left-3">
                <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-black">Recommended</span>
              </div>
              <div className="absolute bottom-3 left-3 mt-6 pt-5">
                <div className="text-lg font-extrabold drop-shadow-lg">{todayDay.name}</div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Dumbbell size={12} className="text-primary" />
                {todayDay.exercises.length} Exercises &bull; ~45 mins
              </div>
              <button
                onClick={() => navigate('/workout')}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-black"
              >
                <Play size={14} /> Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Consistency */}
      <div className="mb-5">
        <h2 className="mb-3 text-lg font-extrabold">Weekly Consistency</h2>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-end justify-between gap-2">
            {weeklyData.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative h-24 w-full">
                  <div
                    className={`absolute bottom-0 left-1/2 w-6 -translate-x-1/2 rounded-t-md transition-all ${
                      d.count > 0 ? 'bg-primary' : 'bg-surface-2'
                    }`}
                    style={{ height: d.count > 0 ? `${Math.min(d.count * 40, 100)}%` : '12%' }}
                  />
                </div>
                <span className={`text-[11px] font-semibold ${d.isToday ? 'text-primary' : 'text-muted'}`}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
