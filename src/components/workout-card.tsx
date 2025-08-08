'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Play, Clock, Users, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkoutResponse } from '@/types/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface WorkoutCardProps {
  workout: WorkoutResponse
  onFavoriteToggle?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  showActions?: boolean
  className?: string
}

export function WorkoutCard({ 
  workout, 
  onFavoriteToggle, 
  onDelete, 
  showActions = false,
  className 
}: WorkoutCardProps) {
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!onFavoriteToggle || isFavoriteLoading) return
    
    setIsFavoriteLoading(true)
    try {
      await onFavoriteToggle(workout.id)
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || isDeleteLoading) return
    
    setIsDeleteLoading(true)
    try {
      await onDelete(workout.id)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <Card className={cn("relative group hover:shadow-md transition-shadow", className)}>
      {/* Favorite heart - always visible if favorite, or on hover */}
      {(workout.isFavorite || onFavoriteToggle) && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-3 right-3 z-10 h-8 w-8 p-0",
            !workout.isFavorite && "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
          onClick={handleFavoriteToggle}
          disabled={isFavoriteLoading}
        >
          <Heart 
            className={cn(
              "h-4 w-4",
              workout.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
            )} 
          />
        </Button>
      )}

      {/* Actions menu */}
      {showActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-3 right-12 z-10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/workouts/${workout.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={handleDelete}
              disabled={isDeleteLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between pr-16">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{workout.name}</CardTitle>
            {workout.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {workout.description}
              </CardDescription>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="text-xs">
            {workout.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {workout.exerciseCount || workout.exercises?.length || 0} exercises
          </span>
          {(workout.completionCount || 0) > 0 && (
            <span className="text-xs text-muted-foreground">
              • {workout.completionCount} completions
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Exercise preview */}
        {workout.exercises && workout.exercises.length > 0 && (
          <div className="mb-4 space-y-1">
            {workout.exercises.slice(0, 2).map((exercise) => (
              <p key={exercise.id} className="text-sm text-muted-foreground line-clamp-1">
                {exercise.name}
                {exercise.sets && exercise.reps && ` • ${exercise.sets}×${exercise.reps}`}
                {exercise.duration && ` • ${exercise.duration}`}
              </p>
            ))}
            {workout.exercises.length > 2 && (
              <p className="text-xs text-muted-foreground font-medium">
                +{workout.exercises.length - 2} more exercises
              </p>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {workout.lastCompleted && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Last: {new Date(workout.lastCompleted).toLocaleDateString()}
              </span>
            </div>
          )}
          {(workout.completionCount || 0) > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{workout.completionCount} times</span>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Link href={`/workouts/${workout.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </Link>
          
          <Link href={`/workouts/${workout.id}?preview=true`}>
            <Button variant="outline" size="sm">
              Preview
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}