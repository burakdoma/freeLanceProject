import { useState, useEffect } from 'react'
import { Plus, Trash2, Timer, Check, Save, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'
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
        <div className="sticky top-0 z-10 border-b border-surface-2 bg-bg/95 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <input
              value={activeWorkout.name}
              onChange={(e) => setActiveWorkout({ ...activeWorkout, name: e.target.value })}
              className="bg-transparent text-lg font-bold outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowTimer(true)}
                className="rounded-xl bg-surface p-2.5 text-accent transition-colors hover:bg-surface-2"
              >
                <Timer size={20} />
              </button>
              <button
                onClick={finishWorkout}
                className="flex items-center gap-1.5 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-success/25 active:scale-[0.97] transition-transform"
              >
                <Save size={16} /> Finish
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {activeWorkout.exercises.map((ex, exIdx) => (
            <div key={ex.id} className="rounded-2xl bg-surface p-4 shadow-lg shadow-black/10">
              <h3 className="mb-3 font-bold text-primary-light">{ex.exerciseName}</h3>
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
                    set.completed ? 'opacity-60' : ''
                  }`}
                >
                  <span className="text-center text-sm text-muted">{setIdx + 1}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={set.weight || ''}
                    onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                    className="rounded-lg bg-surface-2 px-2 py-1.5 text-center text-sm text-text outline-none"
                    placeholder="0"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                    className="rounded-lg bg-surface-2 px-2 py-1.5 text-center text-sm text-text outline-none"
                    placeholder="0"
                  />
                  <button
                    onClick={() => updateSet(exIdx, setIdx, 'completed', !set.completed)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      set.completed
                        ? 'bg-success text-black'
                        : 'bg-surface-2 text-muted'
                    }`}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => removeSet(exIdx, setIdx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSet(exIdx)}
                className="mt-3 w-full rounded-xl bg-surface-2 py-2.5 text-xs font-semibold text-muted transition-colors hover:text-text"
              >
                + Add Set
              </button>
            </div>
          ))}

          <button
            onClick={() => setShowPicker(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-surface-2 py-5 text-sm font-semibold text-primary-light transition-colors hover:border-primary hover:text-primary"
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
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Workout</h1>
      <p className="mb-5 text-sm text-muted">Track your lifts and crush your goals</p>
      <button
        onClick={startNewWorkout}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-light py-4 text-base font-bold text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
      >
        <Plus size={20} /> Start New Workout
      </button>

      {workouts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
            <Dumbbell size={36} className="text-muted" />
          </div>
          <p className="text-muted">No workouts yet. Start your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">History</h2>
          {workouts.map((w) => (
            <div key={w.id} className="rounded-2xl bg-surface p-4 shadow-lg shadow-black/10">
              <button
                onClick={() => setExpandedWorkout(expandedWorkout === w.id ? null : w.id)}
                className="flex w-full items-center justify-between"
              >
                <div className="text-left">
                  <div className="font-bold">{w.name}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {format(new Date(w.date), 'MMM d, yyyy')} &middot; {w.duration} min &middot;{' '}
                    {w.exercises.length} exercises
                  </div>
                </div>
                {expandedWorkout === w.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedWorkout === w.id && (
                <div className="mt-3 space-y-2 border-t border-surface-2 pt-3">
                  {w.exercises.map((ex) => (
                    <div key={ex.id}>
                      <div className="text-sm font-medium text-primary-light">{ex.exerciseName}</div>
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
