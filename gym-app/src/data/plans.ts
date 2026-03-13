import type { WorkoutPlan } from '../types'

export const defaultPlans: WorkoutPlan[] = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description: 'Classic 3-day split targeting push muscles, pull muscles, and legs separately.',
    isCustom: false,
    days: [
      {
        id: 'ppl-push',
        name: 'Push Day',
        exercises: [
          { exerciseId: 'bench-press', exerciseName: 'Bench Press', sets: 4, reps: '6-8', restSeconds: 120 },
          { exerciseId: 'overhead-press', exerciseName: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseId: 'incline-bench-press', exerciseName: 'Incline Bench Press', sets: 3, reps: '8-12', restSeconds: 90 },
          { exerciseId: 'lateral-raise', exerciseName: 'Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'tricep-pushdown', exerciseName: 'Tricep Pushdown', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'overhead-tricep-extension', exerciseName: 'Overhead Tricep Extension', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        id: 'ppl-pull',
        name: 'Pull Day',
        exercises: [
          { exerciseId: 'deadlift', exerciseName: 'Deadlift', sets: 3, reps: '5-6', restSeconds: 180 },
          { exerciseId: 'pull-up', exerciseName: 'Pull-Up', sets: 4, reps: '6-10', restSeconds: 120 },
          { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseId: 'face-pull', exerciseName: 'Face Pull', sets: 3, reps: '15-20', restSeconds: 60 },
          { exerciseId: 'barbell-curl', exerciseName: 'Barbell Curl', sets: 3, reps: '8-12', restSeconds: 60 },
          { exerciseId: 'hammer-curl', exerciseName: 'Hammer Curl', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        id: 'ppl-legs',
        name: 'Leg Day',
        exercises: [
          { exerciseId: 'squat', exerciseName: 'Barbell Squat', sets: 4, reps: '6-8', restSeconds: 180 },
          { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'leg-press', exerciseName: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'leg-curl', exerciseName: 'Leg Curl', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'leg-extension', exerciseName: 'Leg Extension', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'standing-calf-raise', exerciseName: 'Standing Calf Raise', sets: 4, reps: '12-15', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower Split',
    description: '4-day split alternating between upper body and lower body sessions.',
    isCustom: false,
    days: [
      {
        id: 'ul-upper1',
        name: 'Upper Body A (Strength)',
        exercises: [
          { exerciseId: 'bench-press', exerciseName: 'Bench Press', sets: 4, reps: '5-6', restSeconds: 180 },
          { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', sets: 4, reps: '5-6', restSeconds: 180 },
          { exerciseId: 'overhead-press', exerciseName: 'Overhead Press', sets: 3, reps: '6-8', restSeconds: 120 },
          { exerciseId: 'lat-pulldown', exerciseName: 'Lat Pulldown', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseId: 'barbell-curl', exerciseName: 'Barbell Curl', sets: 2, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'skull-crusher', exerciseName: 'Skull Crusher', sets: 2, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        id: 'ul-lower1',
        name: 'Lower Body A (Strength)',
        exercises: [
          { exerciseId: 'squat', exerciseName: 'Barbell Squat', sets: 4, reps: '5-6', restSeconds: 180 },
          { exerciseId: 'romanian-deadlift', exerciseName: 'Romanian Deadlift', sets: 3, reps: '6-8', restSeconds: 120 },
          { exerciseId: 'leg-press', exerciseName: 'Leg Press', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseId: 'leg-curl', exerciseName: 'Leg Curl', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'standing-calf-raise', exerciseName: 'Standing Calf Raise', sets: 4, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'plank', exerciseName: 'Plank', sets: 3, reps: '30-60s', restSeconds: 60 },
        ],
      },
      {
        id: 'ul-upper2',
        name: 'Upper Body B (Hypertrophy)',
        exercises: [
          { exerciseId: 'incline-bench-press', exerciseName: 'Incline Bench Press', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'seated-cable-row', exerciseName: 'Seated Cable Row', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'dumbbell-fly', exerciseName: 'Dumbbell Fly', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'lateral-raise', exerciseName: 'Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'dumbbell-curl', exerciseName: 'Dumbbell Curl', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'tricep-pushdown', exerciseName: 'Tricep Pushdown', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        id: 'ul-lower2',
        name: 'Lower Body B (Hypertrophy)',
        exercises: [
          { exerciseId: 'leg-press', exerciseName: 'Leg Press', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'lunges', exerciseName: 'Lunges', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'leg-extension', exerciseName: 'Leg Extension', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'leg-curl', exerciseName: 'Leg Curl', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'hip-thrust', exerciseName: 'Hip Thrust', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'seated-calf-raise', exerciseName: 'Seated Calf Raise', sets: 4, reps: '15-20', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body (3x/week)',
    description: 'Hit every major muscle group 3 times per week with compound movements.',
    isCustom: false,
    days: [
      {
        id: 'fb-day1',
        name: 'Day A',
        exercises: [
          { exerciseId: 'squat', exerciseName: 'Barbell Squat', sets: 3, reps: '6-8', restSeconds: 180 },
          { exerciseId: 'bench-press', exerciseName: 'Bench Press', sets: 3, reps: '6-8', restSeconds: 120 },
          { exerciseId: 'barbell-row', exerciseName: 'Barbell Row', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseId: 'lateral-raise', exerciseName: 'Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'barbell-curl', exerciseName: 'Barbell Curl', sets: 2, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        id: 'fb-day2',
        name: 'Day B',
        exercises: [
          { exerciseId: 'deadlift', exerciseName: 'Deadlift', sets: 3, reps: '5-6', restSeconds: 180 },
          { exerciseId: 'overhead-press', exerciseName: 'Overhead Press', sets: 3, reps: '6-8', restSeconds: 120 },
          { exerciseId: 'pull-up', exerciseName: 'Pull-Up', sets: 3, reps: '6-10', restSeconds: 120 },
          { exerciseId: 'lunges', exerciseName: 'Lunges', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'tricep-pushdown', exerciseName: 'Tricep Pushdown', sets: 2, reps: '10-12', restSeconds: 60 },
        ],
      },
    ],
  },
]
