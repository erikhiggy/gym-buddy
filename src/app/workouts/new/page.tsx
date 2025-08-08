'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PageLayout } from '@/components/page-layout'
import { WorkoutForm } from '@/components/workout-form'
import { useWorkoutMutations } from '@/hooks/useWorkouts'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { CreateWorkoutRequest } from '@/types/api'

export default function CreateWorkoutPage() {
  const router = useRouter()
  const { createWorkout, loading, error } = useWorkoutMutations()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateWorkoutRequest) => {
    setIsSubmitting(true)
    
    try {
      const newWorkout = await createWorkout(data)
      
      if (newWorkout) {
        toast.success('Workout created successfully!')
        router.push(`/workouts/${newWorkout.id}`)
      } else {
        toast.error(error || 'Failed to create workout')
      }
    } catch (err) {
      console.error('Error creating workout:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <PageLayout title="Create Workout" description="Design your perfect workout">
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/workouts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workouts
          </Button>
        </Link>
      </div>

      {/* Form */}
      <WorkoutForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading || isSubmitting}
        submitLabel="Create Workout"
        cancelLabel="Cancel"
      />
    </PageLayout>
  )
}