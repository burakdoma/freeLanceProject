import type { Exercise } from '../types'

export const exercises: Exercise[] = [
  // CHEST
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    description: 'Lie on a flat bench, grip the barbell slightly wider than shoulder-width, lower to chest, and press up.',
    equipment: 'Barbell, Bench',
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    description: 'Perform bench press on an incline bench (30-45 degrees) to target upper chest.',
    equipment: 'Barbell, Incline Bench',
  },
  {
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders'],
    description: 'Lie on a flat bench with dumbbells, extend arms wide in an arc, then squeeze back together.',
    equipment: 'Dumbbells, Bench',
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders', 'abs'],
    description: 'Standard push-up from the floor. Keep body straight, lower chest to ground, push back up.',
    equipment: 'Bodyweight',
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders'],
    description: 'Stand between cable towers, pull handles together in a hugging motion.',
    equipment: 'Cable Machine',
  },
  {
    id: 'dips-chest',
    name: 'Dips (Chest)',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    description: 'Lean forward on parallel bars, lower body until stretch in chest, push back up.',
    equipment: 'Dip Station',
  },

  // BACK
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'back',
    secondaryMuscles: ['legs', 'glutes', 'forearms'],
    description: 'Stand over barbell, hinge at hips, grip bar, and stand up by driving hips forward.',
    equipment: 'Barbell',
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    description: 'Hang from a bar with overhand grip, pull yourself up until chin clears the bar.',
    equipment: 'Pull-Up Bar',
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    description: 'Bend over with barbell, pull the weight to your lower chest/upper abdomen.',
    equipment: 'Barbell',
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    description: 'Sit at a lat pulldown machine, pull the bar down to your upper chest.',
    equipment: 'Cable Machine',
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    description: 'Sit at a cable row station, pull the handle to your torso while keeping back straight.',
    equipment: 'Cable Machine',
  },
  {
    id: 'dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    description: 'Place one knee on a bench, row a dumbbell up to your hip with the other arm.',
    equipment: 'Dumbbell, Bench',
  },

  // SHOULDERS
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    description: 'Press a barbell from shoulder height to overhead with a slight lean back.',
    equipment: 'Barbell',
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    description: 'Hold dumbbells at sides, raise arms laterally until parallel to the floor.',
    equipment: 'Dumbbells',
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['back'],
    description: 'Pull a rope attachment on a cable machine towards your face, squeezing shoulder blades.',
    equipment: 'Cable Machine',
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    description: 'Start with dumbbells in front of shoulders (palms facing you), rotate and press overhead.',
    equipment: 'Dumbbells',
  },
  {
    id: 'front-raise',
    name: 'Front Raise',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    description: 'Hold dumbbells in front of thighs, raise one or both arms to shoulder height.',
    equipment: 'Dumbbells',
  },

  // BICEPS
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    description: 'Stand holding a barbell with underhand grip, curl the weight up to shoulders.',
    equipment: 'Barbell',
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    description: 'Alternate or simultaneously curl dumbbells from sides to shoulders.',
    equipment: 'Dumbbells',
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    description: 'Curl dumbbells with a neutral (hammer) grip to target brachialis.',
    equipment: 'Dumbbells',
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    description: 'Rest upper arms on a preacher bench, curl the weight focusing on biceps.',
    equipment: 'EZ Bar, Preacher Bench',
  },

  // TRICEPS
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    description: 'Push a cable attachment down by extending the elbows, keep upper arms stationary.',
    equipment: 'Cable Machine',
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    description: 'Lie on a bench, lower a barbell/EZ bar to your forehead by bending elbows, then extend.',
    equipment: 'EZ Bar, Bench',
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    description: 'Hold a dumbbell overhead with both hands, lower behind head, then extend.',
    equipment: 'Dumbbell',
  },
  {
    id: 'close-grip-bench',
    name: 'Close-Grip Bench Press',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    description: 'Bench press with hands closer together to emphasize triceps.',
    equipment: 'Barbell, Bench',
  },

  // LEGS
  {
    id: 'squat',
    name: 'Barbell Squat',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes', 'abs'],
    description: 'Place barbell on upper back, squat down until thighs are parallel, stand back up.',
    equipment: 'Barbell, Squat Rack',
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes'],
    description: 'Sit in a leg press machine, push the platform away by extending your legs.',
    equipment: 'Leg Press Machine',
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    muscleGroup: 'legs',
    secondaryMuscles: [],
    description: 'Sit in a leg extension machine, extend your legs to straighten, targeting quadriceps.',
    equipment: 'Leg Extension Machine',
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    muscleGroup: 'legs',
    secondaryMuscles: [],
    description: 'Lie face down on a leg curl machine, curl the weight by bending your knees.',
    equipment: 'Leg Curl Machine',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes'],
    description: 'Step forward, lower back knee toward the ground, then push back up.',
    equipment: 'Dumbbells / Bodyweight',
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'legs',
    secondaryMuscles: ['back', 'glutes'],
    description: 'Hold barbell, hinge at hips with slight knee bend, lower weight along legs.',
    equipment: 'Barbell',
  },

  // GLUTES
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'glutes',
    secondaryMuscles: ['legs'],
    description: 'Sit with upper back against a bench, barbell on hips, thrust hips upward.',
    equipment: 'Barbell, Bench',
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    muscleGroup: 'glutes',
    secondaryMuscles: ['legs'],
    description: 'Lie on back, feet on floor, push hips up squeezing glutes at the top.',
    equipment: 'Bodyweight / Barbell',
  },
  {
    id: 'cable-kickback',
    name: 'Cable Kickback',
    muscleGroup: 'glutes',
    secondaryMuscles: [],
    description: 'Attach ankle cuff to cable, kick leg back focusing on glute contraction.',
    equipment: 'Cable Machine',
  },

  // ABS
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'abs',
    secondaryMuscles: ['shoulders'],
    description: 'Hold a push-up position on forearms, keeping body in a straight line.',
    equipment: 'Bodyweight',
  },
  {
    id: 'crunches',
    name: 'Crunches',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    description: 'Lie on back with knees bent, curl shoulders off the ground.',
    equipment: 'Bodyweight',
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'abs',
    secondaryMuscles: ['forearms'],
    description: 'Hang from a bar, raise legs until parallel to the ground or higher.',
    equipment: 'Pull-Up Bar',
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    description: 'Sit with feet off ground, rotate torso side to side with or without weight.',
    equipment: 'Bodyweight / Medicine Ball',
  },
  {
    id: 'cable-woodchop',
    name: 'Cable Woodchop',
    muscleGroup: 'abs',
    secondaryMuscles: ['shoulders'],
    description: 'Pull cable diagonally across body with a rotational motion.',
    equipment: 'Cable Machine',
  },

  // CALVES
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    description: 'Stand on a raised edge, push up onto toes, lower heels below platform.',
    equipment: 'Calf Raise Machine / Smith Machine',
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    description: 'Sit with pad on knees, push up onto toes against resistance.',
    equipment: 'Seated Calf Raise Machine',
  },

  // FOREARMS
  {
    id: 'wrist-curl',
    name: 'Wrist Curl',
    muscleGroup: 'forearms',
    secondaryMuscles: [],
    description: 'Rest forearms on thighs, curl wrists upward holding a barbell or dumbbells.',
    equipment: 'Barbell / Dumbbells',
  },
  {
    id: 'reverse-wrist-curl',
    name: 'Reverse Wrist Curl',
    muscleGroup: 'forearms',
    secondaryMuscles: [],
    description: 'Same as wrist curl but with overhand grip to target forearm extensors.',
    equipment: 'Barbell / Dumbbells',
  },
  {
    id: 'farmer-walk',
    name: "Farmer's Walk",
    muscleGroup: 'forearms',
    secondaryMuscles: ['shoulders', 'abs'],
    description: 'Hold heavy dumbbells at sides and walk for distance or time.',
    equipment: 'Dumbbells / Kettlebells',
  },
]

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id)
}

export function getExercisesByMuscleGroup(group: MuscleGroup): Exercise[] {
  return exercises.filter(
    (e) => e.muscleGroup === group || e.secondaryMuscles.includes(group)
  )
}

import type { MuscleGroup } from '../types'

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  glutes: 'Glutes',
  abs: 'Abs',
  forearms: 'Forearms',
  calves: 'Calves',
  full_body: 'Full Body',
  cardio: 'Cardio',
}
