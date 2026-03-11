import { useState, useEffect } from 'react'
import { Plus, Trash2, Timer, Check, Save, ChevronDown, ChevronUp } from 'lucide-react'
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
      <div className="pb-20">
        <div className="sticky top-0 z-10 border-b border-[var(--color-surface-2)] bg-[var(--color-bg)] px-4 py-3">
          <div className="flex items-center justify-between">
            <input
              value={activeWorkout.name}
              onChange={(e) => setActiveWorkout({ ...activeWorkout, name: e.target.value })}
              className="bg-transparent text-lg font-bold outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowTimer(true)}
                className="rounded-lg bg-[var(--color-surface)] p-2 text-[var(--color-accent)]"
              >
                <Timer size={20} />
              </button>
              <button
                onClick={finishWorkout}
                className="flex items-center gap-1 rounded-lg bg-[var(--color-success)] px-3 py-2 text-sm font-semibold text-black"
              >
                <Save size={16} /> Finish
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {activeWorkout.exercises.map((ex, exIdx) => (
            <div key={ex.id} className="rounded-xl bg-[var(--color-surface)] p-4">
              <h3 className="mb-3 font-semibold text-[var(--color-primary-light)]">{ex.exerciseName}</h3>
              <div className="mb-2 grid grid-cols-[2rem_1fr_1fr_2rem_2rem] items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
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
                    set.completed ? 'opacity-60' : ''
                  }`}
                >
                  <span className="text-center text-sm text-[var(--color-text-muted)]">{setIdx + 1}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                    className="rounded-lg bg-[var(--color-surface-2)] px-2 py-1.5 text-center text-sm text-[var(--color-text)] outline-none"
                    placeholder="0"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                    className="rounded-lg bg-[var(--color-surface-2)] px-2 py-1.5 text-center text-sm text-[var(--color-text)] outline-none"
                    placeholder="0"
                  />
                  <button
                    onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      set.completed
                        ? 'bg-[var(--color-success)] text-black'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => removeSet(exIdx, setIdx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-danger)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSet(exIdx)}
                className="mt-2 w-full rounded-lg bg-[var(--color-surface-2)] py-2 text-xs font-medium text-[var(--color-text-muted)]"
              >
                + Add Set
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowPicker(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-surface-2)] py-4 text-sm font-medium text-[var(--color-primary-light)]"
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
    <div className="p-4 pb-20">
      <h1 className="mb-4 text-2xl font-bold">Workout</h1>
      <button
        onClick={startNewWorkout}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-4 text-base font-semibold text-white"
      >
        <Plus size={20} /> Start New Workout
      </button>

      {workouts.length === 0 ? (
        <div className="py-12 text-center">
          <Dumbbell size={48} className="mx-auto mb-3 text-[var(--color-surface-2)]" />
          <p className="text-[var(--color-text-muted)]">No workouts yet. Start your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-muted)]">History</h2>
          {workouts.map((w) => (
            <div key={w.id} className="rounded-xl bg-[var(--color-surface)] p-4">
              <button
                onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)}
                className="flex w-full items-center justify-between"
              >
                <div className="text-left">
                  <div className="font-semibold">{w.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {format(new Date(w.date), 'MMM d, yyyy')} &middot; {w.duration} min &middot;{' '}
                    {w.exercises.length} exercises
                  </div>
                </div>
                {expandedWorkout === w.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedWorkout === w.id && (
                <div className="mt-3 space-y-2 border-t border-[var(--color-surface-2)] pt-3">
                  {w.exercises.map((ex) => (
                    <div key={ex.id}>
                      <div className="text-sm font-medium text-[var(--color-primary-light)]">{ex.exerciseName}</div>
                      {ex.sets.map((s, i) => (
                        <div key={s.id} className="ml-2 text-xs text-[var(--color-text-muted)]">
                          Set {i + 1}: {s.weight}kg x {s.reps} reps
                        </div>
                      ))}
                    </div>
                  ))}
                  <button
                    onClick={() => handleDeleteWorkout(w.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-[var(--color-danger)]"
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

// Need Dumbbell for empty state
import { Dumbbell } from 'lucide-react'
