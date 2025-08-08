'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Edit, Trash2, Timer, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExerciseResponse } from '@/types/api'

interface ExerciseItemProps {
  exercise: ExerciseResponse
  index: number
  isEditable?: boolean
  isDragging?: boolean
  onEdit?: (exercise: ExerciseResponse) => void
  onDelete?: (exerciseId: string) => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  className?: string
}

export function ExerciseItem({
  exercise,
  index,
  isEditable = false,
  isDragging = false,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  className
}: ExerciseItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return
    
    setIsDeleting(true)
    try {
      await onDelete(exercise.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(exercise)
    }
  }

  return (
    <Card 
      className={cn(
        "relative transition-all duration-200",
        isDragging && "opacity-50 scale-95",
        isEditable && "hover:shadow-md",
        className
      )}
      draggable={isEditable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle (only in edit mode) */}
          {isEditable && (
            <div className="flex items-center justify-center mt-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {/* Exercise number */}
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium flex-shrink-0 mt-0.5">
            {index + 1}
          </div>
          
          {/* Exercise content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-base leading-6 truncate pr-2">
                {exercise.name}
              </h3>
              
              {/* Edit actions (only in edit mode) */}
              {isEditable && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Exercise details */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              {exercise.sets && exercise.reps && (
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{exercise.sets}</span> sets × <span className="font-medium text-foreground">{exercise.reps}</span> reps
                  </span>
                </div>
              )}
              
              {exercise.duration && (
                <div className="flex items-center gap-1.5">
                  <Timer className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{exercise.duration}</span>
                  </span>
                </div>
              )}
              
              {!exercise.sets && !exercise.reps && !exercise.duration && (
                <Badge variant="outline" className="text-xs">
                  Custom exercise
                </Badge>
              )}
            </div>
            
            {/* Exercise notes */}
            {exercise.notes && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {exercise.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading skeleton component for exercise items
export function ExerciseItemSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty state for when there are no exercises
export function ExerciseItemEmpty({ 
  message = "No exercises added yet",
  showAddButton = true,
  onAddClick
}: { 
  message?: string
  showAddButton?: boolean
  onAddClick?: () => void
}) {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Hash className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-center mb-4">
          {message}
        </p>
        {showAddButton && onAddClick && (
          <Button onClick={onAddClick} variant="outline" size="sm">
            Add Exercise
          </Button>
        )}
      </CardContent>
    </Card>
  )
}