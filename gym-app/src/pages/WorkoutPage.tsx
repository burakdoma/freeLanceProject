import { useState, useEffect } from 'react'
import { Plus, Trash2, Timer, Check, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'
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
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null)

  useEffect(() => {
    setWorkouts(getWorkouts())
    // Check if a workout was started from Plans page
    const saved = sessionStorage.getItem('activeWorkout')
    if (saved) {
      setActiveWorkout(JSON.parse(saved))
      setStartTime(Date.now())
      sessionStorage.removeItem('activeWorkout')
    }
  }, [])

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
  }

  function handleDeleteWorkout(id: string) {
    deleteWorkout(id)
    setWorkouts(getWorkouts())
  }

  if (activeWorkout) {
    return (
      <div className="pb-24">
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-5 py-4">
          <div className="flex items-center justify-between">
            <input
              value={activeWorkout.name}
              onChange={(e) => setActiveWorkout({ ...activeWorkout, name: e.target.value })}
              className="bg-transparent text-lg font-bold text-text outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowTimer(true)}
                className="rounded-xl bg-surface-2 p-2.5 text-primary"
              >
                <Timer size={20} />
              </button>
              <button
                onClick={finishWorkout}
                className="flex items-center gap-1.5 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-white active:scale-[0.97] transition-transform"
              >
                <Check size={16} /> Finish
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {activeWorkout.exercises.map((ex, exIdx) => (
            <div key={ex.id} className="overflow-hidden rounded-2xl bg-surface shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-bold text-text">{ex.exerciseName}</h3>
              </div>
              <div className="p-4">
                <div className="mb-2 grid grid-cols-[2rem_1fr_1fr_2rem_2rem] items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <span>Set</span>
                  <span>kg</span>
                  <span>Reps</span>
                  <span></span>
                  <span></span>
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div
                    key={set.id}
                    className={`mb-2 grid grid-cols-[2rem_1fr_1fr_2rem_2rem] items-center gap-2 ${
                      set.completed ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="text-center text-sm font-semibold text-muted">{setIdx + 1}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                      className="rounded-lg border border-border bg-surface-2 px-2 py-2 text-center text-sm font-medium text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="0"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                      className="rounded-lg border border-border bg-surface-2 px-2 py-2 text-center text-sm font-medium text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="0"
                    />
                    <button
                      onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        set.completed
                          ? 'bg-success text-white'
                          : 'border-2 border-border bg-surface text-muted'
                      }`}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => removeSet(exIdx, setIdx)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-danger/60 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addSet(exIdx)}
                  className="mt-2 w-full rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-primary"
                >
                  + Add Set
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowPicker(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-sm font-bold text-white shadow-sm active:scale-[0.98] transition-transform"
          >
            <Plus size={18} /> Add Exercise
          </button>
        </div>

        {showPicker && <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />}
        {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}
      </div>
    )
  }

  return (
    <div className="p-5 pb-24">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-text">Workout</h1>
      <p className="mb-6 text-sm text-muted">Track your lifts and crush your goals</p>
      <button
        onClick={startNewWorkout}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-bold text-white shadow-md shadow-accent/20 active:scale-[0.98] transition-transform"
      >
        <Plus size={20} /> Start New Workout
      </button>

      {workouts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-2">
            <Dumbbell size={36} className="text-muted" />
          </div>
          <p className="font-medium text-muted">No workouts yet</p>
          <p className="mt-1 text-sm text-muted">Start your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">History</h2>
          {workouts.map((w) => (
            <div key={w.id} className="rounded-2xl bg-surface p-4 shadow-sm">
              <button
                onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)}
                className="flex w-full items-center justify-between"
              >
                <div className="text-left">
                  <div className="font-bold text-text">{w.name}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {format(new Date(w.date), 'MMM d, yyyy')} &middot; {w.duration} min &middot;{' '}
                    {w.exercises.length} exercises
                  </div>
                </div>
                <div className="text-muted">
                  {expandedWorkout === w.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
              {expandedWorkout === w.id && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {w.exercises.map((ex) => (
                    <div key={ex.id}>
                      <div className="text-sm font-semibold text-primary">{ex.exerciseName}</div>
                      {ex.sets.map((s, i) => (
                        <div key={s.id} className="ml-2 text-xs text-muted">
                          Set {i + 1}: {s.weight}kg x {s.reps} reps
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
          ))}
        </div>
      )}
    </div>
  )
}
