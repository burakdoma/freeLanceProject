import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp, Dumbbell, MoreVertical, ArrowLeft, StickyNote } from 'lucide-react'
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
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
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

  // Live timer
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
      name: 'Workout',
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

  function removeSet(exerciseIdx: number, setIdx: number) {
    if (!activeWorkout) return
    const exercises = [...activeWorkout.exercises]
    exercises[exerciseIdx].sets.splice(setIdx, 1)
    if (exercises[exerciseIdx].sets.length === 0) {
      exercises.splice(exerciseIdx, 1)
    }
    setActiveWorkout({ ...activeWorkout, exercises })
  }

  function removeExercise(exerciseIdx: number) {
    if (!activeWorkout) return
    const exercises = [...activeWorkout.exercises]
    exercises.splice(exerciseIdx, 1)
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

  // Active workout view - matches "Workout Logger" screen
  if (activeWorkout) {
    return (
      <div className="pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={cancelWorkout} className="text-muted">
              <ArrowLeft size={22} />
            </button>
            <div className="text-center">
              <input
                value={activeWorkout.name}
                onChange={(e) => setActiveWorkout({ ...activeWorkout, name: e.target.value })}
                className="bg-transparent text-center font-bold text-text outline-none"
              />
              <div className="text-xs text-primary">Duration: {elapsed}</div>
            </div>
            <button className="text-muted">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 pt-2">
          {activeWorkout.exercises.map((ex, exIdx) => (
            <div key={ex.id}>
              {/* Exercise header */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-text">{ex.exerciseName}</h3>
                <button
                  onClick={() => removeExercise(exIdx)}
                  className="rounded-lg bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger"
                >
                  Remove
                </button>
              </div>

              {/* Sets table */}
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                {/* Table header */}
                <div className="grid grid-cols-[3rem_1fr_1fr_2.5rem] items-center gap-1 border-b border-border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <span className="text-center">Set</span>
                  <span className="text-center">KG</span>
                  <span className="text-center">Reps</span>
                  <span></span>
                </div>

                {/* Set rows */}
                {ex.sets.map((set, setIdx) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-[3rem_1fr_1fr_2.5rem] items-center gap-1 border-b border-border/50 px-3 py-1.5 transition-colors ${
                      set.completed ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Set number circle */}
                    <div className="flex justify-center">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        set.completed
                          ? 'bg-primary text-black'
                          : 'border-2 border-primary/40 text-primary'
                      }`}>
                        {setIdx + 1}
                      </span>
                    </div>

                    {/* Weight input */}
                    <input
                      type="number"
                      inputMode="decimal"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                      className="mx-1 rounded-lg bg-surface-2 px-2 py-2.5 text-center text-sm font-semibold text-text outline-none focus:ring-1 focus:ring-primary"
                      placeholder="---"
                    />

                    {/* Reps input */}
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                      className="mx-1 rounded-lg bg-surface-2 px-2 py-2.5 text-center text-sm font-semibold text-text outline-none focus:ring-1 focus:ring-primary"
                      placeholder="---"
                    />

                    {/* Complete / Delete */}
                    <button
                      onClick={() => {
                        if (set.completed) {
                          removeSet(exIdx, setIdx)
                        } else {
                          updateSet(exIdx, setIdx, 'completed', true)
                        }
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                        set.completed
                          ? 'bg-primary text-black'
                          : 'text-muted hover:text-primary'
                      }`}
                    >
                      {set.completed ? <Check size={16} strokeWidth={3} /> : <Check size={16} />}
                    </button>
                  </div>
                ))}

                {/* Add Set row */}
                <button
                  onClick={() => addSet(exIdx)}
                  className="flex w-full items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary transition-colors hover:bg-surface-2"
                >
                  <Plus size={14} /> Add Set
                </button>
              </div>

              {/* Exercise Notes toggle */}
              <button
                onClick={() => setExpandedNotes(expandedNotes === ex.id ? null : ex.id)}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"
              >
                <StickyNote size={12} /> Exercise Notes
              </button>
              {expandedNotes === ex.id && (
                <textarea
                  placeholder="Focus on explosive upward phase..."
                  className="mt-2 w-full resize-none rounded-xl bg-surface-2 px-4 py-3 text-sm text-text outline-none placeholder:text-muted/50 focus:ring-1 focus:ring-primary"
                  rows={2}
                />
              )}
            </div>
          ))}

          {/* Add Exercise button */}
          <button
            onClick={() => setShowPicker(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 py-5 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-primary/5"
          >
            <Plus size={18} /> Add Exercise
          </button>
        </div>

        {/* Floating Finish Button */}
        <div className="fixed bottom-20 left-0 right-0 z-20 flex justify-center px-5">
          <button
            onClick={finishWorkout}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-extrabold uppercase tracking-wider text-black shadow-lg shadow-primary/30 active:scale-[0.97] transition-transform"
          >
            Finish <Check size={18} strokeWidth={3} />
          </button>
        </div>

        {showPicker && <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />}
        {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
      </div>
    )
  }

  // Workout list / home view
  return (
    <div className="p-5 pb-24">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Workouts</h1>
      <p className="mb-6 text-sm text-muted">Track your lifts and crush your goals</p>

      <button
        onClick={startNewWorkout}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-extrabold uppercase tracking-wider text-black shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
      >
        <Plus size={20} strokeWidth={3} /> Start Workout
      </button>

      {workouts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-2">
            <Dumbbell size={36} className="text-primary/40" />
          </div>
          <p className="font-semibold text-muted">No workouts yet</p>
          <p className="mt-1 text-sm text-muted/70">Start your first session!</p>
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
                    <div className="mt-1 text-xs text-muted">
                      {format(new Date(w.date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-primary">{w.duration} min</div>
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
                            Set {i + 1}: {s.weight}kg x {s.reps}
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
