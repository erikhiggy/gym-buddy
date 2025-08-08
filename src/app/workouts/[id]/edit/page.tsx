'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/page-layout'
import { WorkoutForm } from '@/components/workout-form'
import { useWorkout, useWorkoutMutations } from '@/hooks/useWorkouts'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { CreateWorkoutRequest } from '@/types/api'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditWorkoutPage({ params }: PageProps) {
  const router = useRouter()
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  
  // Get workout ID from params
  useEffect(() => {
    params.then(({ id }) => setWorkoutId(id))
  }, [params])

  const { workout, loading: fetchLoading, error: fetchError, refresh } = useWorkout(workoutId)
  const { updateWorkout, loading: updateLoading, error: updateError } = useWorkoutMutations()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateWorkoutRequest) => {
    if (!workoutId) return
    
    setIsSubmitting(true)
    
    try {
      const updatedWorkout = await updateWorkout(workoutId, data)
      
      if (updatedWorkout) {
        toast.success('Workout updated successfully!')
        router.push(`/workouts/${workoutId}`)
      } else {
        toast.error(updateError || 'Failed to update workout')
      }
    } catch (err) {
      console.error('Error updating workout:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Loading state
  if (fetchLoading || !workoutId) {
    return (
      <PageLayout title="Edit Workout" description="Updating your workout">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/workouts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workouts
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading workout...</p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  // Error state
  if (fetchError || !workout) {
    return (
      <PageLayout title="Edit Workout" description="Workout not found">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/workouts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workouts
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">
              {fetchError || 'Workout not found'}
            </p>
            <div className="flex gap-3">
              <Button onClick={refresh} variant="outline">
                Try Again
              </Button>
              <Link href="/workouts">
                <Button>
                  Back to Workouts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Edit Workout" description={`Editing "${workout.name}"`}>
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/workouts/${workoutId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workout
          </Button>
        </Link>
      </div>

      {/* Form */}
      <WorkoutForm
        initialData={workout}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateLoading || isSubmitting}
        submitLabel="Update Workout"
        cancelLabel="Cancel"
      />
    </PageLayout>
  )
}