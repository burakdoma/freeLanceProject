export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'abs'
  | 'forearms'
  | 'calves'
  | 'full_body'
  | 'cardio'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  description: string
  equipment: string
}

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  completed: boolean
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  exerciseName: string
  sets: WorkoutSet[]
}

export interface Workout {
  id: string
  date: string
  name: string
  exercises: WorkoutExercise[]
  duration: number // minutes
  notes: string
}

export interface WorkoutPlan {
  id: string
  name: string
  description: string
  days: PlanDay[]
  isCustom: boolean
}

export interface PlanDay {
  id: string
  name: string
  exercises: PlanExercise[]
}

export interface PlanExercise {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: string // e.g. "8-12"
  restSeconds: number
}
