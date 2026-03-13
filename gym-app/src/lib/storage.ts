import type { Workout, WorkoutPlan } from '../types'

const WORKOUTS_KEY = 'gymtracker_workouts'
const PLANS_KEY = 'gymtracker_plans'

export function getWorkouts(): Workout[] {
  const data = localStorage.getItem(WORKOUTS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveWorkout(workout: Workout): void {
  const workouts = getWorkouts()
  const index = workouts.findIndex((w) => w.id === workout.id)
  if (index >= 0) {
    workouts[index] = workout
  } else {
    workouts.unshift(workout)
  }
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts))
}

export function deleteWorkout(id: string): void {
  const workouts = getWorkouts().filter((w) => w.id !== id)
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts))
}

export function getCustomPlans(): WorkoutPlan[] {
  const data = localStorage.getItem(PLANS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveCustomPlan(plan: WorkoutPlan): void {
  const plans = getCustomPlans()
  const index = plans.findIndex((p) => p.id === plan.id)
  if (index >= 0) {
    plans[index] = plan
  } else {
    plans.unshift(plan)
  }
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
}

export function deleteCustomPlan(id: string): void {
  const plans = getCustomPlans().filter((p) => p.id !== id)
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
}
