import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageLayout } from '@/components/page-layout'
import { prisma } from '@/lib/prisma'
import { TrendingUp, Calendar, Target, Award, Clock, Flame } from 'lucide-react'

async function getProgressStats() {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  
  const [
    totalStats,
    weekStats,
    monthStats,
    threeMonthStats,
    recentCompletions
  ] = await Promise.all([
    // Total stats
    prisma.workoutCompletion.aggregate({
      _count: { id: true },
      _sum: { duration: true },
      _avg: { duration: true }
    }),
    // This week
    prisma.workoutCompletion.aggregate({
      where: { completedAt: { gte: oneWeekAgo } },
      _count: { id: true },
      _sum: { duration: true }
    }),
    // This month
    prisma.workoutCompletion.aggregate({
      where: { completedAt: { gte: oneMonthAgo } },
      _count: { id: true },
      _sum: { duration: true }
    }),
    // Last 3 months
    prisma.workoutCompletion.aggregate({
      where: { completedAt: { gte: threeMonthsAgo } },
      _count: { id: true },
      _sum: { duration: true }
    }),
    // Recent completions for streak calculation
    prisma.workoutCompletion.findMany({
      where: {
        completedAt: {
          gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // Last 14 days
        }
      },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true }
    })
  ])
  
  return {
    total: {
      workouts: totalStats._count.id,
      duration: totalStats._sum.duration || 0,
      avgDuration: Math.round(totalStats._avg.duration || 0)
    },
    week: {
      workouts: weekStats._count.id,
      duration: weekStats._sum.duration || 0
    },
    month: {
      workouts: monthStats._count.id,
      duration: monthStats._sum.duration || 0
    },
    threeMonth: {
      workouts: threeMonthStats._count.id,
      duration: threeMonthStats._sum.duration || 0
    },
    recentCompletions
  }
}

async function getCategoryStats() {
  // Get workouts completed in the last 3 months grouped by category
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  
  const completions = await prisma.workoutCompletion.findMany({
    where: {
      completedAt: { gte: threeMonthsAgo }
    },
    include: {
      workout: {
        select: { category: true }
      }
    }
  })
  
  const categoryStats = completions.reduce((acc, completion) => {
    const category = completion.workout.category
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5) // Top 5 categories
}

function calculateStreak(completions: { completedAt: Date }[]) {
  if (completions.length === 0) return 0
  
  const dates = completions.map(c => {
    const date = new Date(c.completedAt)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  })
  
  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a)
  
  let streak = 0
  const today = new Date()
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = todayTime - (i * 24 * 60 * 60 * 1000)
    if (uniqueDates[i] === expectedDate) {
      streak++
    } else if (i === 0 && uniqueDates[i] === todayTime - 24 * 60 * 60 * 1000) {
      // If we didn't work out today but did yesterday, start counting from yesterday
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export default async function ProgressPage() {
  const [stats, categoryStats] = await Promise.all([
    getProgressStats(),
    getCategoryStats()
  ])
  
  const currentStreak = calculateStreak(stats.recentCompletions)
  
  return (
    <PageLayout title="Progress" description="Track your fitness journey">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <Flame className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Target className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-2xl font-bold">{stats.total.workouts}</p>
              <p className="text-xs text-muted-foreground">Total Workouts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Periods */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">Activity Overview</h2>
        
        <div className="grid gap-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  This Week
                </CardTitle>
                <Badge variant="secondary">
                  {stats.week.workouts} workouts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Time:</span>
                <span className="font-medium">{formatDuration(stats.week.duration)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  This Month
                </CardTitle>
                <Badge variant="secondary">
                  {stats.month.workouts} workouts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Time:</span>
                <span className="font-medium">{formatDuration(stats.month.duration)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Last 3 Months
                </CardTitle>
                <Badge variant="secondary">
                  {stats.threeMonth.workouts} workouts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Time:</span>
                <span className="font-medium">{formatDuration(stats.threeMonth.duration)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">Favorite Categories</h2>
        
        <div className="space-y-3">
          {categoryStats.length > 0 ? (
            categoryStats.map(([category, count]) => {
              const percentage = stats.threeMonth.workouts > 0 
                ? Math.round((count / stats.threeMonth.workouts) * 100)
                : 0
              
              return (
                <Card key={category}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{category}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} workouts ({percentage}%)
                      </p>
                    </div>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Award className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  Complete more workouts to see your category breakdown!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Achievement Milestones */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Achievements</h2>
        
        <div className="grid gap-3">
          <Card className={stats.total.workouts >= 1 ? "border-primary" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  stats.total.workouts >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">First Workout</p>
                  <p className="text-sm text-muted-foreground">Complete your first workout</p>
                </div>
              </div>
              {stats.total.workouts >= 1 && (
                <Badge variant="secondary">Completed!</Badge>
              )}
            </CardContent>
          </Card>
          
          <Card className={stats.total.workouts >= 10 ? "border-primary" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  stats.total.workouts >= 10 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Getting Started</p>
                  <p className="text-sm text-muted-foreground">Complete 10 workouts</p>
                </div>
              </div>
              <div className="text-right">
                {stats.total.workouts >= 10 ? (
                  <Badge variant="secondary">Completed!</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {stats.total.workouts}/10
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className={currentStreak >= 7 ? "border-primary" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  currentStreak >= 7 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Week Warrior</p>
                  <p className="text-sm text-muted-foreground">Maintain a 7-day streak</p>
                </div>
              </div>
              <div className="text-right">
                {currentStreak >= 7 ? (
                  <Badge variant="secondary">Completed!</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {currentStreak}/7 days
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className={stats.total.duration >= 1000 ? "border-primary" : ""}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  stats.total.duration >= 1000 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Time Champion</p>
                  <p className="text-sm text-muted-foreground">Accumulate 1000+ minutes</p>
                </div>
              </div>
              <div className="text-right">
                {stats.total.duration >= 1000 ? (
                  <Badge variant="secondary">Completed!</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {stats.total.duration}/1000 min
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}