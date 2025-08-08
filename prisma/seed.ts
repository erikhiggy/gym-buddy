import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Sample workouts data
  const workoutsData = [
    {
      name: "Upper Body Strength",
      description: "Build strength in your chest, back, shoulders, and arms",
      category: "Upper Body",
      isFavorite: true,
      exercises: [
        { name: "Push-ups", reps: 15, sets: 3, order: 1 },
        { name: "Pull-ups", reps: 8, sets: 3, order: 2 },
        { name: "Dumbbell Bench Press", reps: 12, sets: 3, order: 3 },
        { name: "Shoulder Press", reps: 10, sets: 3, order: 4 },
        { name: "Bicep Curls", reps: 15, sets: 3, order: 5 },
      ]
    },
    {
      name: "Lower Body Power",
      description: "Explosive lower body workout targeting legs and glutes",
      category: "Lower Body", 
      isFavorite: false,
      exercises: [
        { name: "Squats", reps: 20, sets: 4, order: 1 },
        { name: "Deadlifts", reps: 12, sets: 3, order: 2 },
        { name: "Lunges", reps: 15, sets: 3, notes: "Each leg", order: 3 },
        { name: "Calf Raises", reps: 20, sets: 3, order: 4 },
        { name: "Leg Press", reps: 15, sets: 3, order: 5 },
      ]
    },
    {
      name: "HIIT Cardio Blast",
      description: "High-intensity interval training for maximum calorie burn",
      category: "HIIT",
      isFavorite: true,
      exercises: [
        { name: "Burpees", duration: "30 seconds", order: 1 },
        { name: "Mountain Climbers", duration: "30 seconds", order: 2 },
        { name: "Jump Squats", duration: "30 seconds", order: 3 },
        { name: "High Knees", duration: "30 seconds", order: 4 },
        { name: "Rest", duration: "60 seconds", order: 5 },
      ]
    },
    {
      name: "Core Crusher",
      description: "Strengthen and define your core muscles",
      category: "Core",
      isFavorite: false,
      exercises: [
        { name: "Plank", duration: "1 minute", order: 1 },
        { name: "Russian Twists", reps: 20, sets: 3, order: 2 },
        { name: "Bicycle Crunches", reps: 30, sets: 3, order: 3 },
        { name: "Dead Bug", reps: 10, sets: 3, notes: "Each side", order: 4 },
        { name: "Side Plank", duration: "30 seconds", notes: "Each side", order: 5 },
      ]
    },
    {
      name: "Full Body Circuit",
      description: "Complete workout targeting all major muscle groups",
      category: "Full Body",
      isFavorite: true,
      exercises: [
        { name: "Squat to Press", reps: 12, sets: 3, order: 1 },
        { name: "Renegade Rows", reps: 10, sets: 3, order: 2 },
        { name: "Thrusters", reps: 15, sets: 3, order: 3 },
        { name: "Turkish Get-ups", reps: 5, sets: 2, notes: "Each side", order: 4 },
        { name: "Burpees", reps: 10, sets: 3, order: 5 },
      ]
    },
    {
      name: "Morning Flexibility Flow",
      description: "Gentle stretching routine to start your day",
      category: "Flexibility",
      isFavorite: false,
      exercises: [
        { name: "Cat-Cow Stretch", duration: "1 minute", order: 1 },
        { name: "Child's Pose", duration: "30 seconds", order: 2 },
        { name: "Downward Dog", duration: "1 minute", order: 3 },
        { name: "Hip Circles", reps: 10, notes: "Each direction", order: 4 },
        { name: "Neck Rolls", reps: 5, notes: "Each direction", order: 5 },
      ]
    },
    {
      name: "Cardio Endurance",
      description: "Build cardiovascular endurance with steady-state exercises",
      category: "Cardio",
      isFavorite: false,
      exercises: [
        { name: "Treadmill Run", duration: "20 minutes", order: 1 },
        { name: "Rowing Machine", duration: "10 minutes", order: 2 },
        { name: "Cycling", duration: "15 minutes", order: 3 },
        { name: "Step-ups", duration: "5 minutes", order: 4 },
        { name: "Cool Down Walk", duration: "5 minutes", order: 5 },
      ]
    },
    {
      name: "Strength Foundation",
      description: "Basic strength training for beginners",
      category: "Strength Training",
      isFavorite: false,
      exercises: [
        { name: "Bodyweight Squats", reps: 15, sets: 3, order: 1 },
        { name: "Modified Push-ups", reps: 10, sets: 3, order: 2 },
        { name: "Assisted Pull-ups", reps: 5, sets: 3, order: 3 },
        { name: "Plank Hold", duration: "30 seconds", sets: 3, order: 4 },
        { name: "Glute Bridges", reps: 20, sets: 3, order: 5 },
      ]
    }
  ]

  console.log('🌱 Starting seed...')

  for (const workoutData of workoutsData) {
    const { exercises, ...workout } = workoutData
    
    const createdWorkout = await prisma.workout.create({
      data: {
        ...workout,
        exercises: {
          create: exercises
        }
      }
    })
    
    console.log(`✅ Created workout: ${createdWorkout.name}`)
  }

  // Create some sample workout completions
  const workouts = await prisma.workout.findMany()
  
  for (let i = 0; i < 5; i++) {
    const randomWorkout = workouts[Math.floor(Math.random() * workouts.length)]
    const randomDaysAgo = Math.floor(Math.random() * 30)
    const completedAt = new Date()
    completedAt.setDate(completedAt.getDate() - randomDaysAgo)
    
    await prisma.workoutCompletion.create({
      data: {
        workoutId: randomWorkout.id,
        completedAt,
        duration: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
        notes: Math.random() > 0.5 ? "Great workout!" : undefined
      }
    })
  }

  console.log('🎉 Seeding finished!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })