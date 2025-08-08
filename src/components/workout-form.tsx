'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WORKOUT_CATEGORIES } from '@/components/category-filter'
import type { CreateWorkoutRequest, WorkoutResponse } from '@/types/api'

// Form validation schema
const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  reps: z.number().int().positive().optional().nullable(),
  sets: z.number().int().positive().optional().nullable(),
  duration: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  order: z.number().int().nonnegative()
})

const workoutFormSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required')
})

type WorkoutFormData = z.infer<typeof workoutFormSchema>

interface WorkoutFormProps {
  initialData?: WorkoutResponse | null
  onSubmit: (data: CreateWorkoutRequest) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitLabel?: string
  cancelLabel?: string
  className?: string
}

export function WorkoutForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Workout',
  cancelLabel = 'Cancel',
  className
}: WorkoutFormProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      exercises: initialData?.exercises?.map((ex, index) => ({
        name: ex.name,
        reps: ex.reps,
        sets: ex.sets,
        duration: ex.duration,
        notes: ex.notes,
        order: index
      })) || [createEmptyExercise(0)]
    }
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'exercises'
  })

  // Create new empty exercise
  function createEmptyExercise(order: number) {
    return {
      name: '',
      reps: null,
      sets: null,
      duration: null,
      notes: null,
      order
    }
  }

  // Add new exercise
  const addExercise = () => {
    append(createEmptyExercise(fields.length))
  }

  // Remove exercise
  const removeExercise = (index: number) => {
    if (fields.length > 1) {
      remove(index)
      // Update order values for remaining exercises
      fields.forEach((_, i) => {
        if (i > index) {
          setValue(`exercises.${i - 1}.order`, i - 1)
        }
      })
    }
  }

  // Handle form submission
  const onFormSubmit = async (data: WorkoutFormData) => {
    try {
      // Convert form data to API format
      const workoutData: CreateWorkoutRequest = {
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        exercises: data.exercises.map((ex, index) => ({
          name: ex.name,
          reps: ex.reps || undefined,
          sets: ex.sets || undefined,
          duration: ex.duration || undefined,
          notes: ex.notes || undefined,
          order: index
        }))
      }

      await onSubmit(workoutData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      move(draggedIndex, dropIndex)
      // Update order values
      setTimeout(() => {
        fields.forEach((_, index) => {
          setValue(`exercises.${index}.order`, index)
        })
      }, 0)
    }
    
    setDraggedIndex(null)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={cn("space-y-6", className)}>
      {/* Basic workout info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Workout name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Upper Body Strength"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your workout..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select 
              value={watch('category')} 
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {WORKOUT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.category.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Exercises ({fields.length})
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExercise}
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.exercises?.root && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.exercises.root.message}
            </p>
          )}

          {fields.map((field, index) => (
            <ExerciseFormItem
              key={field.id}
              index={index}
              register={register}
              errors={errors}
              onRemove={() => removeExercise(index)}
              canRemove={fields.length > 1}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              isDragging={draggedIndex === index}
            />
          ))}
        </CardContent>
      </Card>

      {/* Form actions */}
      <div className="flex flex-col gap-3 pb-6">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full"
          disabled={isLoading || !isDirty}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {submitLabel}
        </Button>
        
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            onClick={onCancel}
            disabled={isLoading}
            className="w-full"
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  )
}

// Individual exercise form item component
interface ExerciseFormItemProps {
  index: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any
  onRemove: () => void
  canRemove: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  isDragging: boolean
}

function ExerciseFormItem({
  index,
  register,
  errors,
  onRemove,
  canRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging
}: ExerciseFormItemProps) {
  return (
    <Card 
      className={cn(
        "relative transition-all duration-200",
        isDragging && "opacity-50 scale-95 rotate-2"
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div className="flex items-center justify-center mt-6 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Exercise number */}
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium flex-shrink-0 mt-4">
            {index + 1}
          </div>
          
          {/* Exercise form fields */}
          <div className="flex-1 space-y-4">
            {/* Exercise name */}
            <div className="space-y-1">
              <Label htmlFor={`exercises.${index}.name`}>Exercise Name *</Label>
              <Input
                {...register(`exercises.${index}.name`)}
                placeholder="e.g., Push-ups"
                className={errors.exercises?.[index]?.name ? 'border-destructive' : ''}
              />
              {errors.exercises?.[index]?.name && (
                <p className="text-xs text-destructive">
                  {errors.exercises[index].name.message}
                </p>
              )}
            </div>

            {/* Sets and Reps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`exercises.${index}.sets`}>Sets</Label>
                <Input
                  type="number"
                  min="1"
                  {...register(`exercises.${index}.sets`, { 
                    setValueAs: (v) => v === '' ? null : parseInt(v) 
                  })}
                  placeholder="3"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`exercises.${index}.reps`}>Reps</Label>
                <Input
                  type="number"
                  min="1"
                  {...register(`exercises.${index}.reps`, { 
                    setValueAs: (v) => v === '' ? null : parseInt(v) 
                  })}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <Label htmlFor={`exercises.${index}.duration`}>Duration</Label>
              <Input
                {...register(`exercises.${index}.duration`)}
                placeholder="e.g., 30 seconds, 2 minutes"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor={`exercises.${index}.notes`}>Notes</Label>
              <Textarea
                {...register(`exercises.${index}.notes`)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>

          {/* Remove button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={!canRemove}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0 mt-4"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}