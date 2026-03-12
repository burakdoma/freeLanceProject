import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Play, Plus, Trash2 } from 'lucide-react'
import { defaultPlans } from '../data/plans'
import { getCustomPlans, saveCustomPlan, deleteCustomPlan } from '../lib/storage'
import type { WorkoutPlan, PlanDay } from '../types'
import { exercises, muscleGroupLabels } from '../data/exercises'
import { v4 } from '../lib/uuid'
import { useNavigate } from 'react-router-dom'
import type { Workout, WorkoutExercise } from '../types'

export default function PlansPage() {
  const navigate = useNavigate()
  const [customPlans, setCustomPlans] = useState<WorkoutPlan[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    setCustomPlans(getCustomPlans())
  }, [])

  const allPlans = [...defaultPlans, ...customPlans]

  function startFromPlan(plan: WorkoutPlan, day: PlanDay) {
    const workout: Workout = {
      id: v4(),
      date: new Date().toISOString(),
      name: `${plan.name} - ${day.name}`,
      exercises: day.exercises.map((pe): WorkoutExercise => ({
        id: v4(),
        exerciseId: pe.exerciseId,
        exerciseName: pe.exerciseName,
        sets: Array.from({ length: pe.sets }, () => ({
          id: v4(),
          weight: 0,
          reps: 0,
          completed: false,
        })),
      })),
      duration: 0,
      notes: '',
    }
    // Store the active workout in sessionStorage so WorkoutPage can pick it up
    sessionStorage.setItem('activeWorkout', JSON.stringify(workout))
    navigate('/')
  }

  return (
    <div className="p-5 pb-24">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Workout Plans</h1>
          <p className="mt-0.5 text-sm text-muted">Follow a program or create your own</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 active:scale-[0.97] transition-transform"
        >
          <Plus size={16} /> Create
        </button>
      </div>

      <div className="space-y-3">
        {allPlans.map((plan) => (
          <div key={plan.id} className="overflow-hidden rounded-2xl bg-surface shadow-sm">
            <button
              onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{plan.name}</span>
                  {plan.isCustom && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent">
                      Custom
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted">
                  {plan.days.length} days &middot; {plan.description}
                </div>
              </div>
              {expanded === plan.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded === plan.id && (
              <div className="border-t border-border p-4 pt-2">
                {plan.days.map((day) => (
                  <div key={day.id} className="mb-2">
                    <button
                      onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                      className="flex w-full items-center justify-between py-2"
                    >
                      <span className="text-sm font-medium">{day.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startFromPlan(plan, day)
                          }}
                          className="flex items-center gap-1 rounded-lg bg-success/20 px-2 py-1 text-xs font-medium text-success"
                        >
                          <Play size={12} /> Start
                        </button>
                        {expandedDay === day.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>
                    {expandedDay === day.id && (
                      <div className="ml-2 space-y-1 pb-2">
                        {day.exercises.map((pe, i) => (
                          <div key={i} className="text-xs text-muted">
                            {pe.exerciseName} &middot; {pe.sets} x {pe.reps} &middot; {pe.restSeconds}s rest
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {plan.isCustom && (
                  <button
                    onClick={() => {
                      deleteCustomPlan(plan.id)
                      setCustomPlans(getCustomPlans())
                    }}
                    className="mt-2 flex items-center gap-1 text-xs text-danger"
                  >
                    <Trash2 size={12} /> Delete Plan
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <CreatePlanModal
          onSave={(plan) => {
            saveCustomPlan(plan)
            setCustomPlans(getCustomPlans())
            setShowCreate(false)
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

function CreatePlanModal({
  onSave,
  onClose,
}: {
  onSave: (plan: WorkoutPlan) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [days, setDays] = useState<PlanDay[]>([
    { id: v4(), name: 'Day 1', exercises: [] },
  ])
  const [editingDay, setEditingDay] = useState(0)
  const [showExPicker, setShowExPicker] = useState(false)

  function addExerciseToDay(exercise: { id: string; name: string }) {
    const newDays = [...days]
    newDays[editingDay].exercises.push({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3,
      reps: '8-12',
      restSeconds: 90,
    })
    setDays(newDays)
    setShowExPicker(false)
  }

  function removeExercise(dayIdx: number, exIdx: number) {
    const newDays = [...days]
    newDays[dayIdx].exercises.splice(exIdx, 1)
    setDays(newDays)
  }

  function addDay() {
    setDays([...days, { id: v4(), name: `Day ${days.length + 1}`, exercises: [] }])
  }

  function save() {
    if (!name.trim()) return
    const plan: WorkoutPlan = {
      id: v4(),
      name: name.trim(),
      description: description.trim(),
      days,
      isCustom: true,
    }
    onSave(plan)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="flex items-center justify-between border-b border-border p-5">
        <h2 className="text-lg font-extrabold">Create Plan</h2>
        <div className="flex gap-2">
          <button onClick={onClose} className="rounded-xl bg-surface px-4 py-2 text-sm font-medium text-muted">
            Cancel
          </button>
          <button onClick={save} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/25">
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Plan Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Push Pull Legs"
            className="w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-muted"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            className="w-full rounded-xl bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-muted"
          />
        </div>

        {days.map((day, dayIdx) => (
          <div key={day.id} className="rounded-2xl bg-surface p-4 shadow-sm">
            <input
              value={day.name}
              onChange={(e) => {
                const newDays = [...days]
                newDays[dayIdx].name = e.target.value
                setDays(newDays)
              }}
              className="mb-3 bg-transparent font-bold outline-none"
            />
            {day.exercises.map((pe, exIdx) => (
              <div key={exIdx} className="mb-2 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
                <span>{pe.exerciseName} ({pe.sets} x {pe.reps})</span>
                <button onClick={() => removeExercise(dayIdx, exIdx)} className="text-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => { setEditingDay(dayIdx); setShowExPicker(true) }}
              className="mt-2 w-full rounded-xl bg-surface-2 py-2.5 text-xs font-semibold text-muted transition-colors hover:text-text"
            >
              + Add Exercise
            </button>
          </div>
        ))}

        <button
          onClick={addDay}
          className="w-full rounded-2xl border-2 border-dashed border-border py-4 text-sm font-semibold text-primary transition-colors hover:border-primary"
        >
          + Add Day
        </button>
      </div>

      {showExPicker && (
        <div className="fixed inset-0 z-60">
          <ExercisePickerSimple
            onSelect={(ex) => addExerciseToDay(ex)}
            onClose={() => setShowExPicker(false)}
          />
        </div>
      )}
    </div>
  )
}

function ExercisePickerSimple({
  onSelect,
  onClose,
}: {
  onSelect: (ex: { id: string; name: string }) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg bg-surface px-3 py-2 text-sm text-text outline-none placeholder:text-muted"
          autoFocus
        />
        <button onClick={onClose} className="text-sm text-muted">Cancel</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onSelect({ id: ex.id, name: ex.name })}
            className="w-full rounded-lg bg-surface p-3 text-left text-sm hover:bg-surface-2"
          >
            <div className="font-medium">{ex.name}</div>
            <div className="text-xs text-muted">{muscleGroupLabels[ex.muscleGroup]}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
