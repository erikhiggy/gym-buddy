'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLayout } from '@/components/page-layout'
import { WorkoutCard } from '@/components/workout-card'
import { SearchBar } from '@/components/search-bar'
import { CategoryFilter } from '@/components/category-filter'
import { useWorkouts, useWorkoutMutations } from '@/hooks/useWorkouts'
import { Search, Plus, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function WorkoutsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { 
    workouts, 
    loading, 
    error, 
    refresh
  } = useWorkouts({
    search: searchQuery || undefined,
    category: selectedCategory || undefined
  })

  const { toggleFavorite, deleteWorkout } = useWorkoutMutations()

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  // Handle category filter
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
  }

  // Handle favorite toggle
  const handleFavoriteToggle = async (workoutId: string) => {
    try {
      await toggleFavorite(workoutId)
      refresh() // Refresh the list to show updated state
      toast.success('Favorite updated!')
    } catch (error) {
      toast.error('Failed to update favorite')
    }
  }

  // Handle workout deletion
  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return
    }

    try {
      await deleteWorkout(workoutId)
      refresh() // Refresh the list
      toast.success('Workout deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete workout')
    }
  }

  const hasFilters = searchQuery || selectedCategory
  const filteredWorkoutsCount = workouts.length

  return (
    <PageLayout title="Workouts" description="Choose your workout">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "transition-colors",
            (hasFilters || showFilters) && "bg-primary/10 text-primary"
          )}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
              {[searchQuery, selectedCategory].filter(Boolean).length}
            </span>
          )}
        </Button>

        <Link href="/workouts/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className={cn(
        "space-y-4 mb-6 transition-all duration-300",
        showFilters ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden"
      )}>
        <SearchBar
          placeholder="Search workouts..."
          defaultValue={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        {/* Clear filters */}
        {hasFilters && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {filteredWorkoutsCount} workout{filteredWorkoutsCount !== 1 ? 's' : ''} found
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workouts List */}
      {!loading && !error && (
        <>
          {workouts.length > 0 ? (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onFavoriteToggle={handleFavoriteToggle}
                  onDelete={handleDeleteWorkout}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  {hasFilters
                    ? "No workouts found matching your filters."
                    : "No workouts available yet."
                  }
                </p>
                <div className="flex gap-3">
                  {hasFilters ? (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory(null)
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Link href="/workouts/new">
                      <Button>
                        Create Your First Workout
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Results summary */}
      {!loading && !error && workouts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-6 pb-6">
          Showing {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
          {hasFilters && ' matching your filters'}
        </div>
      )}
    </PageLayout>
  )
}