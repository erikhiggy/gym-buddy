import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/page-layout'
import { prisma } from '@/lib/prisma'
import { Calendar, Clock, Trophy, TrendingUp, Repeat } from 'lucide-react'

async function getWorkoutHistory() {
  const completions = await prisma.workoutCompletion.findMany({
    include: {
      workout: {
        include: {
          _count: {
            select: { exercises: true }
          }
        }
      }
    },
    orderBy: {
      completedAt: 'desc'
    },
    take: 50
  })
  
  return completions
}

async function getHistoryStats() {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const [totalCompletions, thisWeek, thisMonth, totalDuration] = await Promise.all([
    prisma.workoutCompletion.count(),
    prisma.workoutCompletion.count({
      where: {
        completedAt: {
          gte: startOfWeek
        }
      }
    }),
    prisma.workoutCompletion.count({
      where: {
        completedAt: {
          gte: startOfMonth
        }
      }
    }),
    prisma.workoutCompletion.aggregate({
      _sum: {
        duration: true
      }
    })
  ])
  
  return {
    totalCompletions,
    thisWeek,
    thisMonth,
    totalDuration: totalDuration._sum.duration || 0
  }
}

function formatDate(date: Date) {
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays === 0) return 'Today'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export default async function HistoryPage() {
  const [history, stats] = await Promise.all([
    getWorkoutHistory(),
    getHistoryStats()
  ])
  
  // Group by date
  const groupedHistory = history.reduce((groups, completion) => {
    const date = completion.completedAt.toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(completion)
    return groups
  }, {} as Record<string, typeof history>)
  
  return (
    <PageLayout title="History" description="Your workout journey">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <Trophy className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Total Workouts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week/Month Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-lg font-bold">{stats.thisWeek}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-lg font-bold">{stats.thisMonth}</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Workout History */}
      <div className="space-y-6">
        {Object.entries(groupedHistory).length > 0 ? (
          Object.entries(groupedHistory).map(([dateString, completions]) => {
            const date = new Date(dateString)
            return (
              <div key={dateString}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-2">
                  {formatDate(date)}
                </h3>
                
                <div className="space-y-3">
                  {completions.map((completion) => (
                    <Card key={completion.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {completion.workout.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {completion.workout.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {completion.workout._count.exercises} exercises
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right text-sm">
                            <p className="font-medium">
                              {completion.completedAt.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                            {completion.duration && (
                              <p className="text-muted-foreground">
                                {formatDuration(completion.duration)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      {completion.notes && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">
                            {completion.notes}
                          </p>
                        </CardContent>
                      )}
                      
                      <CardContent className="pt-0 flex gap-2">
                        <Link href={`/workouts/${completion.workout.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Repeat className="h-4 w-4 mr-2" />
                            Repeat Workout
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No workout history yet.
                <br />
                Complete your first workout to see it here!
              </p>
              <Link href="/workouts">
                <Button>
                  Browse Workouts
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}