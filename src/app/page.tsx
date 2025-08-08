'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { WorkoutCard } from '@/components/workout-card'
import { useWorkoutStats, useWorkoutMutations } from '@/hooks/useWorkouts'
import { Dumbbell, Trophy, Calendar, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const {
    totalWorkouts,
    totalCompletions,
    recentActivity,
    loading: statsLoading
  } = useWorkoutStats()
  
  const { toggleFavorite } = useWorkoutMutations()
  
  const handleFavoriteToggle = async (workoutId: string) => {
    try {
      await toggleFavorite(workoutId)
      toast.success('Favorite updated!')
    } catch (error) {
      toast.error('Failed to update favorite')
    }
  }

  return (
    <PageLayout title="Gym Buddy" description="Your personal workout manager">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <Dumbbell className="h-8 w-8 text-primary mr-3" />
            <div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 w-8 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-20 bg-muted rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">Total Workouts</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Trophy className="h-8 w-8 text-primary mr-3" />
            <div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 w-8 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-16 bg-muted rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold">{totalCompletions}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This Week */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-12 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-32 bg-muted rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-primary">{recentActivity.length}</p>
                  <p className="text-sm text-muted-foreground">recent workouts</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Keep it up!</p>
              <p className="text-xs text-muted-foreground">You&apos;re doing great</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/workouts">
          <Button className="w-full h-12" size="lg">
            <Dumbbell className="h-5 w-5 mr-2" />
            Browse Workouts
          </Button>
        </Link>
        
        <Link href="/workouts/new">
          <Button variant="outline" className="w-full h-12" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Workout
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Recent Activity
        </h2>
        
        {statsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 3).map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
            {recentActivity.length > 3 && (
              <div className="text-center pt-2">
                <Link href="/workouts">
                  <Button variant="outline" size="sm">
                    View All Workouts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No workouts completed yet.
                <br />
                Start your fitness journey today!
              </p>
              <div className="flex gap-3">
                <Link href="/workouts">
                  <Button>
                    Browse Workouts
                  </Button>
                </Link>
                <Link href="/workouts/new">
                  <Button variant="outline">
                    Create Workout
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}