import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp, Dumbbell, MoreVertical, ArrowLeft, Clock, Grid3x3 } from 'lucide-react'
import { v4 } from '../lib/uuid'
import ExercisePicker from '../components/ExercisePicker'
import RestTimer from '../components/RestTimer'
import { getWorkouts, saveWorkout, deleteWorkout } from '../lib/storage'
import type { Workout, WorkoutExercise, WorkoutSet, Exercise } from '../types'
import { format } from 'date-fns'

export default function WorkoutPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsed, setElapsed] = useState('00:00')
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null)
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setWorkouts(getWorkouts())
    const saved = sessionStorage.getItem('activeWorkout')
    if (saved) {
      setActiveWorkout(JSON.parse(saved))
      setStartTime(Date.now())
      sessionStorage.removeItem('activeWorkout')
    }
  }, [])

  useEffect(() => {
    if (activeWorkout && startTime) {
      intervalRef.current = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000)
        const m = Math.floor(diff / 60).toString().padStart(2, '0')
        const s = (diff % 60).toString().padStart(2, '0')
        setElapsed(`${m}:${s}`)
      }, 1000)
      return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }
  }, [activeWorkout, startTime])

  function startNewWorkout() {
    const workout: Workout = {
      id: v4(),
      date: new Date().toISOString(),
      name: 'Push Day A',
      exercises: [],
      duration: 0,
      notes: '',
    }
    setActiveWorkout(workout)
    setStartTime(Date.now())
  }

  function addExercise(exercise: Exercise) {
    if (!activeWorkout) return
    const we: WorkoutExercise = {
      id: v4(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ id: v4(), weight: 0, reps: 0, completed: false }],
    }
    setActiveWorkout({ ...activeWorkout, exercises: [...activeWorkout.exercises, we] })
    setShowPicker(false)
  }

  function addSet(exerciseIdx: number) {
    if (!activeWorkout) return
    const exercises = [...activeWorkout.exercises]
    const lastSet = exercises[exerciseIdx].sets[exercises[exerciseIdx].sets.length - 1]
    exercises[exerciseIdx].sets.push({
      id: v4(),
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
      completed: false,
    })
    setActiveWorkout({ ...activeWorkout, exercises })
  }

  function updateSet(exerciseIdx: number, setIdx: number, field: keyof WorkoutSet, value: number | boolean) {
    if (!activeWorkout) return
    const exercises = [...activeWorkout.exercises]
    exercises[exerciseIdx].sets[setIdx] = {
      ...exercises[exerciseIdx].sets[setIdx],
      [field]: value,
    }
    setActiveWorkout({ ...activeWorkout, exercises })
  }

  function finishWorkout() {
    if (!activeWorkout) return
    const duration = Math.round((Date.now() - startTime) / 60000)
    const finished: Workout = {
      ...activeWorkout,
      duration,
      exercises: activeWorkout.exercises.map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.completed),
      })).filter((e) => e.sets.length > 0),
    }
    saveWorkout(finished)
    setWorkouts(getWorkouts())
    setActiveWorkout(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  function cancelWorkout() {
    setActiveWorkout(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  function handleDeleteWorkout(id: string) {
    deleteWorkout(id)
    setWorkouts(getWorkouts())
  }

  // Find previous performance for an exercise
  function getPreviousPerformance(exerciseId: string): { weight: number; reps: number; sets: number } | null {
    for (const w of workouts) {
      const ex = w.exercises.find(e => e.exerciseId === exerciseId)
      if (ex && ex.sets.length > 0) {
        const avgWeight = Math.round(ex.sets.reduce((s, set) => s + set.weight, 0) / ex.sets.length)
        const avgReps = Math.round(ex.sets.reduce((s, set) => s + set.reps, 0) / ex.sets.length)
        return { weight: avgWeight, reps: avgReps, sets: ex.sets.length }
      }
    }
    return null
  }

  // Calculate plate breakdown
  function getPlateBreakdown(weight: number): string {
    const barWeight = 45
    if (weight <= barWeight) return `${barWeight}`
    let remaining = (weight - barWeight) / 2
    const plates = [45, 25, 10, 5, 2.5]
    const used: number[] = []
    for (const plate of plates) {
      while (remaining >= plate) {
        used.push(plate)
        remaining -= plate
      }
    }
    return `${barWeight} + ${used.join(' + ')}`
  }

  // ============ ACTIVE WORKOUT VIEW ============
  if (activeWorkout) {
    // Get the last exercise's last set weight for plate calc
    const lastExercise = activeWorkout.exercises[activeWorkout.exercises.length - 1]
    const lastSetWeight = lastExercise?.sets[lastExercise.sets.length - 1]?.weight || 0

    return (
      <div className="pb-28">
        {/* Header - matches reference exactly */}
        <div className="sticky top-0 z-10 bg-bg">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={cancelWorkout} className="text-muted">
              <ArrowLeft size={22} />
            </button>
            <div className="text-center">
              <input
                value={activeWorkout.name}
                onChange={(e) => setActiveWorkout({ ...activeWorkout, name: e.target.value })}
                className="bg-transparent text-center text-lg font-extrabold text-text outline-none"
              />
              <div className="text-xs font-medium text-primary">Duration: {elapsed}</div>
            </div>
            <button className="text-muted">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        <div className="px-5">
          {activeWorkout.exercises.map((ex, exIdx) => {
            const prev = getPreviousPerformance(ex.exerciseId)

            return (
              <div key={ex.id} className="mb-6">
                {/* Exercise name + RPE badge */}
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xl font-extrabold">{ex.exerciseName}</h3>
                  <span className="rounded-md border border-primary bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    RPE 8
                  </span>
                </div>

                {/* Previous performance bar */}
                {prev && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-2.5">
                    <Clock size={14} className="text-muted" />
                    <span className="text-sm text-muted">
                      Last time: <span className="font-semibold text-text">{prev.sets} sets x {prev.reps} reps @ {prev.weight} lbs</span>
                    </span>
                  </div>
                )}

                {/* SET table header */}
                <div className="mb-2 grid grid-cols-[3rem_1fr_1fr_1fr_2.5rem] items-center text-[11px] font-bold uppercase tracking-wider text-muted">
                  <span className="text-center">Set</span>
                  <span className="text-center">Previous</span>
                  <span className="text-center">LBS</span>
                  <span className="text-center">Reps</span>
                  <span></span>
                </div>

                {/* Set rows */}
                {ex.sets.map((set, setIdx) => {
                  const isActive = !set.completed && setIdx === ex.sets.filter(s => s.completed).length
                  return (
                    <div
                      key={set.id}
                      className={`mb-2 grid grid-cols-[3rem_1fr_1fr_1fr_2.5rem] items-center gap-1.5 rounded-xl px-1 py-2 transition-all ${
                        isActive
                          ? 'border border-dashed border-primary/60 bg-primary/5'
                          : set.completed
                            ? 'bg-surface'
                            : 'bg-surface'
                      }`}
                    >
                      {/* Set number circle */}
                      <div className="flex justify-center">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          set.completed
                            ? 'bg-primary text-black'
                            : isActive
                              ? 'border-2 border-primary text-primary'
                              : 'border-2 border-primary/40 text-primary/60'
                        }`}>
                          {setIdx + 1}
                        </span>
                      </div>

                      {/* Previous */}
                      <div className="text-center text-xs text-muted">
                        {prev ? `${prev.weight} lbs x ${prev.reps}` : '---'}
                      </div>

                      {/* Weight input */}
                      <input
                        type="number"
                        inputMode="decimal"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                        className="rounded-lg bg-surface-2 py-2.5 text-center text-sm font-bold text-text outline-none focus:ring-1 focus:ring-primary"
                        placeholder="---"
                      />

                      {/* Reps input */}
                      <input
                        type="number"
                        inputMode="numeric"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                        className="rounded-lg bg-surface-2 py-2.5 text-center text-sm font-bold text-text outline-none focus:ring-1 focus:ring-primary"
                        placeholder="---"
                      />

                      {/* Check button */}
                      <button
                        onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                          set.completed
                            ? 'bg-primary text-black'
                            : 'text-muted'
                        }`}
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                    </div>
                  )
                })}

                {/* + Add Set */}
                <button
                  onClick={() => addSet(exIdx)}
                  className="mt-1 w-full rounded-xl border border-dashed border-primary/30 py-3 text-xs font-semibold text-primary"
                >
                  + Add Set
                </button>

                {/* EXERCISE NOTES */}
                <div className="mt-4">
                  <h4 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-primary">Exercise Notes</h4>
                  <textarea
                    value={exerciseNotes[ex.id] || ''}
                    onChange={(e) => setExerciseNotes({ ...exerciseNotes, [ex.id]: e.target.value })}
                    placeholder="Focus on explosive upward phase..."
                    className="w-full resize-none rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-muted/40 focus:ring-1 focus:ring-primary/30"
                    rows={3}
                  />
                </div>
              </div>
            )
          })}

          {/* Add Exercise button */}
          <button
            onClick={() => setShowPicker(true)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 py-5 text-sm font-bold text-primary"
          >
            <Plus size={18} /> Add Exercise
          </button>
        </div>

        {/* Bottom bar: Plate Calculator + FINISH */}
        <div className="fixed bottom-16 left-0 right-0 z-20">
          <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3">
            {/* Plate Calculator */}
            {lastSetWeight > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                  <Grid3x3 size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Plate Calculator</div>
                  <div className="text-xs text-muted">{lastSetWeight} lbs = {getPlateBreakdown(lastSetWeight)}</div>
                </div>
              </div>
            )}

            {/* FINISH button */}
            <button
              onClick={finishWorkout}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-black shadow-lg shadow-primary/30 active:scale-[0.97] transition-transform"
            >
              Finish <Check size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {showPicker && <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />}
        {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
      </div>
    )
  }

  // ============ WORKOUT LIST VIEW ============
  return (
    <div className="p-5 pb-28">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Workouts</h1>
      <p className="mb-6 text-sm text-muted">Track your lifts and crush your goals</p>

      <button
        onClick={startNewWorkout}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-extrabold uppercase tracking-wider text-black active:scale-[0.98] transition-transform"
      >
        <Plus size={20} strokeWidth={3} /> Start Workout
      </button>

      {workouts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-2">
            <Dumbbell size={36} className="text-primary/30" />
          </div>
          <p className="font-semibold text-muted">No workouts yet</p>
          <p className="mt-1 text-sm text-muted/60">Start your first session!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted">Recent Workouts</h2>
          {workouts.map((w) => {
            const totalVolume = w.exercises.reduce((sum, e) =>
              sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0)
            const totalSets = w.exercises.reduce((sum, e) => sum + e.sets.length, 0)
            return (
              <div key={w.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <button
                  onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)}
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="text-left">
                    <div className="font-bold">{w.name}</div>
                    <div className="mt-1 text-xs text-muted">{format(new Date(w.date), 'MMM d, yyyy')}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-primary">{w.duration} min</div>
                      <div className="text-[11px] text-muted">{totalSets} sets &middot; {(totalVolume / 1000).toFixed(1)}t</div>
                    </div>
                    <div className="text-muted">
                      {expandedWorkout === w.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </button>
                {expandedWorkout === w.id && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
                    {w.exercises.map((ex) => (
                      <div key={ex.id}>
                        <div className="text-sm font-semibold text-primary">{ex.exerciseName}</div>
                        {ex.sets.map((s, i) => (
                          <div key={s.id} className="ml-2 text-xs text-muted">
                            Set {i + 1}: {s.weight} lbs x {s.reps}
                          </div>
                        ))}
                      </div>
                    ))}
                    <button
                      onClick={() => handleDeleteWorkout(w.id)}
                      className="mt-2 flex items-center gap-1 text-xs text-danger"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
